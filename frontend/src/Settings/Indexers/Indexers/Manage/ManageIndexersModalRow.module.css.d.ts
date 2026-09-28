declare namespace ManageIndexersModalRowModuleCssNamespace {
  export interface IManageIndexersModalRowModuleCss {
    enableAutomaticSearch: string;
    enableInteractiveSearch: string;
    enableRss: string;
    implementation: string;
    name: string;
    priority: string;
    protocol: string;
    tags: string;
  }
}

declare const ManageIndexersModalRowModuleCssModule: ManageIndexersModalRowModuleCssNamespace.IManageIndexersModalRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ManageIndexersModalRowModuleCssNamespace.IManageIndexersModalRowModuleCss;
};

export = ManageIndexersModalRowModuleCssModule;
