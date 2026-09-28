declare namespace ParseResultItemModuleCssNamespace {
  export interface IParseResultItemModuleCss {
    item: string;
    title: string;
  }
}

declare const ParseResultItemModuleCssModule: ParseResultItemModuleCssNamespace.IParseResultItemModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ParseResultItemModuleCssNamespace.IParseResultItemModuleCss;
};

export = ParseResultItemModuleCssModule;
