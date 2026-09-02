import {
  ArcElement,
  Chart,
  ChartConfiguration,
  DoughnutController,
  Legend,
  Tooltip,
  TooltipItem,
} from 'chart.js';
import React, { useMemo } from 'react';
import useChartColors from 'Statistics/useChartColors';
import ChartContainer from './ChartContainer';
import useChartCanvas from './useChartCanvas';

Chart.register(ArcElement, DoughnutController, Legend, Tooltip);

export interface DoughnutChartItem {
  label: string;
  value: number;
}

interface DoughnutChartProps {
  title: string;
  items: DoughnutChartItem[];
}

export default function DoughnutChart({
  title,
  items,
}: Readonly<DoughnutChartProps>) {
  const colors = useChartColors();

  const configuration = useMemo<ChartConfiguration<'doughnut'>>(() => {
    const total = items.reduce((acc, item) => acc + item.value, 0);

    return {
      type: 'doughnut',
      data: {
        labels: items.map((item) => item.label),
        datasets: [
          {
            data: items.map((item) => item.value),
            backgroundColor: items.map(
              (_, index) => colors.palette[index % colors.palette.length]
            ),
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: colors.text, boxWidth: 12 },
          },
          tooltip: {
            callbacks: {
              label: (context: TooltipItem<'doughnut'>) => {
                const value = context.parsed ?? 0;
                const share = total > 0 ? Math.round((value / total) * 100) : 0;

                return ` ${value.toLocaleString()} (${share}%)`;
              },
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
