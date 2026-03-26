declare namespace ParseResultCssNamespace {
  export interface IParseResultCss {
    column: string;
    container: string;
  }
}

declare const ParseResultCssModule: ParseResultCssNamespace.IParseResultCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ParseResultCssNamespace.IParseResultCss;
};

export = ParseResultCssModule;
