declare namespace AutoTaggingModuleCssNamespace {
  export interface IAutoTaggingModuleCss {
    autoTagging: string;
    cloneButton: string;
    formats: string;
    name: string;
    nameContainer: string;
    tooltipLabel: string;
  }
}

declare const AutoTaggingModuleCssModule: AutoTaggingModuleCssNamespace.IAutoTaggingModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AutoTaggingModuleCssNamespace.IAutoTaggingModuleCss;
};

export = AutoTaggingModuleCssModule;
