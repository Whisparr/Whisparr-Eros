declare namespace AddIndexerItemModuleCssNamespace {
  export interface IAddIndexerItemModuleCss {
    actions: string;
    indexer: string;
    name: string;
    overlay: string;
    presetsMenu: string;
    presetsMenuButton: string;
    underlay: string;
  }
}

declare const AddIndexerItemModuleCssModule: AddIndexerItemModuleCssNamespace.IAddIndexerItemModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddIndexerItemModuleCssNamespace.IAddIndexerItemModuleCss;
};

export = AddIndexerItemModuleCssModule;
