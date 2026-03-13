declare namespace StudioDetailsLinksCssNamespace {
  export interface IStudioDetailsLinksCss {
    link: string;
    linkLabel: string;
    links: string;
  }
}

declare const StudioDetailsLinksCssModule: StudioDetailsLinksCssNamespace.IStudioDetailsLinksCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StudioDetailsLinksCssNamespace.IStudioDetailsLinksCss;
};

export = StudioDetailsLinksCssModule;
