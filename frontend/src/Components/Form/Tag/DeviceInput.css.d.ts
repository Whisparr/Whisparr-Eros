declare namespace DeviceInputCssNamespace {
  export interface IDeviceInputCss {
    deviceInputWrapper: string;
    input: string;
  }
}

declare const DeviceInputCssModule: DeviceInputCssNamespace.IDeviceInputCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DeviceInputCssNamespace.IDeviceInputCss;
};

export = DeviceInputCssModule;
