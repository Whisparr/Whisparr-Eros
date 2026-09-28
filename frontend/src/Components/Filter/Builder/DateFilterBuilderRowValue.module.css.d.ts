declare namespace DateFilterBuilderRowValueModuleCssNamespace {
  export interface IDateFilterBuilderRowValueModuleCss {
    container: string;
    numberInput: string;
    selectInput: string;
  }
}

declare const DateFilterBuilderRowValueModuleCssModule: DateFilterBuilderRowValueModuleCssNamespace.IDateFilterBuilderRowValueModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DateFilterBuilderRowValueModuleCssNamespace.IDateFilterBuilderRowValueModuleCss;
};

export = DateFilterBuilderRowValueModuleCssModule;
