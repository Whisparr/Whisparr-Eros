declare namespace ManageIndexersModalRowCssNamespace {
  export interface IManageIndexersModalRowCss {
    enableAutomaticSearch: string;
    enableInteractiveSearch: string;
    enableRss: string;
    implementation: string;
    name: string;
    priority: string;
    tags: string;
  }
}

declare const ManageIndexersModalRowCssModule: ManageIndexersModalRowCssNamespace.IManageIndexersModalRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ManageIndexersModalRowCssNamespace.IManageIndexersModalRowCss;
};

export = ManageIndexersModalRowCssModule;
