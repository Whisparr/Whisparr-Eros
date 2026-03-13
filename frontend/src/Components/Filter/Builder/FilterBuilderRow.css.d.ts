declare namespace FilterBuilderRowCssNamespace {
  export interface IFilterBuilderRowCss {
    actionsContainer: string;
    filterRow: string;
    inputContainer: string;
    valueInputContainer: string;
  }
}

declare const FilterBuilderRowCssModule: FilterBuilderRowCssNamespace.IFilterBuilderRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FilterBuilderRowCssNamespace.IFilterBuilderRowCss;
};

export = FilterBuilderRowCssModule;
