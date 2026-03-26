declare namespace FileBrowserRowCssNamespace {
  export interface IFileBrowserRowCss {
    type: string;
  }
}

declare const FileBrowserRowCssModule: FileBrowserRowCssNamespace.IFileBrowserRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FileBrowserRowCssNamespace.IFileBrowserRowCss;
};

export = FileBrowserRowCssModule;
