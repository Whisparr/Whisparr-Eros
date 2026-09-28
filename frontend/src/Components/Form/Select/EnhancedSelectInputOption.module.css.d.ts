declare namespace EnhancedSelectInputOptionModuleCssNamespace {
  export interface IEnhancedSelectInputOptionModuleCss {
    iconContainer: string;
    isDisabled: string;
    isHidden: string;
    isMobile: string;
    isSelected: string;
    option: string;
    optionCheck: string;
    optionCheckInput: string;
  }
}

declare const EnhancedSelectInputOptionModuleCssModule: EnhancedSelectInputOptionModuleCssNamespace.IEnhancedSelectInputOptionModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EnhancedSelectInputOptionModuleCssNamespace.IEnhancedSelectInputOptionModuleCss;
};

export = EnhancedSelectInputOptionModuleCssModule;
