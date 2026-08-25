declare namespace DetailsPostersCssNamespace {
  export interface IDetailsPostersCss {
    row: string;
  }
}

declare const DetailsPostersCssModule: DetailsPostersCssNamespace.IDetailsPostersCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DetailsPostersCssNamespace.IDetailsPostersCss;
};

export = DetailsPostersCssModule;
