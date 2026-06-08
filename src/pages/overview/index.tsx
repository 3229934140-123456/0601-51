import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

const OverviewPage: React.FC = () => {
  const { importantEvents, getHealthScore, getAlertStats, getHostStats, getServiceStats } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const healthScore = useMemo(() => getHealthScore(), [getHealthScore]);
  const alertStats = useMemo(() => getAlertStats(), [getAlertStats]);
  const hostStats = useMemo(() => getHostStats(), [getHostStats]);
  const serviceStats = useMemo(() => getServiceStats(), [getServiceStats]);

  const healthLevel = useMemo(() => {
    if (healthScore >= 90) return '优秀';
    if (healthScore >= 80) return '良好';
    if (healthScore >= 70) return '一般';
    if (healthScore >= 60) return '警告';
    return '危险';
  }, [healthScore]);

  const healthDesc = useMemo(() => {
    if (healthScore >= 90) return '系统整体运行良好，一切正常';
    if (healthScore >= 80) return '系统整体运行稳定，少量告警需关注';
    if (healthScore >= 70) return '系统存在一定风险，请及时处理告警';
    if (healthScore >= 60) return '系统告警较多，建议优先处理重要告警';
    return '系统风险较高，请立即处理告警';
  }, [healthScore]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 1000);
  }, []);

  const goToPage = (url: string) => {
    Taro.navigateTo({ url });
  };

  const goToTab = (url: string) => {
    Taro.switchTab({ url });
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return '#00b42a';
    if (score >= 80) return '#4cc75e';
    if (score >= 70) return '#ffc02d';
    if (score >= 60) return '#ff7d00';
    return '#f53f3f';
  };

  return (
    <ScrollView
      scrollY
      className={styles.pageContainer}
      refresherEnabled
      refresherTriggered={refreshing}
      onRefresherRefresh={handleRefresh}
    >
      <View className={styles.header}>
        <Text className={styles.greeting}>你好，值班员</Text>
        <Text className={styles.title}>运维监控平台</Text>
        <View className={styles.healthCard}>
          <View className={styles.healthRow}>
            <Text className={styles.healthLabel}>系统健康分</Text>
            <Text className={styles.healthLevel}>{healthLevel}</Text>
          </View>
          <View className={styles.healthScore} style={{ color: getHealthColor(healthScore) }}>
            {healthScore}
            <Text className={styles.unit}>/100</Text>
          </View>
          <Text className={styles.healthDesc}>{healthDesc}</Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.quickStats}>
          <View className={styles.statItem} onClick={() => goToTab('/pages/alert/index')}>
            <Text className={classnames(styles.statValue, styles.alert)}>
              {alertStats.pending}
            </Text>
            <Text className={styles.statLabel}>待处理告警</Text>
          </View>
          <View className={styles.statItem} onClick={() => goToTab('/pages/host/index')}>
            <Text className={classnames(styles.statValue, styles.success)}>
              {hostStats.online}
            </Text>
            <Text className={styles.statLabel}>在线主机</Text>
          </View>
          <View className={styles.statItem} onClick={() => goToPage('/pages/service/index')}>
            <Text className={classnames(styles.statValue, styles.warning)}>
              {serviceStats.abnormal}
            </Text>
            <Text className={styles.statLabel}>异常服务</Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>重要事件</Text>
            <Text className={styles.sectionMore} onClick={() => goToTab('/pages/alert/index')}>
              查看全部
            </Text>
          </View>
          <View className={styles.eventList}>
            {importantEvents.length > 0 ? (
              importantEvents.map(event => (
                <View
                  key={event.id}
                  className={classnames(styles.eventCard, { [styles.topEvent]: event.isTop })}
                  onClick={() => goToTab('/pages/alert/index')}
                >
                  <View className={styles.eventHeader}>
                    <Text className={styles.eventTitle}>{event.title}</Text>
                    <StatusTag type={event.level.toLowerCase()} text={event.level} />
                  </View>
                  <View className={styles.eventContent}>{event.content}</View>
                  <View className={styles.eventFooter}>
                    <Text className={styles.eventTime}>{event.time}</Text>
                    {event.isTop && <Text className={styles.topBadge}>置顶</Text>}
                  </View>
                </View>
              ))
            ) : (
              <View className={styles.emptyEvents}>
                <Text className={styles.emptyText}>暂无重要事件</Text>
              </View>
            )}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>快捷入口</Text>
          </View>
          <View className={styles.quickEntry}>
            <View className={styles.entryItem} onClick={() => goToPage('/pages/service/index')}>
              <View className={classnames(styles.entryIcon, styles.service)}>服</View>
              <Text className={styles.entryLabel}>服务监控</Text>
            </View>
            <View className={styles.entryItem} onClick={() => goToPage('/pages/review/index')}>
              <View className={classnames(styles.entryIcon, styles.review)}>复</View>
              <Text className={styles.entryLabel}>复盘分析</Text>
            </View>
            <View className={styles.entryItem} onClick={() => goToTab('/pages/inspection/index')}>
              <View className={classnames(styles.entryIcon, styles.report)}>巡</View>
              <Text className={styles.entryLabel}>巡检管理</Text>
            </View>
            <View className={styles.entryItem} onClick={() => Taro.showToast({ title: '功能开发中', icon: 'none' })}>
              <View className={classnames(styles.entryIcon, styles.setting)}>设</View>
              <Text className={styles.entryLabel}>系统设置</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>今日统计</Text>
          </View>
          <View className={styles.quickStats}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{alertStats.today}</Text>
              <Text className={styles.statLabel}>今日告警</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{alertStats.total}</Text>
              <Text className={styles.statLabel}>告警总数</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{hostStats.total}</Text>
              <Text className={styles.statLabel}>主机总数</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default OverviewPage;
