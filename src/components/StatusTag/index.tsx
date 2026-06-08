import React from 'react';
import { View } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatusTagProps {
  type?: string;
  text: string;
  className?: string;
}

const StatusTag: React.FC<StatusTagProps> = ({ type = 'info', text, className }) => {
  return (
    <View className={classnames(styles.statusTag, styles[type], className)}>
      {text}
    </View>
  );
};

export default StatusTag;
