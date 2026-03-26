declare namespace FileBrowserModalContentCssNamespace {
  export interface IFileBrowserModalContentCss {
    faqLink: string;
    loading: string;
    mappedDrivesWarning: string;
    modalBody: string;
    pathInput: string;
    scroller: string;
  }
}

declare const FileBrowserModalContentCssModule: FileBrowserModalContentCssNamespace.IFileBrowserModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FileBrowserModalContentCssNamespace.IFileBrowserModalContentCss;
};

export = FileBrowserModalContentCssModule;
