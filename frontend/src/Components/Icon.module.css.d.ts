declare namespace IconModuleCssNamespace {
  export interface IIconModuleCss {
    danger: string;
    default: string;
    disabled: string;
    info: string;
    pink: string;
    primary: string;
    purple: string;
    success: string;
    warning: string;
  }
}

declare const IconModuleCssModule: IconModuleCssNamespace.IIconModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: IconModuleCssNamespace.IIconModuleCss;
};

export = IconModuleCssModule;
