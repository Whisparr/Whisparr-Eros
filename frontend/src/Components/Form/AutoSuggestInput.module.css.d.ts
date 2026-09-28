declare namespace AutoSuggestInputModuleCssNamespace {
  export interface IAutoSuggestInputModuleCss {
    hasError: string;
    hasWarning: string;
    input: string;
    inputContainer: string;
    suggestion: string;
    suggestionHighlighted: string;
    suggestionsContainer: string;
    suggestionsContainerOpen: string;
    suggestionsList: string;
  }
}

declare const AutoSuggestInputModuleCssModule: AutoSuggestInputModuleCssNamespace.IAutoSuggestInputModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AutoSuggestInputModuleCssNamespace.IAutoSuggestInputModuleCss;
};

export = AutoSuggestInputModuleCssModule;
