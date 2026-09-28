declare namespace ImportMovieTitleModuleCssNamespace {
  export interface IImportMovieTitleModuleCss {
    existing: string;
    performerIcon: string;
    performers: string;
    title: string;
    titleContainer: string;
    year: string;
  }
}

declare const ImportMovieTitleModuleCssModule: ImportMovieTitleModuleCssNamespace.IImportMovieTitleModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportMovieTitleModuleCssNamespace.IImportMovieTitleModuleCss;
};

export = ImportMovieTitleModuleCssModule;
