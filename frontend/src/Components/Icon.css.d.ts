declare namespace IconCssNamespace {
  export interface IIconCss {
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

declare const IconCssModule: IconCssNamespace.IIconCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: IconCssNamespace.IIconCss;
};

export = IconCssModule;
