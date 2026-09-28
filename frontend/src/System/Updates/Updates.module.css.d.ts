declare namespace UpdatesModuleCssNamespace {
  export interface IUpdatesModuleCss {
    date: string;
    info: string;
    label: string;
    loading: string;
    message: string;
    messageContainer: string;
    space: string;
    upToDateIcon: string;
    update: string;
    version: string;
  }
}

declare const UpdatesModuleCssModule: UpdatesModuleCssNamespace.IUpdatesModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: UpdatesModuleCssNamespace.IUpdatesModuleCss;
};

export = UpdatesModuleCssModule;
