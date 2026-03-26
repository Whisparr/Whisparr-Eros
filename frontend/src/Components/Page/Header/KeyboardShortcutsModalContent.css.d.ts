declare namespace KeyboardShortcutsModalContentCssNamespace {
  export interface IKeyboardShortcutsModalContentCss {
    key: string;
    shortcut: string;
  }
}

declare const KeyboardShortcutsModalContentCssModule: KeyboardShortcutsModalContentCssNamespace.IKeyboardShortcutsModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: KeyboardShortcutsModalContentCssNamespace.IKeyboardShortcutsModalContentCss;
};

export = KeyboardShortcutsModalContentCssModule;
