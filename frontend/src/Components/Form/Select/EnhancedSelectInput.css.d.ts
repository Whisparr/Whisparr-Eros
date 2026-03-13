declare namespace EnhancedSelectInputCssNamespace {
  export interface IEnhancedSelectInputCss {
    dropdownArrowContainer: string;
    dropdownArrowContainerDisabled: string;
    dropdownArrowContainerEditable: string;
    editableContainer: string;
    enhancedSelect: string;
    hasError: string;
    hasWarning: string;
    isDisabled: string;
    loading: string;
    mobileCloseButton: string;
    mobileCloseButtonContainer: string;
    options: string;
    optionsContainer: string;
    optionsInnerModalBody: string;
    optionsModal: string;
    optionsModalBody: string;
    optionsModalScroller: string;
  }
}

declare const EnhancedSelectInputCssModule: EnhancedSelectInputCssNamespace.IEnhancedSelectInputCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EnhancedSelectInputCssNamespace.IEnhancedSelectInputCss;
};

export = EnhancedSelectInputCssModule;
