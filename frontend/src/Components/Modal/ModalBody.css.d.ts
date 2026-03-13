declare namespace ModalBodyCssNamespace {
  export interface IModalBodyCss {
    innerModalBody: string;
    modalBody: string;
    modalScroller: string;
  }
}

declare const ModalBodyCssModule: ModalBodyCssNamespace.IModalBodyCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ModalBodyCssNamespace.IModalBodyCss;
};

export = ModalBodyCssModule;
