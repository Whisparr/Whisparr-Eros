declare namespace RemotePathMappingsCssNamespace {
  export interface IRemotePathMappingsCss {
    addButton: string;
    addRemotePathMapping: string;
    host: string;
    path: string;
    remotePathMappingsHeader: string;
  }
}

declare const RemotePathMappingsCssModule: RemotePathMappingsCssNamespace.IRemotePathMappingsCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: RemotePathMappingsCssNamespace.IRemotePathMappingsCss;
};

export = RemotePathMappingsCssModule;
