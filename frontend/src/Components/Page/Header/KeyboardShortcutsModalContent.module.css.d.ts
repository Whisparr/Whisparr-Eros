declare namespace KeyboardShortcutsModalContentModuleCssNamespace {
  export interface IKeyboardShortcutsModalContentModuleCss {
    key: string;
    shortcut: string;
  }
}

declare const KeyboardShortcutsModalContentModuleCssModule: KeyboardShortcutsModalContentModuleCssNamespace.IKeyboardShortcutsModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: KeyboardShortcutsModalContentModuleCssNamespace.IKeyboardShortcutsModalContentModuleCss;
};

export = KeyboardShortcutsModalContentModuleCssModule;
