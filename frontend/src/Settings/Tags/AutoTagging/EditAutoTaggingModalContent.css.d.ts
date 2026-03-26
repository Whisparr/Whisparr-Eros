declare namespace EditAutoTaggingModalContentCssNamespace {
  export interface IEditAutoTaggingModalContentCss {
    addSpecification: string;
    autoTaggings: string;
    center: string;
    deleteButton: string;
    rightButtons: string;
  }
}

declare const EditAutoTaggingModalContentCssModule: EditAutoTaggingModalContentCssNamespace.IEditAutoTaggingModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditAutoTaggingModalContentCssNamespace.IEditAutoTaggingModalContentCss;
};

export = EditAutoTaggingModalContentCssModule;
