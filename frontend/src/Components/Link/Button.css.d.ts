declare namespace ButtonCssNamespace {
  export interface IButtonCss {
    button: string;
    center: string;
    danger: string;
    default: string;
    large: string;
    left: string;
    medium: string;
    primary: string;
    right: string;
    small: string;
    success: string;
    warning: string;
  }
}

declare const ButtonCssModule: ButtonCssNamespace.IButtonCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ButtonCssNamespace.IButtonCss;
};

export = ButtonCssModule;
