declare namespace IconButtonCssNamespace {
  export interface IIconButtonCss {
    button: string;
    isDisabled: string;
  }
}

declare const IconButtonCssModule: IconButtonCssNamespace.IIconButtonCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: IconButtonCssNamespace.IIconButtonCss;
};

export = IconButtonCssModule;
