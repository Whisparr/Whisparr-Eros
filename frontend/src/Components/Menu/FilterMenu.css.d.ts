declare namespace FilterMenuCssNamespace {
  export interface IFilterMenuCss {
    filterMenu: string;
  }
}

declare const FilterMenuCssModule: FilterMenuCssNamespace.IFilterMenuCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FilterMenuCssNamespace.IFilterMenuCss;
};

export = FilterMenuCssModule;
