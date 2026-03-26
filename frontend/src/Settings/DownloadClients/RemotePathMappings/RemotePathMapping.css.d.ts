declare namespace RemotePathMappingCssNamespace {
  export interface IRemotePathMappingCss {
    actions: string;
    host: string;
    path: string;
    remotePathMapping: string;
  }
}

declare const RemotePathMappingCssModule: RemotePathMappingCssNamespace.IRemotePathMappingCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: RemotePathMappingCssNamespace.IRemotePathMappingCss;
};

export = RemotePathMappingCssModule;
