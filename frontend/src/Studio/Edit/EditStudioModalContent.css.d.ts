declare namespace EditStudioModalContentCssNamespace {
  export interface IEditStudioModalContentCss {
    container: string;
    info: string;
    overview: string;
    poster: string;
  }
}

declare const EditStudioModalContentCssModule: EditStudioModalContentCssNamespace.IEditStudioModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditStudioModalContentCssNamespace.IEditStudioModalContentCss;
};

export = EditStudioModalContentCssModule;
