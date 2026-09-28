declare namespace AutoTaggingsModuleCssNamespace {
  export interface IAutoTaggingsModuleCss {
    addAutoTagging: string;
    autoTaggings: string;
    center: string;
  }
}

declare const AutoTaggingsModuleCssModule: AutoTaggingsModuleCssNamespace.IAutoTaggingsModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AutoTaggingsModuleCssNamespace.IAutoTaggingsModuleCss;
};

export = AutoTaggingsModuleCssModule;
