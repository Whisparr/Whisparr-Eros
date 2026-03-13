declare namespace AddSpecificationModalContentCssNamespace {
  export interface IAddSpecificationModalContentCss {
    specifications: string;
  }
}

declare const AddSpecificationModalContentCssModule: AddSpecificationModalContentCssNamespace.IAddSpecificationModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddSpecificationModalContentCssNamespace.IAddSpecificationModalContentCss;
};

export = AddSpecificationModalContentCssModule;
