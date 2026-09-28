declare namespace DeviceInputModuleCssNamespace {
  export interface IDeviceInputModuleCss {
    deviceInputWrapper: string;
    input: string;
  }
}

declare const DeviceInputModuleCssModule: DeviceInputModuleCssNamespace.IDeviceInputModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DeviceInputModuleCssNamespace.IDeviceInputModuleCss;
};

export = DeviceInputModuleCssModule;
