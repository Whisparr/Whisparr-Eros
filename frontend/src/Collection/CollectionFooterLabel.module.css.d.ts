declare namespace CollectionFooterLabelModuleCssNamespace {
  export interface ICollectionFooterLabelModuleCss {
    label: string;
    savingIcon: string;
  }
}

declare const CollectionFooterLabelModuleCssModule: CollectionFooterLabelModuleCssNamespace.ICollectionFooterLabelModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CollectionFooterLabelModuleCssNamespace.ICollectionFooterLabelModuleCss;
};

export = CollectionFooterLabelModuleCssModule;
