declare namespace StudioIndexPosterCssNamespace {
  export interface IStudioIndexPosterCss {
    action: string;
    container: string;
    content: string;
    controls: string;
    editorSelect: string;
    ended: string;
    externalLinks: string;
    link: string;
    monitorToggleButton: string;
    nextAiring: string;
    overlayTitle: string;
    poster: string;
    posterContainer: string;
    progressBarOverlay: string;
    qualityProfile: string;
    sizeOnDisk: string;
    sizeOnDiskIcon: string;
    studioLogo: string;
    title: string;
    totalMovieCount: string;
    totalSceneCount: string;
  }
}

declare const StudioIndexPosterCssModule: StudioIndexPosterCssNamespace.IStudioIndexPosterCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StudioIndexPosterCssNamespace.IStudioIndexPosterCss;
};

export = StudioIndexPosterCssModule;
