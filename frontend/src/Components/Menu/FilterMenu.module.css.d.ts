declare namespace FilterMenuModuleCssNamespace {
  export interface IFilterMenuModuleCss {
    filterMenu: string;
  }
}

declare const FilterMenuModuleCssModule: FilterMenuModuleCssNamespace.IFilterMenuModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FilterMenuModuleCssNamespace.IFilterMenuModuleCss;
};

export = FilterMenuModuleCssModule;
