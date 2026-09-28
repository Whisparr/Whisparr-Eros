declare namespace ButtonModuleCssNamespace {
  export interface IButtonModuleCss {
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

declare const ButtonModuleCssModule: ButtonModuleCssNamespace.IButtonModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ButtonModuleCssNamespace.IButtonModuleCss;
};

export = ButtonModuleCssModule;
