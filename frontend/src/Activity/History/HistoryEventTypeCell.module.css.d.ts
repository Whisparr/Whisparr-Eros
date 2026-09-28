declare namespace HistoryEventTypeCellModuleCssNamespace {
  export interface IHistoryEventTypeCellModuleCss {
    cell: string;
  }
}

declare const HistoryEventTypeCellModuleCssModule: HistoryEventTypeCellModuleCssNamespace.IHistoryEventTypeCellModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: HistoryEventTypeCellModuleCssNamespace.IHistoryEventTypeCellModuleCss;
};

export = HistoryEventTypeCellModuleCssModule;
