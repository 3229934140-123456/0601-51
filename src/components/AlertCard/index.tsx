import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import type { AlertItem } from '@/types';
import StatusTag from '@/components/StatusTag';
import { statusLabelMap } from '@/data/alert';
import styles from './index.module.scss';

interface AlertCardProps {
  alert: AlertItem;
  onConfirm?: (id: string) => void;
  onTransfer?: (id: string) => void;
  onResolve?: (id: string) => void;
  onProgress?: (id: string) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onConfirm, onTransfer, onResolve, onProgress }) => {
  const isActive = alert.status === 'pending' || alert.status === 'investigating' || alert.status === 'waiting_external' || alert.status === 'temp_restored';

  return (
    <View className={classnames(styles.alertCard, styles[alert.level.toLowerCase()])}>
      <View className={styles.header}>
        <Text className={styles.title}>{alert.title}</Text>
        <StatusTag type={alert.level.toLowerCase()} text={alert.level} />
      </View>
      <View className={styles.content}>{alert.content}</View>
      <View className={styles.meta}>
        <View className={styles.metaItem}>
          <Text className={styles.label}>主机：</Text>
          <Text className={styles.value}>{alert.hostName}</Text>
        </View>
        <View className={styles.metaItem}>
          <Text className={styles.label}>服务：</Text>
          <Text className={styles.value}>{alert.serviceName}</Text>
        </View>
        <View className={styles.metaItem}>
          <Text className={styles.label}>机房：</Text>
          <Text className={styles.value}>{alert.idc}</Text>
        </View>
      </View>
      <View className={styles.footer}>
        <View className={styles.time}>
          <StatusTag type={alert.status} text={statusLabelMap[alert.status]} />
          <Text style={{ marginLeft: '16rpx', fontSize: '24rpx', color: '#86909c' }}>{alert.createTime}</Text>
        </View>
        <View className={styles.actions}>
          {alert.status === 'pending' && (
            <>
              <Button
                className={classnames(styles.actionBtn, styles.default)}
                onClick={() => onTransfer?.(alert.id)}
              >
                转派
              </Button>
              <Button
                className={classnames(styles.actionBtn, styles.primary)}
                onClick={() => onConfirm?.(alert.id)}
              >
                确认
              </Button>
            </>
          )}
          {(alert.status === 'investigating' || alert.status === 'waiting_external' || alert.status === 'temp_restored') && (
            <>
              <Button
                className={classnames(styles.actionBtn, styles.default)}
                onClick={() => onTransfer?.(alert.id)}
              >
                转派
              </Button>
              <Button
                className={classnames(styles.actionBtn, styles.primary)}
                onClick={() => onProgress?.(alert.id)}
              >
                进展
              </Button>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default AlertCard;
