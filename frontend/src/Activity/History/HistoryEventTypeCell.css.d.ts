declare namespace HistoryEventTypeCellCssNamespace {
  export interface IHistoryEventTypeCellCss {
    cell: string;
  }
}

declare const HistoryEventTypeCellCssModule: HistoryEventTypeCellCssNamespace.IHistoryEventTypeCellCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: HistoryEventTypeCellCssNamespace.IHistoryEventTypeCellCss;
};

export = HistoryEventTypeCellCssModule;
