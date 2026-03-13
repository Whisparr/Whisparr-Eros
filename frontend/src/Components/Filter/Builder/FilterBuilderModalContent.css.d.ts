declare namespace FilterBuilderModalContentCssNamespace {
  export interface IFilterBuilderModalContentCss {
    label: string;
    labelContainer: string;
    labelInputContainer: string;
    rows: string;
  }
}

declare const FilterBuilderModalContentCssModule: FilterBuilderModalContentCssNamespace.IFilterBuilderModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FilterBuilderModalContentCssNamespace.IFilterBuilderModalContentCss;
};

export = FilterBuilderModalContentCssModule;
