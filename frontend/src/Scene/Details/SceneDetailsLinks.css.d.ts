declare namespace SceneDetailsLinksCssNamespace {
  export interface ISceneDetailsLinksCss {
    link: string;
    linkLabel: string;
    links: string;
  }
}

declare const SceneDetailsLinksCssModule: SceneDetailsLinksCssNamespace.ISceneDetailsLinksCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneDetailsLinksCssNamespace.ISceneDetailsLinksCss;
};

export = SceneDetailsLinksCssModule;
