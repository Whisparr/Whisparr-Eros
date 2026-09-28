declare namespace AddSpecificationModalContentModuleCssNamespace {
  export interface IAddSpecificationModalContentModuleCss {
    specifications: string;
  }
}

declare const AddSpecificationModalContentModuleCssModule: AddSpecificationModalContentModuleCssNamespace.IAddSpecificationModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddSpecificationModalContentModuleCssNamespace.IAddSpecificationModalContentModuleCss;
};

export = AddSpecificationModalContentModuleCssModule;
