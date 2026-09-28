declare namespace ModalErrorModuleCssNamespace {
  export interface IModalErrorModuleCss {
    details: string;
    message: string;
  }
}

declare const ModalErrorModuleCssModule: ModalErrorModuleCssNamespace.IModalErrorModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ModalErrorModuleCssNamespace.IModalErrorModuleCss;
};

export = ModalErrorModuleCssModule;
