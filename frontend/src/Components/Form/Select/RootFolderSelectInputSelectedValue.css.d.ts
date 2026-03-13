declare namespace RootFolderSelectInputSelectedValueCssNamespace {
  export interface IRootFolderSelectInputSelectedValueCss {
    freeSpace: string;
    isMissing: string;
    movieFolder: string;
    path: string;
    pathContainer: string;
    selectedValue: string;
  }
}

declare const RootFolderSelectInputSelectedValueCssModule: RootFolderSelectInputSelectedValueCssNamespace.IRootFolderSelectInputSelectedValueCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: RootFolderSelectInputSelectedValueCssNamespace.IRootFolderSelectInputSelectedValueCss;
};

export = RootFolderSelectInputSelectedValueCssModule;
