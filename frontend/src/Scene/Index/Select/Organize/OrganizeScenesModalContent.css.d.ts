declare namespace OrganizeScenesModalContentCssNamespace {
  export interface IOrganizeScenesModalContentCss {
    message: string;
    renameIcon: string;
  }
}

declare const OrganizeScenesModalContentCssModule: OrganizeScenesModalContentCssNamespace.IOrganizeScenesModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: OrganizeScenesModalContentCssNamespace.IOrganizeScenesModalContentCss;
};

export = OrganizeScenesModalContentCssModule;
