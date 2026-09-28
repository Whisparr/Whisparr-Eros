declare namespace RootFolderRowModuleCssNamespace {
  export interface IRootFolderRowModuleCss {
    actions: string;
    freeSpace: string;
    importFiles: string;
    link: string;
    unavailableLabel: string;
    unavailablePath: string;
  }
}

declare const RootFolderRowModuleCssModule: RootFolderRowModuleCssNamespace.IRootFolderRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: RootFolderRowModuleCssNamespace.IRootFolderRowModuleCss;
};

export = RootFolderRowModuleCssModule;
