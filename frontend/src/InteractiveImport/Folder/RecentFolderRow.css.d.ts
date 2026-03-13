declare namespace RecentFolderRowCssNamespace {
  export interface IRecentFolderRowCss {
    actions: string;
  }
}

declare const RecentFolderRowCssModule: RecentFolderRowCssNamespace.IRecentFolderRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: RecentFolderRowCssNamespace.IRecentFolderRowCss;
};

export = RecentFolderRowCssModule;
