declare namespace BlocklistRowCssNamespace {
  export interface IBlocklistRowCss {
    actions: string;
    indexer: string;
    languages: string;
    quality: string;
  }
}

declare const BlocklistRowCssModule: BlocklistRowCssNamespace.IBlocklistRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: BlocklistRowCssNamespace.IBlocklistRowCss;
};

export = BlocklistRowCssModule;
