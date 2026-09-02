declare namespace AddSpecificationItemCssNamespace {
  export interface IAddSpecificationItemCss {
    actions: string;
    name: string;
    overlay: string;
    presetsMenu: string;
    presetsMenuButton: string;
    specification: string;
  }
}

declare const AddSpecificationItemCssModule: AddSpecificationItemCssNamespace.IAddSpecificationItemCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddSpecificationItemCssNamespace.IAddSpecificationItemCss;
};

export = AddSpecificationItemCssModule;
