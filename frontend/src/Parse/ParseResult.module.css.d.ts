declare namespace ParseResultModuleCssNamespace {
  export interface IParseResultModuleCss {
    column: string;
    container: string;
  }
}

declare const ParseResultModuleCssModule: ParseResultModuleCssNamespace.IParseResultModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ParseResultModuleCssNamespace.IParseResultModuleCss;
};

export = ParseResultModuleCssModule;
