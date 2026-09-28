declare namespace FileBrowserModalModuleCssNamespace {
  export interface IFileBrowserModalModuleCss {
    modal: string;
  }
}

declare const FileBrowserModalModuleCssModule: FileBrowserModalModuleCssNamespace.IFileBrowserModalModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FileBrowserModalModuleCssNamespace.IFileBrowserModalModuleCss;
};

export = FileBrowserModalModuleCssModule;
