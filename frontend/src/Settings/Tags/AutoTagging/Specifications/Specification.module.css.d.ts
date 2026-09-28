declare namespace SpecificationModuleCssNamespace {
  export interface ISpecificationModuleCss {
    autoTagging: string;
    cloneButton: string;
    labels: string;
    name: string;
    nameContainer: string;
    tooltipLabel: string;
  }
}

declare const SpecificationModuleCssModule: SpecificationModuleCssNamespace.ISpecificationModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SpecificationModuleCssNamespace.ISpecificationModuleCss;
};

export = SpecificationModuleCssModule;
