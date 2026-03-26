declare namespace OrganizePreviewModalContentCssNamespace {
  export interface IOrganizePreviewModalContentCss {
    path: string;
    previews: string;
    selectAllInput: string;
    selectAllInputContainer: string;
    standardMovieFormat: string;
  }
}

declare const OrganizePreviewModalContentCssModule: OrganizePreviewModalContentCssNamespace.IOrganizePreviewModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: OrganizePreviewModalContentCssNamespace.IOrganizePreviewModalContentCss;
};

export = OrganizePreviewModalContentCssModule;
