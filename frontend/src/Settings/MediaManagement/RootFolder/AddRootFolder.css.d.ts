declare namespace AddRootFolderCssNamespace {
  export interface IAddRootFolderCss {
    addRootFolderButtonContainer: string;
    importButtonIcon: string;
  }
}

declare const AddRootFolderCssModule: AddRootFolderCssNamespace.IAddRootFolderCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddRootFolderCssNamespace.IAddRootFolderCss;
};

export = AddRootFolderCssModule;
