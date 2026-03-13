declare namespace FileBrowserModalCssNamespace {
  export interface IFileBrowserModalCss {
    modal: string;
  }
}

declare const FileBrowserModalCssModule: FileBrowserModalCssNamespace.IFileBrowserModalCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FileBrowserModalCssNamespace.IFileBrowserModalCss;
};

export = FileBrowserModalCssModule;
