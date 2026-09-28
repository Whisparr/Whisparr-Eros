declare namespace LabelModuleCssNamespace {
  export interface ILabelModuleCss {
    danger: string;
    default: string;
    disabled: string;
    info: string;
    inverse: string;
    label: string;
    large: string;
    medium: string;
    outline: string;
    primary: string;
    queue: string;
    small: string;
    success: string;
    warning: string;
  }
}

declare const LabelModuleCssModule: LabelModuleCssNamespace.ILabelModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LabelModuleCssNamespace.ILabelModuleCss;
};

export = LabelModuleCssModule;
