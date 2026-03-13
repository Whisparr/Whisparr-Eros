declare namespace AboutCssNamespace {
  export interface IAboutCss {
    descriptionList: string;
  }
}

declare const AboutCssModule: AboutCssNamespace.IAboutCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AboutCssNamespace.IAboutCss;
};

export = AboutCssModule;
