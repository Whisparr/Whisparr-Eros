declare namespace InteractiveSearchCssNamespace {
  export interface IInteractiveSearchCss {
    alert: string;
    filterMenuContainer: string;
  }
}

declare const InteractiveSearchCssModule: InteractiveSearchCssNamespace.IInteractiveSearchCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: InteractiveSearchCssNamespace.IInteractiveSearchCss;
};

export = InteractiveSearchCssModule;
