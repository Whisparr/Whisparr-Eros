declare namespace EnhancedSelectInputOptionCssNamespace {
  export interface IEnhancedSelectInputOptionCss {
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

declare const EnhancedSelectInputOptionCssModule: EnhancedSelectInputOptionCssNamespace.IEnhancedSelectInputOptionCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EnhancedSelectInputOptionCssNamespace.IEnhancedSelectInputOptionCss;
};

export = EnhancedSelectInputOptionCssModule;
