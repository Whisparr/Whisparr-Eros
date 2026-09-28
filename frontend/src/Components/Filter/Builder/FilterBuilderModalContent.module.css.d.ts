declare namespace FilterBuilderModalContentModuleCssNamespace {
  export interface IFilterBuilderModalContentModuleCss {
    label: string;
    labelContainer: string;
    labelInputContainer: string;
    rows: string;
  }
}

declare const FilterBuilderModalContentModuleCssModule: FilterBuilderModalContentModuleCssNamespace.IFilterBuilderModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FilterBuilderModalContentModuleCssNamespace.IFilterBuilderModalContentModuleCss;
};

export = FilterBuilderModalContentModuleCssModule;
