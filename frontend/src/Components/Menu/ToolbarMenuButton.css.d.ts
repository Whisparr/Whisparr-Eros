declare namespace ToolbarMenuButtonCssNamespace {
  export interface IToolbarMenuButtonCss {
    indicatorContainer: string;
    label: string;
    labelContainer: string;
    menuButton: string;
  }
}

declare const ToolbarMenuButtonCssModule: ToolbarMenuButtonCssNamespace.IToolbarMenuButtonCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ToolbarMenuButtonCssNamespace.IToolbarMenuButtonCss;
};

export = ToolbarMenuButtonCssModule;
