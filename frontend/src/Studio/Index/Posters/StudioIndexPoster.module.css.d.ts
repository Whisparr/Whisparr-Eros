declare namespace StudioIndexPosterModuleCssNamespace {
  export interface IStudioIndexPosterModuleCss {
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

declare const StudioIndexPosterModuleCssModule: StudioIndexPosterModuleCssNamespace.IStudioIndexPosterModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StudioIndexPosterModuleCssNamespace.IStudioIndexPosterModuleCss;
};

export = StudioIndexPosterModuleCssModule;
