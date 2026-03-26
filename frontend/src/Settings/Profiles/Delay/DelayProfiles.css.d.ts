declare namespace DelayProfilesCssNamespace {
  export interface IDelayProfilesCss {
    addButton: string;
    addDelayProfile: string;
    column: string;
    delayProfiles: string;
    delayProfilesHeader: string;
    horizontalScroll: string;
    tags: string;
  }
}

declare const DelayProfilesCssModule: DelayProfilesCssNamespace.IDelayProfilesCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DelayProfilesCssNamespace.IDelayProfilesCss;
};

export = DelayProfilesCssModule;
