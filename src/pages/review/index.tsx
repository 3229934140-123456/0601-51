import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, ScrollView, Button, Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useStore } from '@/store';
import { statusLabelMap } from '@/data/alert';
import styles from './index.module.scss';

const ReviewPage: React.FC = () => {
  const { alerts } = useStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [showSummary, setShowSummary] = useState(false);
  const canvasRef = useRef<any>(null);
  const canvasId = 'trendChart';

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const getDateStr = (date: Date) => `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  const dayCount = timeRange === 'week' ? 7 : 30;

  const filteredAlerts = useMemo(() => {
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - dayCount + 1);
    cutoff.setHours(0, 0, 0, 0);
    return alerts.filter(a => new Date(a.createTime) >= cutoff);
  }, [alerts, dayCount]);

  const stats = useMemo(() => {
    const list = filteredAlerts;
    const levelCounts: Record<string, number> = { P0: 0, P1: 0, P2: 0, P3: 0, P4: 0 };
    let totalTransferCount = 0;
    let totalResolveMinutes = 0;
    let resolvedCount = 0;

    list.forEach(alert => {
      levelCounts[alert.level] = (levelCounts[alert.level] || 0) + 1;
      totalTransferCount += alert.transferCount || 0;

      if (alert.resolveTime && alert.createTime) {
        const create = new Date(alert.createTime).getTime();
        const resolve = new Date(alert.resolveTime).getTime();
        if (resolve > create) {
          totalResolveMinutes += (resolve - create) / (1000 * 60);
          resolvedCount++;
        }
      }
    });

    const avgResolveMinutes = resolvedCount > 0 ? Math.round(totalResolveMinutes / resolvedCount) : 0;
    let avgResolveTime = '';
    if (avgResolveMinutes >= 60) {
      const hours = Math.floor(avgResolveMinutes / 60);
      const mins = avgResolveMinutes % 60;
      avgResolveTime = mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
    } else {
      avgResolveTime = `${avgResolveMinutes}分钟`;
    }

    const p0p1Count = levelCounts['P0'] + levelCounts['P1'];

    const dailyTrend: { date: string; count: number }[] = [];
    for (let i = dayCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = getDateStr(d);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);
      const count = list.filter(a => {
        const t = new Date(a.createTime).getTime();
        return t >= dayStart.getTime() && t <= dayEnd.getTime();
      }).length;
      dailyTrend.push({ date: dateStr, count });
    }

    const pendingOrProcessing = list.filter(a =>
      a.status === 'pending' ||
      a.status === 'investigating' ||
      a.status === 'waiting_external' ||
      a.status === 'temp_restored'
    );

    const overdueAlerts = pendingOrProcessing.filter(a => {
      const create = new Date(a.createTime).getTime();
      const hoursPassed = (now.getTime() - create) / (1000 * 60 * 60);
      if (a.level === 'P0' || a.level === 'P1') return hoursPassed > 4;
      if (a.level === 'P2') return hoursPassed > 24;
      return hoursPassed > 72;
    });

    const alertTypeMap = new Map<string, number>();
    list.forEach(a => {
      const key = a.title;
      alertTypeMap.set(key, (alertTypeMap.get(key) || 0) + 1);
    });
    const topAlerts = Array.from(alertTypeMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total: list.length,
      levelCounts,
      avgResolveTime,
      p0p1Count,
      transferCount: totalTransferCount,
      dailyTrend,
      topAlerts,
      overdueAlerts
    };
  }, [filteredAlerts, dayCount]);

  const levelData = [
    { level: 'P0', count: stats.levelCounts['P0'], color: '#f53f3f' },
    { level: 'P1', count: stats.levelCounts['P1'], color: '#ff7d00' },
    { level: 'P2', count: stats.levelCounts['P2'], color: '#ffc02d' },
    { level: 'P3', count: stats.levelCounts['P3'], color: '#165dff' },
    { level: 'P4', count: stats.levelCounts['P4'], color: '#86909c' }
  ];

  const maxLevelCount = Math.max(...levelData.map(d => d.count), 1);

  useEffect(() => {
    const timer = setTimeout(() => {
      drawChart();
    }, 100);
    return () => clearTimeout(timer);
  }, [timeRange, stats.dailyTrend]);

  const drawChart = () => {
    const query = Taro.createSelectorQuery();
    query.select('#' + canvasId)
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

        const padding = { top: 10, right: 10, bottom: 20, left: 30 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const data = stats.dailyTrend;
        const maxValue = Math.max(...data.map(d => d.count), 1) * 1.2;

        ctx.clearRect(0, 0, width, height);

        ctx.strokeStyle = '#f2f3f5';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
          const y = padding.top + (chartHeight / 4) * i;
          ctx.beginPath();
          ctx.moveTo(padding.left, y);
          ctx.lineTo(width - padding.right, y);
          ctx.stroke();

          ctx.fillStyle = '#86909c';
          ctx.font = '20rpx sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(String(Math.round(maxValue - (maxValue / 4) * i)), padding.left - 8, y + 6);
        }

        const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
        gradient.addColorStop(0, 'rgba(22, 93, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(22, 93, 255, 0.05)');

        ctx.beginPath();
        data.forEach((item, index) => {
          const x = padding.left + (index / (data.length - 1)) * chartWidth;
          const y = padding.top + chartHeight - (item.count / maxValue) * chartHeight;
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
        data.forEach((item, index) => {
          const x = padding.left + (index / (data.length - 1)) * chartWidth;
          const y = padding.top + chartHeight - (item.count / maxValue) * chartHeight;
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.strokeStyle = '#165dff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        data.forEach((item, index) => {
          const x = padding.left + (index / (data.length - 1)) * chartWidth;
          const y = padding.top + chartHeight - (item.count / maxValue) * chartHeight;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#165dff';
          ctx.stroke();
        });
      });
  };

  const generateSummary = () => {
    setShowSummary(true);
    Taro.showToast({ title: '复盘结论已生成', icon: 'success' });
    console.log('[Review] 生成复盘结论');
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <View>
          <Text className={styles.title}>复盘分析</Text>
          <Text className={styles.subtitle}>告警数据统计与复盘总结</Text>
        </View>
        <View className={styles.timeRangeTabs}>
          <View
            className={classnames(styles.tabItem, { [styles.active]: timeRange === 'week' })}
            onClick={() => setTimeRange('week')}
          >
            本周
          </View>
          <View
            className={classnames(styles.tabItem, { [styles.active]: timeRange === 'month' })}
            onClick={() => setTimeRange('month')}
          >
            本月
          </View>
        </View>
      </View>

      <View className={styles.statsGrid}>
        <View className={styles.statCard}>
          <Text className={styles.statLabel}>{timeRange === 'week' ? '本周' : '本月'}告警总数</Text>
          <Text className={classnames(styles.statValue, styles.alert)}>
            {stats.total}
            <Text className={styles.statUnit}>条</Text>
          </Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statLabel}>平均处理耗时</Text>
          <Text className={styles.statValue}>
            {stats.avgResolveTime || '-'}
          </Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statLabel}>P0/P1告警</Text>
          <Text className={classnames(styles.statValue, styles.warning)}>
            {stats.p0p1Count}
            <Text className={styles.statUnit}>条</Text>
          </Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statLabel}>转派次数</Text>
          <Text className={classnames(styles.statValue, styles.info)}>
            {stats.transferCount}
            <Text className={styles.statUnit}>次</Text>
          </Text>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <Text className={styles.sectionTitle}>告警级别分布</Text>
        <View className={styles.levelStats}>
          <View className={styles.levelList}>
            {levelData.map(item => (
              <View key={item.level} className={styles.levelItem}>
                <Text className={classnames(styles.levelLabel, styles[item.level.toLowerCase()])}>
                  {item.level}
                </Text>
                <View className={styles.levelBar}>
                  <View
                    className={styles.levelFill}
                    style={{
                      width: `${(item.count / maxLevelCount) * 100}%`,
                      background: item.color
                    }}
                  />
                </View>
                <Text className={styles.levelCount}>{item.count}条</Text>
              </View>
            ))}
          </View>
        </View>

        <Text className={styles.sectionTitle}>告警趋势</Text>
        <View className={styles.trendChart}>
          <View className={styles.chartHeader}>
            <Text className={styles.chartTitle}>
              {timeRange === 'week' ? '近7天' : '近30天'}告警趋势
            </Text>
            <Text className={styles.chartSubtitle}>单位：条</Text>
          </View>
          <View className={styles.chartContainer}>
            <Canvas
              id={canvasId}
              ref={canvasRef}
              type="2d"
              className={styles.chartCanvas}
              style={{ width: '100%', height: '300rpx' }}
            />
          </View>
          <View className={styles.xLabels}>
            {stats.dailyTrend.map((item, index) => (
              <Text key={index} className={styles.xLabel}>{item.date}</Text>
            ))}
          </View>
        </View>

        <Text className={styles.sectionTitle}>TOP告警类型</Text>
        <View className={styles.topAlerts}>
          <View className={styles.topList}>
            {stats.topAlerts.length > 0 ? (
              stats.topAlerts.map((item, index) => (
                <View key={index} className={styles.topItem}>
                  <View className={classnames(styles.rank, styles[`top${index + 1}`])}>
                    {index + 1}
                  </View>
                  <Text className={styles.alertName}>{item.name}</Text>
                  <Text className={styles.alertCount}>{item.count}次</Text>
                </View>
              ))
            ) : (
              <View className={styles.emptyTip}>暂无数据</View>
            )}
          </View>
        </View>

        <Text className={styles.sectionTitle}>未按时关闭告警</Text>
        <View className={styles.overdueAlerts}>
          {stats.overdueAlerts.length > 0 ? (
            stats.overdueAlerts.map(alert => (
              <View key={alert.id} className={styles.overdueItem}>
                <View className={styles.overdueHeader}>
                  <View className={classnames(styles.levelBadge, styles[alert.level.toLowerCase()])}>
                    {alert.level}
                  </View>
                  <Text className={styles.overdueTitle}>{alert.title}</Text>
                </View>
                <View className={styles.overdueMeta}>
                  <Text className={styles.overdueStatus}>
                    状态：{statusLabelMap[alert.status]}
                  </Text>
                  <Text className={styles.overdueTime}>
                    创建于 {alert.createTime.substring(5, 16)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View className={styles.emptyTip}>
              🎉 所有告警均在SLA内处理
            </View>
          )}
        </View>

        <Text className={styles.sectionTitle}>复盘结论</Text>
        <View className={styles.summaryCard}>
          {showSummary ? (
            <>
              <Text className={styles.summaryTitle}>
                <Text className={styles.icon}>📋</Text>
                {timeRange === 'week' ? '本周' : '本月'}运维复盘总结
              </Text>
              <View className={styles.summaryContent}>
                <Text>
                  {timeRange === 'week' ? '本周' : '本月'}系统共产生{stats.total}条告警，
                  其中P0/P1告警{stats.p0p1Count}条，平均处理耗时{stats.avgResolveTime}。
                </Text>
                {'\n\n'}
                <Text>转派次数共{stats.transferCount}次，
                  {stats.overdueAlerts.length > 0
                    ? `有${stats.overdueAlerts.length}条告警未按时关闭，需要重点关注。`
                    : '所有告警均在SLA内及时处理。'}
                </Text>
                {'\n\n'}
                <Text>主要问题与改进建议：</Text>
                {'\n'}
                <Text>1. 关注高频告警，优化告警规则减少无效告警</Text>
                {'\n'}
                <Text>2. 加强P0/P1告警的应急响应能力</Text>
                {'\n'}
                <Text>3. 持续优化系统性能，降低告警发生率</Text>
              </View>
              <View className={styles.summaryTags}>
                <View className={styles.tag}>数据驱动</View>
                <View className={styles.tag}>持续改进</View>
                <View className={styles.tag}>告警治理</View>
              </View>
            </>
          ) : (
            <>
              <Text className={styles.summaryTitle}>
                <Text className={styles.icon}>📊</Text>
                生成复盘结论
              </Text>
              <View className={styles.summaryContent} style={{ color: '#86909c' }}>
                基于{timeRange === 'week' ? '本周' : '本月'}告警数据，将自动分析并生成运维复盘结论，包含问题总结、改进建议等内容。
              </View>
              <Button className={styles.generateBtn} onClick={generateSummary}>
                一键生成复盘结论
              </Button>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ReviewPage;
