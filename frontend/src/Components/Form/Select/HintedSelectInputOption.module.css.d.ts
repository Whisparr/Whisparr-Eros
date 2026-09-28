declare namespace HintedSelectInputOptionModuleCssNamespace {
  export interface IHintedSelectInputOptionModuleCss {
    divider: string;
    hintText: string;
    isMobile: string;
    optionText: string;
  }
}

declare const HintedSelectInputOptionModuleCssModule: HintedSelectInputOptionModuleCssNamespace.IHintedSelectInputOptionModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: HintedSelectInputOptionModuleCssNamespace.IHintedSelectInputOptionModuleCss;
};

export = HintedSelectInputOptionModuleCssModule;
