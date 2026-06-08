import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, Button, Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { reviewStats } from '@/data/duty';
import styles from './index.module.scss';

const ReviewPage: React.FC = () => {
  const [showSummary, setShowSummary] = useState(false);
  const canvasRef = useRef<any>(null);
  const canvasId = 'trendChart';

  useEffect(() => {
    drawChart();
  }, []);

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

        const data = reviewStats.dailyTrend;
        const maxValue = Math.max(...data.map(d => d.count)) * 1.2;

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

  const levelData = [
    { level: 'P0', count: reviewStats.p0Count, color: '#f53f3f' },
    { level: 'P1', count: reviewStats.p1Count, color: '#ff7d00' },
    { level: 'P2', count: reviewStats.p2Count, color: '#ffc02d' },
    { level: 'P3', count: reviewStats.p3Count, color: '#165dff' },
    { level: 'P4', count: reviewStats.p4Count, color: '#86909c' }
  ];

  const maxLevelCount = Math.max(...levelData.map(d => d.count));

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.title}>复盘分析</Text>
        <Text className={styles.subtitle}>告警数据统计与复盘总结</Text>
      </View>

      <View className={styles.statsGrid}>
        <View className={styles.statCard}>
          <Text className={styles.statLabel}>本周告警总数</Text>
          <Text className={classnames(styles.statValue, styles.alert)}>
            {reviewStats.totalAlerts}
            <Text className={styles.statUnit}>条</Text>
          </Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statLabel}>平均解决时间</Text>
          <Text className={styles.statValue}>
            {reviewStats.avgResolveTime}
          </Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statLabel}>P0/P1告警</Text>
          <Text className={classnames(styles.statValue, styles.warning)}>
            {reviewStats.p0Count + reviewStats.p1Count}
            <Text className={styles.statUnit}>条</Text>
          </Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statLabel}>自动恢复率</Text>
          <Text className={classnames(styles.statValue, styles.success)}>
            {reviewStats.autoResolveRate}
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
            <Text className={styles.chartTitle}>近7天告警趋势</Text>
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
            {reviewStats.dailyTrend.map((item, index) => (
              <Text key={index} className={styles.xLabel}>{item.date}</Text>
            ))}
          </View>
        </View>

        <Text className={styles.sectionTitle}>TOP告警类型</Text>
        <View className={styles.topAlerts}>
          <View className={styles.topList}>
            {reviewStats.topAlerts.map((item, index) => (
              <View key={index} className={styles.topItem}>
                <View className={classnames(styles.rank, styles[`top${index + 1}`])}>
                  {index + 1}
                </View>
                <Text className={styles.alertName}>{item.name}</Text>
                <Text className={styles.alertCount}>{item.count}次</Text>
              </View>
            ))}
          </View>
        </View>

        <Text className={styles.sectionTitle}>复盘结论</Text>
        <View className={styles.summaryCard}>
          {showSummary ? (
            <>
              <Text className={styles.summaryTitle}>
                <Text className={styles.icon}>📋</Text>
                本周运维复盘总结
              </Text>
              <View className={styles.summaryContent}>
                <Text>本周系统整体运行良好，告警总数较上周下降12%。</Text>
                {'\n\n'}
                <Text>主要问题集中在CPU使用率告警和内存使用率告警，建议：</Text>
                {'\n'}
                <Text>1. 对高频告警主机进行性能优化</Text>
                {'\n'}
                <Text>2. 增加自动扩缩容策略，应对流量高峰</Text>
                {'\n'}
                <Text>3. 优化告警规则，减少无效告警干扰</Text>
                {'\n\n'}
                <Text>P0/P1告警均已及时处理，平均解决时间45分钟，符合SLA要求。</Text>
              </View>
              <View className={styles.summaryTags}>
                <View className={styles.tag}>系统稳定</View>
                <View className={styles.tag}>性能优化</View>
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
                基于本周告警数据，AI将自动分析并生成运维复盘结论，包含问题总结、改进建议等内容。
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
