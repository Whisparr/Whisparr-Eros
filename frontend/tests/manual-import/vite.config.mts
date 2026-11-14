import path from 'node:path';
import { defineConfig } from 'vite';
import appConfig from '../../vite.config.mts';

export default defineConfig({
  ...appConfig,
  root: import.meta.dirname,
  build: {
    ...appConfig.build,
    outDir: path.resolve(import.meta.dirname, '../../../_output/manual-import-test'),
    minify: false,
    rollupOptions: {
      input: path.join(import.meta.dirname, 'index.html'),
    },
  },
  resolve: {
    ...appConfig.resolve,
    alias: [
      {
        find: 'Commands/useCommands',
        replacement: path.join(import.meta.dirname, 'commands.ts'),
      },
      ...Object.entries(appConfig.resolve?.alias ?? {}).map(([find, replacement]) => ({
        find,
        replacement: replacement as string,
      })),
    ],
  },
});
