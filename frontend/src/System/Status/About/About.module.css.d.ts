declare namespace AboutModuleCssNamespace {
  export interface IAboutModuleCss {
    descriptionList: string;
  }
}

declare const AboutModuleCssModule: AboutModuleCssNamespace.IAboutModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AboutModuleCssNamespace.IAboutModuleCss;
};

export = AboutModuleCssModule;
