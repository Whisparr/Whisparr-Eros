declare namespace EnhancedSelectInputModuleCssNamespace {
  export interface IEnhancedSelectInputModuleCss {
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

declare const EnhancedSelectInputModuleCssModule: EnhancedSelectInputModuleCssNamespace.IEnhancedSelectInputModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EnhancedSelectInputModuleCssNamespace.IEnhancedSelectInputModuleCss;
};

export = EnhancedSelectInputModuleCssModule;
