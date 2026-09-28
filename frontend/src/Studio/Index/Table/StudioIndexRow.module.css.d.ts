declare namespace StudioIndexRowModuleCssNamespace {
  export interface IStudioIndexRowModuleCss {
    actions: string;
    aliases: string;
    blur: string;
    cell: string;
    checkInput: string;
    externalLinks: string;
    network: string;
    placeholder: string;
    qualityProfileId: string;
    rootFolderPath: string;
    select: string;
    sizeOnDisk: string;
    sortTitle: string;
    status: string;
    statusIcon: string;
    tags: string;
    totalMovieCount: string;
    totalSceneCount: string;
    unmonitored: string;
  }
}

declare const StudioIndexRowModuleCssModule: StudioIndexRowModuleCssNamespace.IStudioIndexRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StudioIndexRowModuleCssNamespace.IStudioIndexRowModuleCss;
};

export = StudioIndexRowModuleCssModule;
