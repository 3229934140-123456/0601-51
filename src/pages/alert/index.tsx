import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Textarea, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { AlertItem, AlertLevel, AlertStatus } from '@/types';
import { alertList, alertLevelOptions, alertStatusOptions } from '@/data/alert';
import AlertCard from '@/components/AlertCard';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

const AlertPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>(alertList);
  const [levelFilter, setLevelFilter] = useState<AlertLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<AlertItem | null>(null);
  const [processRecord, setProcessRecord] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');

  const handlePersons = ['张三', '李四', '王五', '赵六', '孙七'];

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (levelFilter !== 'all' && alert.level !== levelFilter) return false;
      if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
      return true;
    });
  }, [alerts, levelFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: alerts.length,
      pending: alerts.filter(a => a.status === 'pending').length,
      processing: alerts.filter(a => a.status === 'confirmed' || a.status === 'processing').length,
      resolved: alerts.filter(a => a.status === 'resolved' || a.status === 'closed').length
    };
  }, [alerts]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 1000);
  }, []);

  const handleConfirm = (id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (!alert) return;
    setCurrentAlert(alert);
    setProcessRecord('');
    setShowProcessModal(true);
  };

  const handleTransfer = (id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (!alert) return;
    setCurrentAlert(alert);
    setSelectedPerson('');
    setShowTransferModal(true);
  };

  const handleResolve = (id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (!alert) return;
    setCurrentAlert(alert);
    setProcessRecord('');
    setShowProcessModal(true);
  };

  const submitProcess = () => {
    if (!currentAlert || !processRecord.trim()) {
      Taro.showToast({ title: '请填写处理记录', icon: 'none' });
      return;
    }
    const newStatus: AlertStatus = currentAlert.status === 'pending' ? 'confirmed' : 'resolved';
    setAlerts(prev => prev.map(a =>
      a.id === currentAlert.id
        ? { ...a, status: newStatus, confirmTime: new Date().toISOString(), handler: '当前用户', handlerName: '我' }
        : a
    ));
    setShowProcessModal(false);
    setCurrentAlert(null);
    Taro.showToast({ title: '操作成功', icon: 'success' });
    console.log('[Alert] 处理告警:', currentAlert.id, '记录:', processRecord);
  };

  const submitTransfer = () => {
    if (!currentAlert || !selectedPerson) {
      Taro.showToast({ title: '请选择转派人', icon: 'none' });
      return;
    }
    setAlerts(prev => prev.map(a =>
      a.id === currentAlert.id
        ? { ...a, handler: selectedPerson, handlerName: selectedPerson }
        : a
    ));
    setShowTransferModal(false);
    setCurrentAlert(null);
    Taro.showToast({ title: '转派成功', icon: 'success' });
    console.log('[Alert] 转派告警:', currentAlert.id, '给:', selectedPerson);
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.filterBar}>
        <View className={styles.filterRow}>
          <View className={styles.filterItem}>
            <Text className={styles.filterLabel}>状态</Text>
            <ScrollView scrollX className={styles.levelTabs}>
              {alertStatusOptions.map(option => (
                <View
                  key={option.value}
                  className={classnames(styles.levelTab, { [styles.active]: statusFilter === option.value })}
                  onClick={() => setStatusFilter(option.value)}
                >
                  {option.label}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
        <ScrollView scrollX className={styles.levelTabs}>
          {alertLevelOptions.map(option => (
            <View
              key={option.value}
              className={classnames(styles.levelTab, { [styles.active]: levelFilter === option.value })}
              onClick={() => setLevelFilter(option.value)}
            >
              {option.label}
            </View>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        scrollY
        refresherEnabled
        refresherTriggered={refreshing}
        onRefresherRefresh={handleRefresh}
      >
        <View className={styles.alertList}>
          <View className={styles.statBar}>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{stats.total}</Text>
              <Text className={styles.statLabel}>全部告警</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statNum, styles.pending)}>{stats.pending}</Text>
              <Text className={styles.statLabel}>待处理</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statNum, styles.processing)}>{stats.processing}</Text>
              <Text className={styles.statLabel}>处理中</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statNum, styles.resolved)}>{stats.resolved}</Text>
              <Text className={styles.statLabel}>已解决</Text>
            </View>
          </View>

          {filteredAlerts.length > 0 ? (
            filteredAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onConfirm={handleConfirm}
                onTransfer={handleTransfer}
                onResolve={handleResolve}
              />
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>🔔</Text>
              <Text className={styles.emptyText}>暂无告警数据</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {showProcessModal && currentAlert && (
        <View className={styles.modalMask} onClick={() => setShowProcessModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>
              {currentAlert.status === 'pending' ? '确认告警' : '处理记录'}
            </Text>
            <StatusTag type={currentAlert.level.toLowerCase()} text={currentAlert.level} />
            <Text style={{ marginTop: '16rpx', fontSize: '28rpx', color: '#1d2129', fontWeight: 500 }}>
              {currentAlert.title}
            </Text>

            <View className={styles.formGroup} style={{ marginTop: '32rpx' }}>
              <Text className={styles.formLabel}>处理记录</Text>
              <Textarea
                className={styles.formTextarea}
                placeholder="请输入处理记录..."
                value={processRecord}
                onInput={e => setProcessRecord(e.detail.value)}
                maxlength={500}
              />
            </View>

            <View className={styles.modalActions}>
              <Button className={classnames(styles.btn, styles.cancel)} onClick={() => setShowProcessModal(false)}>
                取消
              </Button>
              <Button className={classnames(styles.btn, styles.confirm)} onClick={submitProcess}>
                确认提交
              </Button>
            </View>
          </View>
        </View>
      )}

      {showTransferModal && currentAlert && (
        <View className={styles.modalMask} onClick={() => setShowTransferModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>转派告警</Text>
            <StatusTag type={currentAlert.level.toLowerCase()} text={currentAlert.level} />
            <Text style={{ marginTop: '16rpx', fontSize: '28rpx', color: '#1d2129', fontWeight: 500 }}>
              {currentAlert.title}
            </Text>

            <View className={styles.formGroup} style={{ marginTop: '32rpx' }}>
              <Text className={styles.formLabel}>选择转派人</Text>
              <View className={styles.personList}>
                {handlePersons.map(person => (
                  <View
                    key={person}
                    className={classnames(styles.personItem, { [styles.selected]: selectedPerson === person })}
                    onClick={() => setSelectedPerson(person)}
                  >
                    {person}
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.modalActions}>
              <Button className={classnames(styles.btn, styles.cancel)} onClick={() => setShowTransferModal(false)}>
                取消
              </Button>
              <Button className={classnames(styles.btn, styles.confirm)} onClick={submitTransfer}>
                确认转派
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default AlertPage;
