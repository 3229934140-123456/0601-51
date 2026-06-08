import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { ServiceItem, ServiceStatus } from '@/types';
import { useAppStore } from '@/store';
import { idcOptions, bizOptions } from '@/data/overview';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

const ServicePage: React.FC = () => {
  const { services, updateServiceStatus } = useAppStore();
  const [idcFilter, setIdcFilter] = useState('all');
  const [bizFilter, setBizFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showIdcPicker, setShowIdcPicker] = useState(false);
  const [showBizPicker, setShowBizPicker] = useState(false);

  const statusOptions = [
    { value: 'all', label: '全部' },
    { value: 'normal', label: '正常' },
    { value: 'warning', label: '告警' },
    { value: 'error', label: '异常' },
    { value: 'maintenance', label: '维护中' }
  ];

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      if (idcFilter !== 'all' && service.idcKey !== idcFilter) return false;
      if (bizFilter !== 'all' && service.bizKey !== bizFilter) return false;
      if (statusFilter !== 'all' && service.status !== statusFilter) return false;
      return true;
    });
  }, [services, idcFilter, bizFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: filteredServices.length,
      normal: filteredServices.filter(s => s.status === 'normal').length,
      warning: filteredServices.filter(s => s.status === 'warning').length,
      error: filteredServices.filter(s => s.status === 'error').length,
      abnormal: filteredServices.filter(s => s.status !== 'normal' && s.status !== 'maintenance').length
    };
  }, [filteredServices]);

  const statusTextMap: Record<string, string> = {
    normal: '正常',
    warning: '告警',
    error: '异常',
    maintenance: '维护中'
  };

  const hasActiveFilter = idcFilter !== 'all' || bizFilter !== 'all' || statusFilter !== 'all';

  const idcLabelMap: Record<string, string> = {};
  idcOptions.forEach(opt => { idcLabelMap[opt.value] = opt.label; });

  const bizLabelMap: Record<string, string> = {};
  bizOptions.forEach(opt => { bizLabelMap[opt.value] = opt.label; });

  const handleReset = () => {
    setIdcFilter('all');
    setBizFilter('all');
    setStatusFilter('all');
    Taro.showToast({ title: '已重置筛选', icon: 'none' });
  };

  const markServiceStatus = (id: string, status: ServiceStatus) => {
    updateServiceStatus(id, status);
    Taro.showToast({ title: '状态已更新', icon: 'success' });
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.filterBar}>
        <View className={styles.filterRow}>
          <View className={styles.filterItem} onClick={() => setShowIdcPicker(true)}>
            <Text className={styles.filterLabel}>机房</Text>
            <View className={classnames(styles.filterSelect, { [styles.active]: idcFilter !== 'all' })}>
              <Text>{idcLabelMap[idcFilter] || '全部机房'}</Text>
              <Text className={styles.arrow}>▼</Text>
            </View>
          </View>
          <View className={styles.filterItem} onClick={() => setShowBizPicker(true)}>
            <Text className={styles.filterLabel}>业务</Text>
            <View className={classnames(styles.filterSelect, { [styles.active]: bizFilter !== 'all' })}>
              <Text>{bizLabelMap[bizFilter] || '全部业务'}</Text>
              <Text className={styles.arrow}>▼</Text>
            </View>
          </View>
          {hasActiveFilter && (
            <Button className={styles.resetBtn} onClick={handleReset}>
              重置
            </Button>
          )}
        </View>
        <View className={styles.filterRow}>
          <ScrollView scrollX className={styles.statusTabs}>
            {statusOptions.map(option => (
              <View
                key={option.value}
                className={classnames(styles.statusTab, { [styles.active]: statusFilter === option.value })}
                onClick={() => setStatusFilter(option.value)}
              >
                {option.label}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{stats.total}</Text>
            <Text className={styles.statLabel}>服务总数</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={classnames(styles.statValue, styles.normal)}>{stats.normal}</Text>
            <Text className={styles.statLabel}>正常运行</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={classnames(styles.statValue, styles.error)}>{stats.abnormal}</Text>
            <Text className={styles.statLabel}>异常服务</Text>
          </View>
        </View>

        <Text className={styles.sectionTitle}>服务列表</Text>

        <View className={styles.serviceList}>
          {filteredServices.length > 0 ? (
            filteredServices.map(service => (
              <View key={service.id} className={styles.serviceCard}>
                <View className={styles.cardHeader}>
                  <Text className={styles.serviceName}>{service.name}</Text>
                  <View className={styles.serviceStatus}>
                    <StatusTag type={service.status} text={statusTextMap[service.status]} />
                  </View>
                </View>

                <View className={styles.serviceMeta}>
                  <View className={styles.metaItem}>
                    <Text className={styles.label}>机房：</Text>
                    <Text className={styles.value}>{service.idc}</Text>
                  </View>
                  <View className={styles.metaItem}>
                    <Text className={styles.label}>业务：</Text>
                    <Text className={styles.value}>{service.biz}</Text>
                  </View>
                  <View className={styles.metaItem}>
                    <Text className={styles.label}>实例：</Text>
                    <Text className={styles.value}>
                      {service.healthyInstances}/{service.instances}
                    </Text>
                  </View>
                </View>

                <View className={styles.metrics}>
                  <View className={styles.metricItem}>
                    <Text className={classnames(styles.metricValue, {
                      [styles.warning]: service.responseTime > 300,
                      [styles.error]: service.responseTime > 500
                    })}>
                      {service.responseTime}ms
                    </Text>
                    <Text className={styles.metricLabel}>响应时间</Text>
                  </View>
                  <View className={styles.metricItem}>
                    <Text className={styles.metricValue}>{service.qps}</Text>
                    <Text className={styles.metricLabel}>QPS</Text>
                  </View>
                  <View className={styles.metricItem}>
                    <Text className={classnames(styles.metricValue, {
                      [styles.warning]: service.healthyInstances / service.instances < 0.9,
                      [styles.error]: service.healthyInstances / service.instances < 0.7
                    })}>
                      {Math.round(service.healthyInstances / service.instances * 100)}%
                    </Text>
                    <Text className={styles.metricLabel}>健康率</Text>
                  </View>
                </View>

                <View className={styles.cardFooter}>
                  <Button
                    className={classnames(styles.actionBtn, styles.default)}
                    onClick={() => Taro.showToast({ title: '详情功能开发中', icon: 'none' })}
                  >
                    查看详情
                  </Button>
                  {service.status !== 'normal' && (
                    <Button
                      className={classnames(styles.actionBtn, styles.primary)}
                      onClick={() => markServiceStatus(service.id, 'normal')}
                    >
                      标记正常
                    </Button>
                  )}
                  {service.status === 'normal' && (
                    <Button
                      className={classnames(styles.actionBtn, styles.primary)}
                      onClick={() => markServiceStatus(service.id, 'warning')}
                    >
                      标记告警
                    </Button>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>🔧</Text>
              <Text className={styles.emptyText}>暂无服务数据</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {showIdcPicker && (
        <View className={styles.pickerMask} onClick={() => setShowIdcPicker(false)}>
          <View className={styles.pickerContent} onClick={e => e.stopPropagation()}>
            <View className={styles.pickerHeader}>
              <Text className={styles.pickerCancel} onClick={() => setShowIdcPicker(false)}>取消</Text>
              <Text className={styles.pickerTitle}>选择机房</Text>
              <Text className={styles.pickerConfirm} onClick={() => setShowIdcPicker(false)}>确定</Text>
            </View>
            <ScrollView scrollY className={styles.pickerOptions}>
              {idcOptions.map(option => (
                <View
                  key={option.value}
                  className={classnames(styles.pickerOption, { [styles.selected]: idcFilter === option.value })}
                  onClick={() => { setIdcFilter(option.value); setShowIdcPicker(false); }}
                >
                  {option.label}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {showBizPicker && (
        <View className={styles.pickerMask} onClick={() => setShowBizPicker(false)}>
          <View className={styles.pickerContent} onClick={e => e.stopPropagation()}>
            <View className={styles.pickerHeader}>
              <Text className={styles.pickerCancel} onClick={() => setShowBizPicker(false)}>取消</Text>
              <Text className={styles.pickerTitle}>选择业务</Text>
              <Text className={styles.pickerConfirm} onClick={() => setShowBizPicker(false)}>确定</Text>
            </View>
            <ScrollView scrollY className={styles.pickerOptions}>
              {bizOptions.map(option => (
                <View
                  key={option.value}
                  className={classnames(styles.pickerOption, { [styles.selected]: bizFilter === option.value })}
                  onClick={() => { setBizFilter(option.value); setShowBizPicker(false); }}
                >
                  {option.label}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

export default ServicePage;
