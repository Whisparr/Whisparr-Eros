declare namespace FileBrowserRowModuleCssNamespace {
  export interface IFileBrowserRowModuleCss {
    type: string;
  }
}

declare const FileBrowserRowModuleCssModule: FileBrowserRowModuleCssNamespace.IFileBrowserRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FileBrowserRowModuleCssNamespace.IFileBrowserRowModuleCss;
};

export = FileBrowserRowModuleCssModule;
