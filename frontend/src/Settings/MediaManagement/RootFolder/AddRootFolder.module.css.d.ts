declare namespace AddRootFolderModuleCssNamespace {
  export interface IAddRootFolderModuleCss {
    addRootFolderButtonContainer: string;
    importButtonIcon: string;
  }
}

declare const AddRootFolderModuleCssModule: AddRootFolderModuleCssNamespace.IAddRootFolderModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddRootFolderModuleCssNamespace.IAddRootFolderModuleCss;
};

export = AddRootFolderModuleCssModule;
