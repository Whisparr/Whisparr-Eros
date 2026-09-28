declare namespace RemotePathMappingsModuleCssNamespace {
  export interface IRemotePathMappingsModuleCss {
    addButton: string;
    addRemotePathMapping: string;
    host: string;
    path: string;
    remotePathMappingsHeader: string;
  }
}

declare const RemotePathMappingsModuleCssModule: RemotePathMappingsModuleCssNamespace.IRemotePathMappingsModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: RemotePathMappingsModuleCssNamespace.IRemotePathMappingsModuleCss;
};

export = RemotePathMappingsModuleCssModule;
