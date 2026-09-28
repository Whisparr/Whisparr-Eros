declare namespace ModalBodyModuleCssNamespace {
  export interface IModalBodyModuleCss {
    innerModalBody: string;
    modalBody: string;
    modalScroller: string;
  }
}

declare const ModalBodyModuleCssModule: ModalBodyModuleCssNamespace.IModalBodyModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ModalBodyModuleCssNamespace.IModalBodyModuleCss;
};

export = ModalBodyModuleCssModule;
