declare namespace CollectionFooterModuleCssNamespace {
  export interface ICollectionFooterModuleCss {
    addSelectedButton: string;
    buttonContainer: string;
    buttonContainerContent: string;
    buttons: string;
    excludeSelectedButton: string;
    inputContainer: string;
    selectedMovieLabel: string;
  }
}

declare const CollectionFooterModuleCssModule: CollectionFooterModuleCssNamespace.ICollectionFooterModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CollectionFooterModuleCssNamespace.ICollectionFooterModuleCss;
};

export = CollectionFooterModuleCssModule;
