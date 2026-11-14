import '../../src/Styles/globals.css';
import '../../src/index.css';

if (document.readyState === 'loading') {
  await new Promise<void>((resolve) =>
    document.addEventListener('DOMContentLoaded', () => resolve(), {
      once: true,
    })
  );
}

await import('./mount');
export {};
