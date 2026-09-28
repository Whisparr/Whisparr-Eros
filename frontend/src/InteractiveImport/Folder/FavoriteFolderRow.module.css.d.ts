declare namespace FavoriteFolderRowModuleCssNamespace {
  export interface IFavoriteFolderRowModuleCss {
    actions: string;
  }
}

declare const FavoriteFolderRowModuleCssModule: FavoriteFolderRowModuleCssNamespace.IFavoriteFolderRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FavoriteFolderRowModuleCssNamespace.IFavoriteFolderRowModuleCss;
};

export = FavoriteFolderRowModuleCssModule;
