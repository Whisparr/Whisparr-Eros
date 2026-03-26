declare namespace InfoLabelCssNamespace {
  export interface IInfoLabelCss {
    label: string;
    large: string;
    medium: string;
    name: string;
    outline: string;
    small: string;
  }
}

declare const InfoLabelCssModule: InfoLabelCssNamespace.IInfoLabelCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: InfoLabelCssNamespace.IInfoLabelCss;
};

export = InfoLabelCssModule;
