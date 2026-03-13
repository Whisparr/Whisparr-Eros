declare namespace SafeForWorkButtonCssNamespace {
  export interface ISafeForWorkButtonCss {
    button: string;
    disabled: string;
    enabled: string;
    indicatorBackground: string;
    indicatorContainer: string;
    label: string;
    labelContainer: string;
  }
}

declare const SafeForWorkButtonCssModule: SafeForWorkButtonCssNamespace.ISafeForWorkButtonCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SafeForWorkButtonCssNamespace.ISafeForWorkButtonCss;
};

export = SafeForWorkButtonCssModule;
