declare namespace WorkPosterCardCssNamespace {
  export interface IWorkPosterCardCss {
    content: string;
    link: string;
    poster: string;
    title: string;
    year: string;
  }
}

declare const WorkPosterCardCssModule: WorkPosterCardCssNamespace.IWorkPosterCardCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: WorkPosterCardCssNamespace.IWorkPosterCardCss;
};

export = WorkPosterCardCssModule;
