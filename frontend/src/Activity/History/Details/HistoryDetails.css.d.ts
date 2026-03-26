declare namespace HistoryDetailsCssNamespace {
  export interface IHistoryDetailsCss {
    description: string;
  }
}

declare const HistoryDetailsCssModule: HistoryDetailsCssNamespace.IHistoryDetailsCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: HistoryDetailsCssNamespace.IHistoryDetailsCss;
};

export = HistoryDetailsCssModule;
