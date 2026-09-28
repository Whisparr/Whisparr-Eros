declare namespace MetadatasModuleCssNamespace {
  export interface IMetadatasModuleCss {
    metadatas: string;
  }
}

declare const MetadatasModuleCssModule: MetadatasModuleCssNamespace.IMetadatasModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MetadatasModuleCssNamespace.IMetadatasModuleCss;
};

export = MetadatasModuleCssModule;
