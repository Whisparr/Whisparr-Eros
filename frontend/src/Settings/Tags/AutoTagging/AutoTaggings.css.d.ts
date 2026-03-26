declare namespace AutoTaggingsCssNamespace {
  export interface IAutoTaggingsCss {
    addAutoTagging: string;
    autoTaggings: string;
    center: string;
  }
}

declare const AutoTaggingsCssModule: AutoTaggingsCssNamespace.IAutoTaggingsCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AutoTaggingsCssNamespace.IAutoTaggingsCss;
};

export = AutoTaggingsCssModule;
