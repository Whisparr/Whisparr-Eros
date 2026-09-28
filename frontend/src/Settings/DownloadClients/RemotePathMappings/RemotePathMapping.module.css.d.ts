declare namespace RemotePathMappingModuleCssNamespace {
  export interface IRemotePathMappingModuleCss {
    actions: string;
    host: string;
    path: string;
    remotePathMapping: string;
  }
}

declare const RemotePathMappingModuleCssModule: RemotePathMappingModuleCssNamespace.IRemotePathMappingModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: RemotePathMappingModuleCssNamespace.IRemotePathMappingModuleCss;
};

export = RemotePathMappingModuleCssModule;
