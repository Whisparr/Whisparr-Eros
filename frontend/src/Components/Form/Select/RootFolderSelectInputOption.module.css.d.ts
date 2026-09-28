declare namespace RootFolderSelectInputOptionModuleCssNamespace {
  export interface IRootFolderSelectInputOptionModuleCss {
    freeSpace: string;
    isMissing: string;
    isMobile: string;
    movieFolder: string;
    optionText: string;
    value: string;
  }
}

declare const RootFolderSelectInputOptionModuleCssModule: RootFolderSelectInputOptionModuleCssNamespace.IRootFolderSelectInputOptionModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: RootFolderSelectInputOptionModuleCssNamespace.IRootFolderSelectInputOptionModuleCss;
};

export = RootFolderSelectInputOptionModuleCssModule;
