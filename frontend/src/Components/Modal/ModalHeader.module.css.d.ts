declare namespace ModalHeaderModuleCssNamespace {
  export interface IModalHeaderModuleCss {
    modalHeader: string;
  }
}

declare const ModalHeaderModuleCssModule: ModalHeaderModuleCssNamespace.IModalHeaderModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ModalHeaderModuleCssNamespace.IModalHeaderModuleCss;
};

export = ModalHeaderModuleCssModule;
