import { ChildProcess, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, Plugin } from 'vite';
import { patchCssModules } from 'vite-css-modules';

// This file lives in frontend/, next to postcss.config.js; Vite's root is the
// repo root, where index.html is.
const repoRoot = path.resolve(import.meta.dirname, '..');
const src = path.join(import.meta.dirname, 'src');
const outDir = path.join(repoRoot, '_output/UI');
const contentDir = path.join(src, 'Content');

const vitePort = Number(process.env.WHISPARR_VITE_PORT ?? 6939);

// The app itself, which serves this dev server's UI while it runs.
const appUrl = 'http://localhost:6969';

function htmlFiles() {
  return readdirSync(src).filter((name) => name.endsWith('.html'));
}

function copyAllStaticContent() {
  mkdirSync(outDir, { recursive: true });

  cpSync(contentDir, path.join(outDir, 'Content'), { recursive: true });

  for (const file of htmlFiles()) {
    cpSync(path.join(src, file), path.join(outDir, file));
  }
}

function isStaticContent(file: string) {
  return (
    file.startsWith(contentDir) ||
    (path.dirname(file) === src && file.endsWith('.html'))
  );
}

// Content (fonts, images, icons) and the standalone HTML pages are served as
// they are, not bundled, so they are copied next to the build output.
function copyStaticContent(): Plugin {
  return {
    name: 'copy-static-content',

    buildStart() {
      for (const file of htmlFiles()) {
        this.addWatchFile(path.join(src, file));
      }

      this.addWatchFile(contentDir);
    },

    closeBundle() {
      copyAllStaticContent();
    },

    configureServer(server) {
      copyAllStaticContent();

      server.watcher.add([contentDir, path.join(src, '*.html')]);

      server.watcher.on(
        'add',
        (file) => isStaticContent(file) && copyAllStaticContent()
      );
      server.watcher.on(
        'change',
        (file) => isStaticContent(file) && copyAllStaticContent()
      );
    },
  };
}

// Keeps the generated *.module.css.d.ts files current while the dev server
// runs. `yarn typecheck` generates them once for CI.
// While `yarn start` runs, keep the backend's copies of the localization files
// in step with the source, so a debug build serves new keys without a rebuild.
function copyLocalization(): Plugin {
  const localizationDir = path.join(
    repoRoot,
    'src/NzbDrone.Core/Localization/Core'
  );

  // Every build and publish keeps its own copy, at whatever depth its layout
  // puts it: _output/net10.0, _output/net10.0/osx-arm64,
  // _output/net10.0/osx-arm64/publish and so on.
  function targetDirs() {
    const output = path.join(repoRoot, '_output');

    if (!existsSync(output)) {
      return [];
    }

    return readdirSync(output, { recursive: true, withFileTypes: true })
      .filter(
        (entry) =>
          entry.isDirectory() &&
          entry.name === 'Core' &&
          path.basename(entry.parentPath) === 'Localization'
      )
      .map((entry) => path.join(entry.parentPath, entry.name));
  }

  function copy(file: string) {
    for (const dir of targetDirs()) {
      cpSync(file, path.join(dir, path.basename(file)));
    }
  }

  function owns(file: string) {
    return path.dirname(file) === localizationDir && file.endsWith('.json');
  }

  return {
    name: 'copy-localization',
    apply: 'serve',

    configureServer(server) {
      for (const file of readdirSync(localizationDir)) {
        if (file.endsWith('.json')) {
          copy(path.join(localizationDir, file));
        }
      }

      server.watcher.add(localizationDir);

      server.watcher.on('add', (file) => owns(file) && copy(file));
      server.watcher.on('change', (file) => owns(file) && copy(file));
    },
  };
}

function cssModuleTypes(): Plugin {
  let child: ChildProcess | undefined;

  function stop() {
    child?.kill();
    child = undefined;
  }

  return {
    name: 'css-module-types',
    apply: 'serve',

    configureServer(server) {
      const bin = process.platform === 'win32' ? 'tcm.cmd' : 'tcm';

      child = spawn(
        path.join(repoRoot, 'node_modules', '.bin', bin),
        ['frontend/src', '--pattern', '**/*.module.css', '--watch'],
        {
          cwd: repoRoot,
          stdio: 'inherit',
          // Node won't spawn a .cmd without a shell on Windows.
          shell: process.platform === 'win32',
        }
      );

      server.httpServer?.on('close', stop);
      process.on('exit', stop);
    },
  };
}

// The UI is opened through the app, not on this server's own port: a debug build
// of the backend finds a running dev server by itself and serves its index.html
// and modules. A page load that lands here directly is sent there instead; the
// backend only ever asks for /index.html, never a page route.
function openThroughApp(): Plugin {
  return {
    name: 'open-through-app',
    apply: 'serve',

    configureServer(server) {
      server.printUrls = () => {
        server.config.logger.info(
          `\n  Open Whisparr at ${appUrl} -- a debug build serves this dev server's UI while it runs.\n`
        );
      };

      server.middlewares.use((req, res, next) => {
        if (
          req.method === 'GET' &&
          req.url !== '/index.html' &&
          req.headers.accept?.includes('text/html')
        ) {
          res.statusCode = 302;
          res.setHeader('Location', `${appUrl}${req.url ?? '/'}`);
          res.end();

          return;
        }

        next();
      });
    },
  };
}

// Class names keep the shape they had under webpack, Component-local-hash
// (PageSidebar-sidebarContainer-QPVG1): the automation tests and user themes
// match on the part before the hash.
function generateScopedName(localName: string, filename: string) {
  const file = filename.split('?')[0];
  const component = path.basename(file).replace(/(\.module)?\.css$/, '');

  const hash = createHash('md5')
    .update(`${path.relative(repoRoot, file)}\0${localName}`)
    .digest('base64url')
    .replace(/^[\d_-]+/, '')
    .slice(0, 5);

  return `${component}-${localName}-${hash}`;
}

// Every top-level folder under frontend/src is importable by name
// (Components/..., Utilities/...), as webpack's resolve.modules allowed.
const srcAliases = Object.fromEntries(
  readdirSync(src, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => [entry.name, path.join(src, entry.name)])
);

export default defineConfig({
  root: repoRoot,

  plugins: [
    patchCssModules({ exportMode: 'default' }),
    react(),
    copyStaticContent(),
    copyLocalization(),
    cssModuleTypes(),
    openThroughApp(),
  ],

  base: '/',

  server: {
    port: vitePort,
    strictPort: true,
    hmr: {
      clientPort: vitePort,
    },
  },

  build: {
    outDir,
    emptyOutDir: true,
    sourcemap: true,
    // The app has always shipped as one large bundle (webpack's came to about
    // 8 MB of JS). Splitting it is its own change, not part of the bundler swap.
    chunkSizeWarningLimit: 8192,
  },

  // index.html's own URLs stay absolute so the backend can prefix the URL
  // base; everything the bundle loads is relative to the file loading it, so
  // it works under any URL base without a runtime public path.
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'html') {
        return `/${filename}`;
      }

      return { relative: true };
    },
  },

  // moment's locale files import moment's ES build directly. Prebundling would
  // give the app a separate copy, so locales loaded at runtime never reach it.
  optimizeDeps: {
    exclude: ['moment'],
  },

  resolve: {
    alias: srcAliases,
  },

  css: {
    postcss: import.meta.dirname,
    modules: {
      generateScopedName,
    },
  },
});
