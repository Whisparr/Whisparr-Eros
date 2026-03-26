declare namespace ModalErrorCssNamespace {
  export interface IModalErrorCss {
    details: string;
    message: string;
  }
}

declare const ModalErrorCssModule: ModalErrorCssNamespace.IModalErrorCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ModalErrorCssNamespace.IModalErrorCss;
};

export = ModalErrorCssModule;
