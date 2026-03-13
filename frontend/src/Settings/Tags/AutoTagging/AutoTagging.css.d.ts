declare namespace AutoTaggingCssNamespace {
  export interface IAutoTaggingCss {
    autoTagging: string;
    cloneButton: string;
    formats: string;
    name: string;
    nameContainer: string;
    tooltipLabel: string;
  }
}

declare const AutoTaggingCssModule: AutoTaggingCssNamespace.IAutoTaggingCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AutoTaggingCssNamespace.IAutoTaggingCss;
};

export = AutoTaggingCssModule;
