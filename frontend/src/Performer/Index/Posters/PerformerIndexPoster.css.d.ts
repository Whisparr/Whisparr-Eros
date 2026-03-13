declare namespace PerformerIndexPosterCssNamespace {
  export interface IPerformerIndexPosterCss {
    action: string;
    age: string;
    ageIcon: string;
    container: string;
    content: string;
    controls: string;
    deleted: string;
    editorSelect: string;
    ethnicity: string;
    externalLinks: string;
    gender: string;
    hairColor: string;
    link: string;
    nextAiring: string;
    overlayTitle: string;
    poster: string;
    posterContainer: string;
    posterImageWrapper: string;
    progressBarOverlay: string;
    qualityProfile: string;
    sizeOnDisk: string;
    sizeOnDiskIcon: string;
    tags: string;
    tagsList: string;
    title: string;
    totalMovieCount: string;
    totalSceneCount: string;
  }
}

declare const PerformerIndexPosterCssModule: PerformerIndexPosterCssNamespace.IPerformerIndexPosterCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PerformerIndexPosterCssNamespace.IPerformerIndexPosterCss;
};

export = PerformerIndexPosterCssModule;
