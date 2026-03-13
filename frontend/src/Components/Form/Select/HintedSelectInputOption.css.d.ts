declare namespace HintedSelectInputOptionCssNamespace {
  export interface IHintedSelectInputOptionCss {
    divider: string;
    hintText: string;
    isMobile: string;
    optionText: string;
  }
}

declare const HintedSelectInputOptionCssModule: HintedSelectInputOptionCssNamespace.IHintedSelectInputOptionCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: HintedSelectInputOptionCssNamespace.IHintedSelectInputOptionCss;
};

export = HintedSelectInputOptionCssModule;
