declare namespace OrganizePreviewModalContentModuleCssNamespace {
  export interface IOrganizePreviewModalContentModuleCss {
    group: string;
    groupTitle: string;
    path: string;
    previews: string;
    selectAllInput: string;
    selectAllInputContainer: string;
    standardMovieFormat: string;
  }
}

declare const OrganizePreviewModalContentModuleCssModule: OrganizePreviewModalContentModuleCssNamespace.IOrganizePreviewModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: OrganizePreviewModalContentModuleCssNamespace.IOrganizePreviewModalContentModuleCss;
};

export = OrganizePreviewModalContentModuleCssModule;
