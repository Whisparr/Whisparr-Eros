declare namespace EditAutoTaggingModalContentModuleCssNamespace {
  export interface IEditAutoTaggingModalContentModuleCss {
    addSpecification: string;
    autoTaggings: string;
    center: string;
    deleteButton: string;
    rightButtons: string;
  }
}

declare const EditAutoTaggingModalContentModuleCssModule: EditAutoTaggingModalContentModuleCssNamespace.IEditAutoTaggingModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditAutoTaggingModalContentModuleCssNamespace.IEditAutoTaggingModalContentModuleCss;
};

export = EditAutoTaggingModalContentModuleCssModule;
