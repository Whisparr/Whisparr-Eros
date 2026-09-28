declare namespace MetadataModuleCssNamespace {
  export interface IMetadataModuleCss {
    metadata: string;
    name: string;
    section: string;
  }
}

declare const MetadataModuleCssModule: MetadataModuleCssNamespace.IMetadataModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MetadataModuleCssNamespace.IMetadataModuleCss;
};

export = MetadataModuleCssModule;
