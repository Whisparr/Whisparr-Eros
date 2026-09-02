import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { useEffect, useRef } from 'react';

// Sonarr reaches for react-chartjs-2; we don't carry it, and a chart is a canvas
// plus a config object, so this drives chart.js directly. The instance is
// destroyed and rebuilt whenever the config changes -- callers memoize it, so
// that happens on real data or theme changes rather than every render.
const useChartCanvas = <T extends ChartType>(
  configuration: ChartConfiguration<T>
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const chart = new Chart(canvas, configuration);

    return () => {
      chart.destroy();
    };
  }, [configuration]);

  return canvasRef;
};

export default useChartCanvas;
