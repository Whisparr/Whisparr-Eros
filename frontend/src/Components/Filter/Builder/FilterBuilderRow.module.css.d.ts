declare namespace FilterBuilderRowModuleCssNamespace {
  export interface IFilterBuilderRowModuleCss {
    actionsContainer: string;
    filterRow: string;
    inputContainer: string;
    valueInputContainer: string;
  }
}

declare const FilterBuilderRowModuleCssModule: FilterBuilderRowModuleCssNamespace.IFilterBuilderRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FilterBuilderRowModuleCssNamespace.IFilterBuilderRowModuleCss;
};

export = FilterBuilderRowModuleCssModule;
