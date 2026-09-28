declare namespace OrganizeMoviesModalContentModuleCssNamespace {
  export interface IOrganizeMoviesModalContentModuleCss {
    message: string;
    renameIcon: string;
  }
}

declare const OrganizeMoviesModalContentModuleCssModule: OrganizeMoviesModalContentModuleCssNamespace.IOrganizeMoviesModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: OrganizeMoviesModalContentModuleCssNamespace.IOrganizeMoviesModalContentModuleCss;
};

export = OrganizeMoviesModalContentModuleCssModule;
