declare namespace CardModuleCssNamespace {
  export interface ICardModuleCss {
    card: string;
    overlay: string;
    underlay: string;
  }
}

declare const CardModuleCssModule: CardModuleCssNamespace.ICardModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CardModuleCssNamespace.ICardModuleCss;
};

export = CardModuleCssModule;
