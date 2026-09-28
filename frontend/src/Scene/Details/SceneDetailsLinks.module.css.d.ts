declare namespace SceneDetailsLinksModuleCssNamespace {
  export interface ISceneDetailsLinksModuleCss {
    link: string;
    linkLabel: string;
    links: string;
  }
}

declare const SceneDetailsLinksModuleCssModule: SceneDetailsLinksModuleCssNamespace.ISceneDetailsLinksModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneDetailsLinksModuleCssNamespace.ISceneDetailsLinksModuleCss;
};

export = SceneDetailsLinksModuleCssModule;
