declare namespace DateFilterBuilderRowValueCssNamespace {
  export interface IDateFilterBuilderRowValueCss {
    container: string;
    numberInput: string;
    selectInput: string;
  }
}

declare const DateFilterBuilderRowValueCssModule: DateFilterBuilderRowValueCssNamespace.IDateFilterBuilderRowValueCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DateFilterBuilderRowValueCssNamespace.IDateFilterBuilderRowValueCss;
};

export = DateFilterBuilderRowValueCssModule;
