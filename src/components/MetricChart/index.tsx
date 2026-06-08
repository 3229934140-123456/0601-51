import React, { useEffect, useRef } from 'react';
import { View, Text, Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';
import type { MetricPoint } from '@/types';
import styles from './index.module.scss';

interface MetricChartProps {
  title: string;
  data: MetricPoint[];
  unit?: string;
  color?: string;
  height?: number;
}

const MetricChart: React.FC<MetricChartProps> = ({
  title,
  data,
  unit = '%',
  color = '#165dff',
  height = 240
}) => {
  const canvasRef = useRef<any>(null);
  const canvasId = `chart-${Math.random().toString(36).substr(2, 9)}`;

  const currentValue = data.length > 0 ? data[data.length - 1].value : 0;

  useEffect(() => {
    drawChart();
  }, [data]);

  const drawChart = () => {
    const query = Taro.createSelectorQuery();
    query.select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec((res: any) => {
        if (!res || !res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = Taro.getSystemInfoSync().pixelRatio;
        const width = res[0].width;
        const height = res[0].height;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        const padding = { top: 10, right: 10, bottom: 20, left: 10 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const values = data.map(d => d.value);
        const maxValue = Math.max(...values, 100);
        const minValue = Math.min(...values, 0);
        const range = maxValue - minValue || 1;

        ctx.clearRect(0, 0, width, height);

        const gradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
        gradient.addColorStop(0, color + '40');
        gradient.addColorStop(1, color + '05');

        ctx.beginPath();
        data.forEach((point, index) => {
          const x = padding.left + (index / (data.length - 1)) * chartWidth;
          const y = padding.top + chartHeight - ((point.value - minValue) / range) * chartHeight;
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
        ctx.lineTo(padding.left, padding.top + chartHeight);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        data.forEach((point, index) => {
          const x = padding.left + (index / (data.length - 1)) * chartWidth;
          const y = padding.top + chartHeight - ((point.value - minValue) / range) * chartHeight;
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        if (data.length > 0) {
          const lastIndex = data.length - 1;
          const x = padding.left + (lastIndex / (data.length - 1)) * chartWidth;
          const y = padding.top + chartHeight - ((data[lastIndex].value - minValue) / range) * chartHeight;
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = color;
          ctx.stroke();
        }
      });
  };

  const xLabels = data.length > 0 
    ? [data[0].time, data[Math.floor(data.length / 2)].time, data[data.length - 1].time]
    : [];

  return (
    <View className={styles.metricChart}>
      <View className={styles.header}>
        <Text className={styles.title}>{title}</Text>
        <Text className={styles.value}>
          {currentValue.toFixed(1)}
          <Text className={styles.unit}>{unit}</Text>
        </Text>
      </View>
      <View className={styles.chartContainer} style={{ height: `${height}rpx` }}>
        <Canvas
          id={canvasId}
          ref={canvasRef}
          type="2d"
          className={styles.chartCanvas}
          style={{ width: '100%', height: `${height}rpx` }}
        />
      </View>
      <View className={styles.xAxis}>
        {xLabels.map((label, index) => (
          <Text key={index} className={styles.xLabel}>{label}</Text>
        ))}
      </View>
    </View>
  );
};

export default MetricChart;
