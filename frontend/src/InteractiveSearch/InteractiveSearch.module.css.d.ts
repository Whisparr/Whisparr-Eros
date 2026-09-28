declare namespace InteractiveSearchModuleCssNamespace {
  export interface IInteractiveSearchModuleCss {
    alert: string;
    filterMenuContainer: string;
  }
}

declare const InteractiveSearchModuleCssModule: InteractiveSearchModuleCssNamespace.IInteractiveSearchModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: InteractiveSearchModuleCssNamespace.IInteractiveSearchModuleCss;
};

export = InteractiveSearchModuleCssModule;
