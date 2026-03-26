declare namespace HintedSelectInputSelectedValueCssNamespace {
  export interface IHintedSelectInputSelectedValueCss {
    hintText: string;
    selectedValue: string;
    valueText: string;
  }
}

declare const HintedSelectInputSelectedValueCssModule: HintedSelectInputSelectedValueCssNamespace.IHintedSelectInputSelectedValueCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: HintedSelectInputSelectedValueCssNamespace.IHintedSelectInputSelectedValueCss;
};

export = HintedSelectInputSelectedValueCssModule;
