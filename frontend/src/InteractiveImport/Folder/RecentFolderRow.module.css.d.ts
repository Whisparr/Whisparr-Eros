declare namespace RecentFolderRowModuleCssNamespace {
  export interface IRecentFolderRowModuleCss {
    actions: string;
  }
}

declare const RecentFolderRowModuleCssModule: RecentFolderRowModuleCssNamespace.IRecentFolderRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: RecentFolderRowModuleCssNamespace.IRecentFolderRowModuleCss;
};

export = RecentFolderRowModuleCssModule;
