declare namespace EditSpecificationModalContentCssNamespace {
  export interface IEditSpecificationModalContentCss {
    deleteButton: string;
  }
}

declare const EditSpecificationModalContentCssModule: EditSpecificationModalContentCssNamespace.IEditSpecificationModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditSpecificationModalContentCssNamespace.IEditSpecificationModalContentCss;
};

export = EditSpecificationModalContentCssModule;
