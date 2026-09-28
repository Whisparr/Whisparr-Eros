declare namespace StudioDetailsLinksModuleCssNamespace {
  export interface IStudioDetailsLinksModuleCss {
    link: string;
    linkLabel: string;
    links: string;
  }
}

declare const StudioDetailsLinksModuleCssModule: StudioDetailsLinksModuleCssNamespace.IStudioDetailsLinksModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StudioDetailsLinksModuleCssNamespace.IStudioDetailsLinksModuleCss;
};

export = StudioDetailsLinksModuleCssModule;
