import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartConfiguration,
  LinearScale,
  Tooltip,
  TooltipItem,
} from 'chart.js';
import React, { useMemo } from 'react';
import useChartColors from 'Statistics/useChartColors';
import ChartContainer from './ChartContainer';
import useChartCanvas from './useChartCanvas';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

export interface BarChartItem {
  label: string;
  value: number;
  tooltipLines?: string[];
}

interface BarChartProps {
  title: string;
  items: BarChartItem[];
}

export default function BarChart({ title, items }: Readonly<BarChartProps>) {
  const colors = useChartColors();

  const configuration = useMemo<ChartConfiguration<'bar'>>(() => {
    return {
      type: 'bar',
      data: {
        labels: items.map((item) => item.label),
        datasets: [
          {
            data: items.map((item) => item.value),
            backgroundColor: colors.bar,
            borderRadius: 3,
            maxBarThickness: 50,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { color: colors.text },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0, color: colors.text },
            grid: { color: colors.grid },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context: TooltipItem<'bar'>) =>
                ` ${(context.parsed.y ?? 0).toLocaleString()}`,
              afterBody: (contexts: TooltipItem<'bar'>[]) =>
                items[contexts[0]?.dataIndex ?? 0]?.tooltipLines ?? [],
            },
          },
        },
      },
    };
  }, [colors, items]);

  const canvasRef = useChartCanvas(configuration);

  return (
    <ChartContainer title={title}>
      <canvas ref={canvasRef} />
    </ChartContainer>
  );
}
