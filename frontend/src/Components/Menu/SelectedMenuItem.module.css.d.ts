declare namespace SelectedMenuItemModuleCssNamespace {
  export interface ISelectedMenuItemModuleCss {
    isNotSelected: string;
    isSelected: string;
    item: string;
  }
}

declare const SelectedMenuItemModuleCssModule: SelectedMenuItemModuleCssNamespace.ISelectedMenuItemModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SelectedMenuItemModuleCssNamespace.ISelectedMenuItemModuleCss;
};

export = SelectedMenuItemModuleCssModule;
