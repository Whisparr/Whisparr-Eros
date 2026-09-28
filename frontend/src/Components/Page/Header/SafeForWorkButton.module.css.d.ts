declare namespace SafeForWorkButtonModuleCssNamespace {
  export interface ISafeForWorkButtonModuleCss {
    button: string;
    disabled: string;
    enabled: string;
    indicatorBackground: string;
    indicatorContainer: string;
    label: string;
    labelContainer: string;
  }
}

declare const SafeForWorkButtonModuleCssModule: SafeForWorkButtonModuleCssNamespace.ISafeForWorkButtonModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SafeForWorkButtonModuleCssNamespace.ISafeForWorkButtonModuleCss;
};

export = SafeForWorkButtonModuleCssModule;
