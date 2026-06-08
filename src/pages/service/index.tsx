import React, { useState } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { ServiceItem, ServiceStatus } from '@/types';
import { serviceList } from '@/data/service';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

const ServicePage: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>(serviceList);

  const stats = {
    total: services.length,
    normal: services.filter(s => s.status === 'normal').length,
    warning: services.filter(s => s.status === 'warning').length,
    error: services.filter(s => s.status === 'error').length
  };

  const statusTextMap: Record<string, string> = {
    normal: '正常',
    warning: '告警',
    error: '异常',
    maintenance: '维护中'
  };

  const markServiceStatus = (id: string, status: ServiceStatus) => {
    setServices(prev => prev.map(s =>
      s.id === id ? { ...s, status } : s
    ));
    Taro.showToast({ title: '状态已更新', icon: 'success' });
    console.log('[Service] 更新服务状态:', id, status);
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.title}>服务监控</Text>
        <Text className={styles.subtitle}>实时监控各业务服务运行状态</Text>
      </View>

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
          <Text className={classnames(styles.statValue, styles.warning)}>{stats.warning + stats.error}</Text>
          <Text className={styles.statLabel}>异常服务</Text>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <Text className={styles.sectionTitle}>服务列表</Text>

        <View className={styles.serviceList}>
          {services.map(service => (
            <View key={service.id} className={styles.serviceCard}>
              <View className={styles.cardHeader}>
                <Text className={styles.serviceName}>{service.name}</Text>
                <View className={styles.serviceStatus}>
                  <StatusTag type={service.status} text={statusTextMap[service.status]} />
                </View>
              </View>

              <View className={styles.serviceMeta}>
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
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default ServicePage;
