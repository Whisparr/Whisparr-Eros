/* eslint no-empty-function: 0, no-extend-native: 0 */

declare global {
  interface String {
    // Not a standard method -- it only exists because of the block below.
    // `filterTypePredicates` was its last caller until #549 rewrote it onto
    // `getFilterTypePredicate`, so nothing calls it now.
    contains?(searchString: string, startIndex?: number): boolean;
  }
}

// Each guard below is feature-detected and every browser that can run this app
// already has all three, so this module is inert in practice. Kept as-is:
// dropping a polyfill is a decision, not a conversion.

window.console = window.console || ({} as Console);

const nativeConsole = window.console as unknown as Record<string, () => void>;

nativeConsole.log = nativeConsole.log || function () {};
nativeConsole.group = nativeConsole.group || function () {};
nativeConsole.groupEnd = nativeConsole.groupEnd || function () {};
nativeConsole.debug = nativeConsole.debug || function () {};
nativeConsole.warn = nativeConsole.warn || function () {};
nativeConsole.assert = nativeConsole.assert || function () {};

if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, 'startsWith', {
    enumerable: false,
    configurable: false,
    writable: false,
    value(this: string, searchString: string, position?: number) {
      position = position || 0;
      return this.indexOf(searchString, position) === position;
    },
  });
}

if (!String.prototype.endsWith) {
  Object.defineProperty(String.prototype, 'endsWith', {
    enumerable: false,
    configurable: false,
    writable: false,
    value(this: string, searchString: string, position?: number) {
      position = position || this.length;
      position = position - searchString.length;
      const lastIndex = this.lastIndexOf(searchString);
      return lastIndex !== -1 && lastIndex === position;
    },
  });
}

if (!String.prototype.contains) {
  String.prototype.contains = function (str: string, startIndex?: number) {
    return String.prototype.indexOf.call(this, str, startIndex) !== -1;
  };
}

export {};
