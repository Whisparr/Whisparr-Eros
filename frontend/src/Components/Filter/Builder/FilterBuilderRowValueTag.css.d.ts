declare namespace FilterBuilderRowValueTagCssNamespace {
  export interface IFilterBuilderRowValueTagCss {
    isLastTag: string;
    label: string;
    or: string;
    tag: string;
  }
}

declare const FilterBuilderRowValueTagCssModule: FilterBuilderRowValueTagCssNamespace.IFilterBuilderRowValueTagCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FilterBuilderRowValueTagCssNamespace.IFilterBuilderRowValueTagCss;
};

export = FilterBuilderRowValueTagCssModule;
