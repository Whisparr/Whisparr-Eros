declare namespace StudioDetailsPostersCssNamespace {
  export interface IStudioDetailsPostersCss {
    link: string;
    movieCard: string;
    overlayTitle: string;
    poster: string;
    posterContainer: string;
    row: string;
    sceneCard: string;
    title: string;
  }
}

declare const StudioDetailsPostersCssModule: StudioDetailsPostersCssNamespace.IStudioDetailsPostersCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StudioDetailsPostersCssNamespace.IStudioDetailsPostersCss;
};

export = StudioDetailsPostersCssModule;
