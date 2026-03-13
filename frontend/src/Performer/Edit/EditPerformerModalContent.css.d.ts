declare namespace EditPerformerModalContentCssNamespace {
  export interface IEditPerformerModalContentCss {
    container: string;
    info: string;
    overview: string;
    poster: string;
  }
}

declare const EditPerformerModalContentCssModule: EditPerformerModalContentCssNamespace.IEditPerformerModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditPerformerModalContentCssNamespace.IEditPerformerModalContentCss;
};

export = EditPerformerModalContentCssModule;
