declare namespace EnhancedSelectInputSelectedValueCssNamespace {
  export interface IEnhancedSelectInputSelectedValueCss {
    isDisabled: string;
    selectedValue: string;
  }
}

declare const EnhancedSelectInputSelectedValueCssModule: EnhancedSelectInputSelectedValueCssNamespace.IEnhancedSelectInputSelectedValueCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EnhancedSelectInputSelectedValueCssNamespace.IEnhancedSelectInputSelectedValueCss;
};

export = EnhancedSelectInputSelectedValueCssModule;
