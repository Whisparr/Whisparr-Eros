declare namespace ClipboardButtonCssNamespace {
  export interface IClipboardButtonCss {
    button: string;
    clipboardIconContainer: string;
    showStateIcon: string;
    stateIconContainer: string;
  }
}

declare const ClipboardButtonCssModule: ClipboardButtonCssNamespace.IClipboardButtonCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ClipboardButtonCssNamespace.IClipboardButtonCss;
};

export = ClipboardButtonCssModule;
