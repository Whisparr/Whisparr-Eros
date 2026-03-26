declare namespace DeletePerformerModalCssNamespace {
  export interface IDeletePerformerModalCss {
    warningText: string;
  }
}

declare const DeletePerformerModalCssModule: DeletePerformerModalCssNamespace.IDeletePerformerModalCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DeletePerformerModalCssNamespace.IDeletePerformerModalCss;
};

export = DeletePerformerModalCssModule;
