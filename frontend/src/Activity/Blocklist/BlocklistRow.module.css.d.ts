declare namespace BlocklistRowModuleCssNamespace {
  export interface IBlocklistRowModuleCss {
    actions: string;
    indexer: string;
    languages: string;
    quality: string;
  }
}

declare const BlocklistRowModuleCssModule: BlocklistRowModuleCssNamespace.IBlocklistRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: BlocklistRowModuleCssNamespace.IBlocklistRowModuleCss;
};

export = BlocklistRowModuleCssModule;
