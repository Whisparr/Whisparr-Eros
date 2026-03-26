import PropTypes from 'prop-types';
import { Children, cloneElement, useEffect, useRef } from 'react';
import useMeasure from 'Helpers/Hooks/useMeasure';

function Measure({ onMeasure, children }) {
  const [ref, bounds] = useMeasure();
  const onMeasureRef = useRef(onMeasure);
  onMeasureRef.current = onMeasure;

  useEffect(() => {
    if (bounds.width !== 0 || bounds.height !== 0) {
      onMeasureRef.current(bounds);
    }
  }, [bounds]);

  return cloneElement(Children.only(children), { ref });
}

Measure.propTypes = {
  onMeasure: PropTypes.func.isRequired,
};

export default Measure;
