declare namespace DragPreviewLayerCssNamespace {
  export interface IDragPreviewLayerCss {
    dragLayer: string;
  }
}

declare const DragPreviewLayerCssModule: DragPreviewLayerCssNamespace.IDragPreviewLayerCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DragPreviewLayerCssNamespace.IDragPreviewLayerCss;
};

export = DragPreviewLayerCssModule;
