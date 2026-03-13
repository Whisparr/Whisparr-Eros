declare namespace AutoSuggestInputCssNamespace {
  export interface IAutoSuggestInputCss {
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

declare const AutoSuggestInputCssModule: AutoSuggestInputCssNamespace.IAutoSuggestInputCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AutoSuggestInputCssNamespace.IAutoSuggestInputCss;
};

export = AutoSuggestInputCssModule;
