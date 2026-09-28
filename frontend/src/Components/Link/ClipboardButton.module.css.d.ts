declare namespace ClipboardButtonModuleCssNamespace {
  export interface IClipboardButtonModuleCss {
    button: string;
    clipboardIconContainer: string;
    showStateIcon: string;
    stateIconContainer: string;
  }
}

declare const ClipboardButtonModuleCssModule: ClipboardButtonModuleCssNamespace.IClipboardButtonModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ClipboardButtonModuleCssNamespace.IClipboardButtonModuleCss;
};

export = ClipboardButtonModuleCssModule;
