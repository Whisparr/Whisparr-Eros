declare namespace RootFolderRowCssNamespace {
  export interface IRootFolderRowCss {
    actions: string;
    freeSpace: string;
    importFiles: string;
    link: string;
    unavailableLabel: string;
    unavailablePath: string;
  }
}

declare const RootFolderRowCssModule: RootFolderRowCssNamespace.IRootFolderRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: RootFolderRowCssNamespace.IRootFolderRowCss;
};

export = RootFolderRowCssModule;
