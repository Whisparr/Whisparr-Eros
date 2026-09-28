declare namespace EnhancedSelectInputSelectedValueModuleCssNamespace {
  export interface IEnhancedSelectInputSelectedValueModuleCss {
    isDisabled: string;
    selectedValue: string;
  }
}

declare const EnhancedSelectInputSelectedValueModuleCssModule: EnhancedSelectInputSelectedValueModuleCssNamespace.IEnhancedSelectInputSelectedValueModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EnhancedSelectInputSelectedValueModuleCssNamespace.IEnhancedSelectInputSelectedValueModuleCss;
};

export = EnhancedSelectInputSelectedValueModuleCssModule;
