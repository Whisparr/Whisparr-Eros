declare namespace FileBrowserModalContentModuleCssNamespace {
  export interface IFileBrowserModalContentModuleCss {
    faqLink: string;
    loading: string;
    mappedDrivesWarning: string;
    modalBody: string;
    pathInput: string;
    scroller: string;
  }
}

declare const FileBrowserModalContentModuleCssModule: FileBrowserModalContentModuleCssNamespace.IFileBrowserModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FileBrowserModalContentModuleCssNamespace.IFileBrowserModalContentModuleCss;
};

export = FileBrowserModalContentModuleCssModule;
