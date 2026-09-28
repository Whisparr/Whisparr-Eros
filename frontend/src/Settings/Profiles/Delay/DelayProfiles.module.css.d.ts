declare namespace DelayProfilesModuleCssNamespace {
  export interface IDelayProfilesModuleCss {
    addButton: string;
    addDelayProfile: string;
    column: string;
    delayProfiles: string;
    delayProfilesHeader: string;
    horizontalScroll: string;
    tags: string;
  }
}

declare const DelayProfilesModuleCssModule: DelayProfilesModuleCssNamespace.IDelayProfilesModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DelayProfilesModuleCssNamespace.IDelayProfilesModuleCss;
};

export = DelayProfilesModuleCssModule;
