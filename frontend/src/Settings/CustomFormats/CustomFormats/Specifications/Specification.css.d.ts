declare namespace SpecificationCssNamespace {
  export interface ISpecificationCss {
    cloneButton: string;
    customFormat: string;
    labels: string;
    name: string;
    nameContainer: string;
    tooltipLabel: string;
  }
}

declare const SpecificationCssModule: SpecificationCssNamespace.ISpecificationCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SpecificationCssNamespace.ISpecificationCss;
};

export = SpecificationCssModule;
