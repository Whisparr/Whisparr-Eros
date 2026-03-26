declare namespace UpdatesCssNamespace {
  export interface IUpdatesCss {
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

declare const UpdatesCssModule: UpdatesCssNamespace.IUpdatesCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: UpdatesCssNamespace.IUpdatesCss;
};

export = UpdatesCssModule;
