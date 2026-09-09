import { Children, cloneElement, ReactElement, useEffect, useRef } from 'react';
import useMeasure, { Measurements } from 'Helpers/Hooks/useMeasure';

// Taken from the hook rather than written out: `react-use-measure` declares its
// own `HTMLOrSVGElement`, which is not the DOM lib's type of the same name.
type MeasureRef = ReturnType<typeof useMeasure>[0];

export interface MeasureProps {
  onMeasure: (bounds: Measurements) => void;
  children: ReactElement;
}

function Measure({ onMeasure, children }: MeasureProps) {
  const [ref, bounds] = useMeasure();
  const onMeasureRef = useRef(onMeasure);
  onMeasureRef.current = onMeasure;

  useEffect(() => {
    if (bounds.width !== 0 || bounds.height !== 0) {
      onMeasureRef.current(bounds);
    }
  }, [bounds]);

  // The child is whatever the caller passed, and attaching a ref to it is the
  // entire point of this component, so its props are asserted to accept one.
  const child = Children.only(children) as ReactElement<{ ref?: MeasureRef }>;

  return cloneElement(child, { ref });
}

export default Measure;
