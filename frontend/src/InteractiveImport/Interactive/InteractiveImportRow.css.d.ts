declare namespace InteractiveImportRowCssNamespace {
  export interface IInteractiveImportRowCss {
    customFormatTooltip: string;
    label: string;
    languages: string;
    quality: string;
    relativePath: string;
    reprocessing: string;
  }
}

declare const InteractiveImportRowCssModule: InteractiveImportRowCssNamespace.IInteractiveImportRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: InteractiveImportRowCssNamespace.IInteractiveImportRowCss;
};

export = InteractiveImportRowCssModule;
