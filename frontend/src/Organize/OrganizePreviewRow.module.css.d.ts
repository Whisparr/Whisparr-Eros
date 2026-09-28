declare namespace OrganizePreviewRowModuleCssNamespace {
  export interface IOrganizePreviewRowModuleCss {
    path: string;
    row: string;
    selectedContainer: string;
  }
}

declare const OrganizePreviewRowModuleCssModule: OrganizePreviewRowModuleCssNamespace.IOrganizePreviewRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: OrganizePreviewRowModuleCssNamespace.IOrganizePreviewRowModuleCss;
};

export = OrganizePreviewRowModuleCssModule;
