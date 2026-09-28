declare namespace FilterBuilderRowValueTagModuleCssNamespace {
  export interface IFilterBuilderRowValueTagModuleCss {
    isLastTag: string;
    label: string;
    or: string;
    tag: string;
  }
}

declare const FilterBuilderRowValueTagModuleCssModule: FilterBuilderRowValueTagModuleCssNamespace.IFilterBuilderRowValueTagModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FilterBuilderRowValueTagModuleCssNamespace.IFilterBuilderRowValueTagModuleCss;
};

export = FilterBuilderRowValueTagModuleCssModule;
