declare namespace SceneRowModuleCssNamespace {
  export interface ISceneRowModuleCss {
    audio: string;
    audioLanguages: string;
    blurred: string;
    customFormatScore: string;
    externalLink: string;
    languages: string;
    monitorToggleButton: string;
    monitored: string;
    path: string;
    performers: string;
    relativePath: string;
    releaseGroup: string;
    runtime: string;
    size: string;
    status: string;
    studio: string;
    subtitles: string;
    title: string;
    video: string;
    videoDynamicRangeType: string;
  }
}

declare const SceneRowModuleCssModule: SceneRowModuleCssNamespace.ISceneRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneRowModuleCssNamespace.ISceneRowModuleCss;
};

export = SceneRowModuleCssModule;
