declare namespace MetadatasCssNamespace {
  export interface IMetadatasCss {
    metadatas: string;
  }
}

declare const MetadatasCssModule: MetadatasCssNamespace.IMetadatasCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MetadatasCssNamespace.IMetadatasCss;
};

export = MetadatasCssModule;
