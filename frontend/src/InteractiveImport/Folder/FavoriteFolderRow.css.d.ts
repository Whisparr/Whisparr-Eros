declare namespace FavoriteFolderRowCssNamespace {
  export interface IFavoriteFolderRowCss {
    actions: string;
  }
}

declare const FavoriteFolderRowCssModule: FavoriteFolderRowCssNamespace.IFavoriteFolderRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FavoriteFolderRowCssNamespace.IFavoriteFolderRowCss;
};

export = FavoriteFolderRowCssModule;
