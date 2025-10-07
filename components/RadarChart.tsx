'use client';

import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface RadarChartProps {
  labels: string[];
  data: number[];
  title?: string;
}

export default function RadarChart({ labels, data, title }: RadarChartProps) {
  const chartData = {
    labels,
    datasets: [
      {
        label: title || '評価',
        data,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          font: {
            size: 12,
            family: "'Yu Gothic', '游ゴシック', YuGothic, sans-serif",
          },
          color: '#374151',
        },
        ticks: {
          display: true,
          stepSize: 1,
          backdropColor: 'transparent',
          color: '#9CA3AF',
          font: {
            size: 10,
          },
        },
        min: 0,
        max: 6,
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          family: "'Yu Gothic', '游ゴシック', YuGothic, sans-serif",
        },
        bodyFont: {
          size: 13,
          family: "'Yu Gothic', '游ゴシック', YuGothic, sans-serif",
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const value = context.parsed.r;
            let grade = 'F';
            if (value >= 5.5) grade = 'S';
            else if (value >= 4.5) grade = 'A';
            else if (value >= 3.5) grade = 'B';
            else if (value >= 2.5) grade = 'C';
            else if (value >= 1.5) grade = 'D';
            
            return `${context.label}: ${value.toFixed(1)} (${grade})`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full">
      <Radar data={chartData} options={options} />
    </div>
  );
}

