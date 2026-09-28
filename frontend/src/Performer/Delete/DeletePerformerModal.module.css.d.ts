declare namespace DeletePerformerModalModuleCssNamespace {
  export interface IDeletePerformerModalModuleCss {
    warningText: string;
  }
}

declare const DeletePerformerModalModuleCssModule: DeletePerformerModalModuleCssNamespace.IDeletePerformerModalModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DeletePerformerModalModuleCssNamespace.IDeletePerformerModalModuleCss;
};

export = DeletePerformerModalModuleCssModule;
