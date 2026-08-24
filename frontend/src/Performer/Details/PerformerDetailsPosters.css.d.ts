declare namespace PerformerDetailsPostersCssNamespace {
  export interface IPerformerDetailsPostersCss {
    row: string;
  }
}

declare const PerformerDetailsPostersCssModule: PerformerDetailsPostersCssNamespace.IPerformerDetailsPostersCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PerformerDetailsPostersCssNamespace.IPerformerDetailsPostersCss;
};

export = PerformerDetailsPostersCssModule;
