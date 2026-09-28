declare namespace AddSpecificationItemModuleCssNamespace {
  export interface IAddSpecificationItemModuleCss {
    actions: string;
    name: string;
    overlay: string;
    presetsMenu: string;
    presetsMenuButton: string;
    specification: string;
  }
}

declare const AddSpecificationItemModuleCssModule: AddSpecificationItemModuleCssNamespace.IAddSpecificationItemModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddSpecificationItemModuleCssNamespace.IAddSpecificationItemModuleCss;
};

export = AddSpecificationItemModuleCssModule;
