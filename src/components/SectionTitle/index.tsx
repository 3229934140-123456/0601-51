import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface SectionTitleProps {
  title: string;
  extra?: React.ReactNode;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, extra }) => {
  return (
    <View className={styles.sectionTitle}>
      <Text className={styles.title}>{title}</Text>
      {extra && <View className={styles.extra}>{extra}</View>}
    </View>
  );
};

export default SectionTitle;
