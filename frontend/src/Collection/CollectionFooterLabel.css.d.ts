declare namespace CollectionFooterLabelCssNamespace {
  export interface ICollectionFooterLabelCss {
    label: string;
    savingIcon: string;
  }
}

declare const CollectionFooterLabelCssModule: CollectionFooterLabelCssNamespace.ICollectionFooterLabelCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CollectionFooterLabelCssNamespace.ICollectionFooterLabelCss;
};

export = CollectionFooterLabelCssModule;
