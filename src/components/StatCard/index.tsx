import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  trendType?: 'up' | 'down';
  valueColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  trend,
  trendType,
  valueColor
}) => {
  return (
    <View className={styles.statCard}>
      <View className={styles.label}>{label}</View>
      <View className={styles.value} style={valueColor ? { color: valueColor } : undefined}>
        {value}
        {unit && <Text className={styles.unit}>{unit}</Text>}
      </View>
      {trend && (
        <View className={classnames(styles.trend, styles[trendType || 'up'])}>
          {trend}
        </View>
      )}
    </View>
  );
};

export default StatCard;
