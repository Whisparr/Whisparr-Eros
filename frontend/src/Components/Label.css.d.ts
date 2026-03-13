declare namespace LabelCssNamespace {
  export interface ILabelCss {
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

declare const LabelCssModule: LabelCssNamespace.ILabelCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LabelCssNamespace.ILabelCss;
};

export = LabelCssModule;
