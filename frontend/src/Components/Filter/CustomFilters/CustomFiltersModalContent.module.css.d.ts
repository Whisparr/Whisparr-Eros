declare namespace CustomFiltersModalContentModuleCssNamespace {
  export interface ICustomFiltersModalContentModuleCss {
    addButtonContainer: string;
  }
}

declare const CustomFiltersModalContentModuleCssModule: CustomFiltersModalContentModuleCssNamespace.ICustomFiltersModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CustomFiltersModalContentModuleCssNamespace.ICustomFiltersModalContentModuleCss;
};

export = CustomFiltersModalContentModuleCssModule;
