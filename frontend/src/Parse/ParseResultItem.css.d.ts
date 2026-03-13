declare namespace ParseResultItemCssNamespace {
  export interface IParseResultItemCss {
    item: string;
    title: string;
  }
}

declare const ParseResultItemCssModule: ParseResultItemCssNamespace.IParseResultItemCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ParseResultItemCssNamespace.IParseResultItemCss;
};

export = ParseResultItemCssModule;
