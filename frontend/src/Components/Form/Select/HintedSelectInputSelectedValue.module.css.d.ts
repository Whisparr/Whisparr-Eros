declare namespace HintedSelectInputSelectedValueModuleCssNamespace {
  export interface IHintedSelectInputSelectedValueModuleCss {
    hintText: string;
    selectedValue: string;
    valueText: string;
  }
}

declare const HintedSelectInputSelectedValueModuleCssModule: HintedSelectInputSelectedValueModuleCssNamespace.IHintedSelectInputSelectedValueModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: HintedSelectInputSelectedValueModuleCssNamespace.IHintedSelectInputSelectedValueModuleCss;
};

export = HintedSelectInputSelectedValueModuleCssModule;
