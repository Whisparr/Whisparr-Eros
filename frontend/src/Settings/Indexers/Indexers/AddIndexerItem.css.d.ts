declare namespace AddIndexerItemCssNamespace {
  export interface IAddIndexerItemCss {
    actions: string;
    indexer: string;
    name: string;
    overlay: string;
    presetsMenu: string;
    presetsMenuButton: string;
    underlay: string;
  }
}

declare const AddIndexerItemCssModule: AddIndexerItemCssNamespace.IAddIndexerItemCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddIndexerItemCssNamespace.IAddIndexerItemCss;
};

export = AddIndexerItemCssModule;
