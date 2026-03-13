declare namespace RootFolderSelectInputOptionCssNamespace {
  export interface IRootFolderSelectInputOptionCss {
    freeSpace: string;
    isMissing: string;
    isMobile: string;
    movieFolder: string;
    optionText: string;
    value: string;
  }
}

declare const RootFolderSelectInputOptionCssModule: RootFolderSelectInputOptionCssNamespace.IRootFolderSelectInputOptionCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: RootFolderSelectInputOptionCssNamespace.IRootFolderSelectInputOptionCss;
};

export = RootFolderSelectInputOptionCssModule;
