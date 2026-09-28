declare namespace PerformerIndexRowModuleCssNamespace {
  export interface IPerformerIndexRowModuleCss {
    actions: string;
    age: string;
    blur: string;
    careerEnd: string;
    careerStart: string;
    cell: string;
    checkInput: string;
    country: string;
    ethnicity: string;
    externalLinks: string;
    fullName: string;
    gender: string;
    hairColor: string;
    monitored: string;
    placeholder: string;
    qualityProfileId: string;
    rootFolderPath: string;
    select: string;
    sizeOnDisk: string;
    status: string;
    statusIcon: string;
    tags: string;
    totalMovieCount: string;
    totalSceneCount: string;
    unmonitored: string;
  }
}

declare const PerformerIndexRowModuleCssModule: PerformerIndexRowModuleCssNamespace.IPerformerIndexRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PerformerIndexRowModuleCssNamespace.IPerformerIndexRowModuleCss;
};

export = PerformerIndexRowModuleCssModule;
