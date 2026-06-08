import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { HostItem, HostStatus, MetricPoint } from '@/types';
import { hostList, generateMetricData } from '@/data/host';
import { idcOptions, bizOptions } from '@/data/overview';
import StatusTag from '@/components/StatusTag';
import MetricChart from '@/components/MetricChart';
import styles from './index.module.scss';

const HostPage: React.FC = () => {
  const [hosts] = useState<HostItem[]>(hostList);
  const [idcFilter, setIdcFilter] = useState('all');
  const [bizFilter, setBizFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<HostStatus | 'all'>('all');
  const [expandedHost, setExpandedHost] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showIdcPicker, setShowIdcPicker] = useState(false);
  const [showBizPicker, setShowBizPicker] = useState(false);

  const metricCache = useMemo(() => {
    const cache: Record<string, { cpu: MetricPoint[]; memory: MetricPoint[]; disk: MetricPoint[]; load: MetricPoint[] }> = {};
    hosts.forEach(host => {
      cache[host.id] = {
        cpu: generateMetricData(host.cpu, 15),
        memory: generateMetricData(host.memory, 10),
        disk: generateMetricData(host.disk, 5),
        load: generateMetricData(host.load * 10, 20)
      };
    });
    return cache;
  }, [hosts]);

  const filteredHosts = useMemo(() => {
    return hosts.filter(host => {
      if (idcFilter !== 'all' && !host.idc.includes(idcFilter === 'hd' ? '华东' : idcFilter === 'hn' ? '华南' : idcFilter === 'hb' ? '华北' : '西南')) return false;
      if (bizFilter !== 'all' && !host.biz.includes(bizFilter === 'order' ? '订单' : bizFilter === 'pay' ? '支付' : bizFilter === 'user' ? '用户' : bizFilter === 'goods' ? '商品' : '营销')) return false;
      if (statusFilter !== 'all' && host.status !== statusFilter) return false;
      return true;
    });
  }, [hosts, idcFilter, bizFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: hosts.length,
      online: hosts.filter(h => h.status === 'online').length,
      warning: hosts.filter(h => h.status === 'warning').length,
      offline: hosts.filter(h => h.status === 'offline' || h.status === 'error').length
    };
  }, [hosts]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 1000);
  }, []);

  const toggleExpand = (hostId: string) => {
    setExpandedHost(expandedHost === hostId ? null : hostId);
  };

  const getMetricStatus = (value: number, type: string) => {
    if (type === 'load') {
      if (value >= 80) return 'danger';
      if (value >= 60) return 'warning';
    }
    if (value >= 90) return 'danger';
    if (value >= 80) return 'warning';
    return '';
  };

  const statusTextMap: Record<string, string> = {
    all: '全部',
    online: '在线',
    warning: '告警',
    error: '故障',
    offline: '离线'
  };

  const idcLabelMap: Record<string, string> = {};
  idcOptions.forEach(opt => { idcLabelMap[opt.value] = opt.label; });

  const bizLabelMap: Record<string, string> = {};
  bizOptions.forEach(opt => { bizLabelMap[opt.value] = opt.label; });

  return (
    <View className={styles.pageContainer}>
      <View className={styles.filterBar}>
        <View className={styles.filterRow}>
          <View className={styles.filterItem} onClick={() => setShowIdcPicker(true)}>
            <Text className={styles.filterLabel}>机房</Text>
            <View className={styles.filterSelect}>
              <Text>{idcLabelMap[idcFilter] || '全部机房'}</Text>
              <Text className={styles.arrow}>▼</Text>
            </View>
          </View>
          <View className={styles.filterItem} onClick={() => setShowBizPicker(true)}>
            <Text className={styles.filterLabel}>业务</Text>
            <View className={styles.filterSelect}>
              <Text>{bizLabelMap[bizFilter] || '全部业务'}</Text>
              <Text className={styles.arrow}>▼</Text>
            </View>
          </View>
        </View>
        <View className={styles.statusTabs}>
          {Object.entries(statusTextMap).map(([value, label]) => (
            <View
              key={value}
              className={classnames(styles.statusTab, { [styles.active]: statusFilter === value })}
              onClick={() => setStatusFilter(value as any)}
            >
              {label}
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        scrollY
        refresherEnabled
        refresherTriggered={refreshing}
        onRefresherRefresh={handleRefresh}
      >
        <View className={styles.hostList}>
          <View className={styles.statSummary}>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{stats.total}</Text>
              <Text className={styles.statLabel}>主机总数</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statNum, styles.online)}>{stats.online}</Text>
              <Text className={styles.statLabel}>正常在线</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statNum, styles.warning)}>{stats.warning}</Text>
              <Text className={styles.statLabel}>告警状态</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statNum, styles.offline)}>{stats.offline}</Text>
              <Text className={styles.statLabel}>故障离线</Text>
            </View>
          </View>

          {filteredHosts.length > 0 ? (
            filteredHosts.map(host => (
              <View
                key={host.id}
                className={classnames(styles.hostCard, { [styles.expanded]: expandedHost === host.id })}
              >
                <View className={styles.hostHeader}>
                  <View className={styles.hostInfo}>
                    <Text className={styles.hostName}>{host.name}</Text>
                    <Text className={styles.hostIp}>{host.ip}</Text>
                  </View>
                  <StatusTag type={host.status} text={statusTextMap[host.status]} />
                </View>

                <View className={styles.hostMeta}>
                  <View className={styles.metaItem}>
                    <Text className={styles.label}>机房：</Text>
                    <Text className={styles.value}>{host.idc}</Text>
                  </View>
                  <View className={styles.metaItem}>
                    <Text className={styles.label}>业务：</Text>
                    <Text className={styles.value}>{host.biz}</Text>
                  </View>
                </View>

                <View className={styles.metrics}>
                  <View className={styles.metricItem}>
                    <Text className={styles.metricLabel}>CPU</Text>
                    <Text className={classnames(styles.metricValue, styles[getMetricStatus(host.cpu, 'cpu')])}>
                      {host.cpu}%
                    </Text>
                    <View className={styles.metricBar}>
                      <View
                        className={classnames(styles.metricBarFill, styles[getMetricStatus(host.cpu, 'cpu')])}
                        style={{ width: `${host.cpu}%` }}
                      />
                    </View>
                  </View>
                  <View className={styles.metricItem}>
                    <Text className={styles.metricLabel}>内存</Text>
                    <Text className={classnames(styles.metricValue, styles[getMetricStatus(host.memory, 'memory')])}>
                      {host.memory}%
                    </Text>
                    <View className={styles.metricBar}>
                      <View
                        className={classnames(styles.metricBarFill, styles[getMetricStatus(host.memory, 'memory')])}
                        style={{ width: `${host.memory}%` }}
                      />
                    </View>
                  </View>
                  <View className={styles.metricItem}>
                    <Text className={styles.metricLabel}>磁盘</Text>
                    <Text className={classnames(styles.metricValue, styles[getMetricStatus(host.disk, 'disk')])}>
                      {host.disk}%
                    </Text>
                    <View className={styles.metricBar}>
                      <View
                        className={classnames(styles.metricBarFill, styles[getMetricStatus(host.disk, 'disk')])}
                        style={{ width: `${host.disk}%` }}
                      />
                    </View>
                  </View>
                  <View className={styles.metricItem}>
                    <Text className={styles.metricLabel}>负载</Text>
                    <Text className={classnames(styles.metricValue, styles[getMetricStatus(host.load * 10, 'load')])}>
                      {host.load}
                    </Text>
                    <View className={styles.metricBar}>
                      <View
                        className={classnames(styles.metricBarFill, styles[getMetricStatus(host.load * 10, 'load')])}
                        style={{ width: `${Math.min(host.load * 10, 100)}%` }}
                      />
                    </View>
                  </View>
                </View>

                <View className={styles.expandBtn} onClick={() => toggleExpand(host.id)}>
                  {expandedHost === host.id ? '收起指标详情 ▲' : '查看指标曲线 ▼'}
                </View>

                {expandedHost === host.id && metricCache[host.id] && (
                  <View className={styles.chartSection}>
                    <Text className={styles.chartTitle}>24小时指标趋势</Text>
                    <View className={styles.chartGrid}>
                      <MetricChart title="CPU使用率" data={metricCache[host.id].cpu} unit="%" color="#165dff" />
                      <MetricChart title="内存使用率" data={metricCache[host.id].memory} unit="%" color="#00b42a" />
                      <MetricChart title="磁盘使用率" data={metricCache[host.id].disk} unit="%" color="#ff7d00" />
                      <MetricChart title="系统负载" data={metricCache[host.id].load} unit="" color="#722ed1" />
                    </View>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>🖥️</Text>
              <Text className={styles.emptyText}>暂无主机数据</Text>
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
            <View className={styles.pickerOptions}>
              {idcOptions.map(option => (
                <View
                  key={option.value}
                  className={classnames(styles.pickerOption, { [styles.selected]: idcFilter === option.value })}
                  onClick={() => { setIdcFilter(option.value); setShowIdcPicker(false); }}
                >
                  {option.label}
                </View>
              ))}
            </View>
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
            <View className={styles.pickerOptions}>
              {bizOptions.map(option => (
                <View
                  key={option.value}
                  className={classnames(styles.pickerOption, { [styles.selected]: bizFilter === option.value })}
                  onClick={() => { setBizFilter(option.value); setShowBizPicker(false); }}
                >
                  {option.label}
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default HostPage;
