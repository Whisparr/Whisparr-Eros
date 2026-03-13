declare namespace CustomFiltersModalContentCssNamespace {
  export interface ICustomFiltersModalContentCss {
    addButtonContainer: string;
  }
}

declare const CustomFiltersModalContentCssModule: CustomFiltersModalContentCssNamespace.ICustomFiltersModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CustomFiltersModalContentCssNamespace.ICustomFiltersModalContentCss;
};

export = CustomFiltersModalContentCssModule;
