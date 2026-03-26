declare namespace OrganizeMoviesModalContentCssNamespace {
  export interface IOrganizeMoviesModalContentCss {
    message: string;
    renameIcon: string;
  }
}

declare const OrganizeMoviesModalContentCssModule: OrganizeMoviesModalContentCssNamespace.IOrganizeMoviesModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: OrganizeMoviesModalContentCssNamespace.IOrganizeMoviesModalContentCss;
};

export = OrganizeMoviesModalContentCssModule;
