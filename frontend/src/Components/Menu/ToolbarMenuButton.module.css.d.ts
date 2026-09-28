declare namespace ToolbarMenuButtonModuleCssNamespace {
  export interface IToolbarMenuButtonModuleCss {
    indicatorContainer: string;
    label: string;
    labelContainer: string;
    menuButton: string;
  }
}

declare const ToolbarMenuButtonModuleCssModule: ToolbarMenuButtonModuleCssNamespace.IToolbarMenuButtonModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ToolbarMenuButtonModuleCssNamespace.IToolbarMenuButtonModuleCss;
};

export = ToolbarMenuButtonModuleCssModule;
