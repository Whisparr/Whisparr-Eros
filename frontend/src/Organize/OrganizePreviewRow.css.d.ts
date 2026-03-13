declare namespace OrganizePreviewRowCssNamespace {
  export interface IOrganizePreviewRowCss {
    path: string;
    row: string;
    selectedContainer: string;
  }
}

declare const OrganizePreviewRowCssModule: OrganizePreviewRowCssNamespace.IOrganizePreviewRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: OrganizePreviewRowCssNamespace.IOrganizePreviewRowCss;
};

export = OrganizePreviewRowCssModule;
