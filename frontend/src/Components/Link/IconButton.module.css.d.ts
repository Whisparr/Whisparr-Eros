declare namespace IconButtonModuleCssNamespace {
  export interface IIconButtonModuleCss {
    button: string;
    isDisabled: string;
  }
}

declare const IconButtonModuleCssModule: IconButtonModuleCssNamespace.IIconButtonModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: IconButtonModuleCssNamespace.IIconButtonModuleCss;
};

export = IconButtonModuleCssModule;
