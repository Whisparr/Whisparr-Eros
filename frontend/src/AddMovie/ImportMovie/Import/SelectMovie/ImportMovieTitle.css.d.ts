declare namespace ImportMovieTitleCssNamespace {
  export interface IImportMovieTitleCss {
    existing: string;
    performerIcon: string;
    performers: string;
    title: string;
    titleContainer: string;
    year: string;
  }
}

declare const ImportMovieTitleCssModule: ImportMovieTitleCssNamespace.IImportMovieTitleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportMovieTitleCssNamespace.IImportMovieTitleCss;
};

export = ImportMovieTitleCssModule;
