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
import { useState, useEffect } from 'react';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface RadarChartProps {
  labels: string[];
  data: number[];
  title?: string;
}

export default function RadarChart({ labels, data, title }: RadarChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        pointRadius: isMobile ? 2 : 4,
        pointHoverRadius: isMobile ? 4 : 6,
      },
    ],
  };

  const options: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
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
            size: isMobile ? 7 : 12,
            family: "'Yu Gothic', '游ゴシック', YuGothic, sans-serif",
          },
          color: '#374151',
          padding: isMobile ? 8 : 12,
        },
        ticks: {
          display: true,
          stepSize: 1,
          backdropColor: 'transparent',
          color: '#9CA3AF',
          font: {
            size: isMobile ? 8 : 10,
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
    <div className="w-full h-full min-h-[250px] sm:min-h-[300px] lg:min-h-[400px]">
      <Radar data={chartData} options={options} />
    </div>
  );
}

