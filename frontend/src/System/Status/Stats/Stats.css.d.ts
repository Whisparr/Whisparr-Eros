declare namespace StatsCssNamespace {
  export interface IStatsCss {
    descriptionList: string;
  }
}

declare const StatsCssModule: StatsCssNamespace.IStatsCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StatsCssNamespace.IStatsCss;
};

export = StatsCssModule;
