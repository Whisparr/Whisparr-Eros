declare namespace SelectedMenuItemCssNamespace {
  export interface ISelectedMenuItemCss {
    isNotSelected: string;
    isSelected: string;
    item: string;
  }
}

declare const SelectedMenuItemCssModule: SelectedMenuItemCssNamespace.ISelectedMenuItemCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SelectedMenuItemCssNamespace.ISelectedMenuItemCss;
};

export = SelectedMenuItemCssModule;
