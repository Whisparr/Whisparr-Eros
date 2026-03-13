declare namespace MetadataCssNamespace {
  export interface IMetadataCss {
    metadata: string;
    name: string;
    section: string;
  }
}

declare const MetadataCssModule: MetadataCssNamespace.IMetadataCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MetadataCssNamespace.IMetadataCss;
};

export = MetadataCssModule;
