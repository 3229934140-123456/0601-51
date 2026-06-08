import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { InspectionItem, InspectionTask } from '@/types';
import { inspectionList, inspectionTasks } from '@/data/inspection';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

const InspectionPage: React.FC = () => {
  const [list, setList] = useState<InspectionItem[]>(inspectionList);
  const [tasks, setTasks] = useState<InspectionTask[]>(inspectionTasks);
  const [currentInspection, setCurrentInspection] = useState<InspectionItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScanResult, setShowScanResult] = useState(false);
  const [scanResult, setScanResult] = useState('');

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 1000);
  }, []);

  const startInspection = (item: InspectionItem) => {
    setCurrentInspection(item);
    setShowDetail(true);
    console.log('[Inspection] 开始巡检:', item.id);
  };

  const goBack = () => {
    setShowDetail(false);
    setCurrentInspection(null);
  };

  const handleScan = () => {
    Taro.scanCode({
      success: (res) => {
        setScanResult(res.result || '设备编号：DEV-2024-001');
        setShowScanResult(true);
        console.log('[Inspection] 扫码结果:', res.result);
      },
      fail: () => {
        setScanResult('设备编号：DEV-2024-001（模拟扫码结果）');
        setShowScanResult(true);
      }
    });
  };

  const handlePhoto = (taskId: string) => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths?.[0] || '';
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, photoUrl: tempFilePath } : t
        ));
        console.log('[Inspection] 上传照片:', taskId);
      },
      fail: () => {
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, photoUrl: 'https://picsum.photos/id/3/300/300' } : t
        ));
      }
    });
  };

  const markTaskStatus = (taskId: string, status: 'pass' | 'fail') => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status } : t
    ));
  };

  const submitInspection = () => {
    const requiredTasks = tasks.filter(t => t.required);
    const unfinished = requiredTasks.filter(t => t.status === 'pending');
    if (unfinished.length > 0) {
      Taro.showToast({
        title: `还有${unfinished.length}项必填任务未完成`,
        icon: 'none'
      });
      return;
    }

    Taro.showModal({
      title: '确认提交',
      content: '确定要提交本次巡检结果吗？',
      success: (res) => {
        if (res.confirm) {
          const finishedCount = tasks.filter(t => t.status !== 'pending').length;
          if (currentInspection) {
            setList(prev => prev.map(item =>
              item.id === currentInspection.id
                ? { ...item, status: 'completed' as const, finished: finishedCount, endTime: new Date().toISOString() }
                : item
            ));
          }
          Taro.showToast({ title: '提交成功', icon: 'success' });
          setShowDetail(false);
          setCurrentInspection(null);
          console.log('[Inspection] 提交巡检:', currentInspection?.id);
        }
      }
    });
  };

  const createInspection = () => {
    setShowCreateModal(false);
    Taro.showToast({ title: '巡检创建成功', icon: 'success' });
    console.log('[Inspection] 创建新巡检');
  };

  const statusTextMap: Record<string, string> = {
    pending: '待开始',
    processing: '进行中',
    completed: '已完成'
  };

  const completedCount = tasks.filter(t => t.status !== 'pending').length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (showDetail && currentInspection) {
    return (
      <View className={classnames(styles.pageContainer, styles.detailPage)}>
        <ScrollView scrollY style={{ height: '100vh', paddingBottom: '160rpx' }}>
          <View className={styles.detailHeader}>
            <Text className={styles.detailTitle}>{currentInspection.title}</Text>
            <View className={styles.detailMeta}>
              <View className={styles.metaItem}>
                <Text className={styles.label}>机房：</Text>
                <Text className={styles.value}>{currentInspection.idc}</Text>
              </View>
              <View className={styles.metaItem}>
                <Text className={styles.label}>状态：</Text>
                <StatusTag type={currentInspection.status} text={statusTextMap[currentInspection.status]} />
              </View>
              <View className={styles.metaItem}>
                <Text className={styles.label}>进度：</Text>
                <Text className={styles.value}>{completedCount}/{tasks.length}</Text>
              </View>
            </View>
          </View>

          <View style={{ padding: '0 32rpx', marginBottom: '24rpx' }}>
            <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16rpx' }}>
              <Text style={{ fontSize: '28rpx', color: '#4e5969' }}>巡检进度</Text>
              <Text style={{ fontSize: '28rpx', fontWeight: 500, color: '#165dff' }}>{progress}%</Text>
            </View>
            <View style={{ height: '12rpx', background: '#f2f3f5', borderRadius: '999rpx', overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #165dff, #4080ff)', borderRadius: '999rpx' }} />
            </View>
          </View>

          <View className={styles.taskList}>
            {tasks.map(task => (
              <View key={task.id} className={styles.taskCard}>
                <View className={styles.taskHeader}>
                  <Text className={styles.taskTitle}>
                    {task.required && <Text className={styles.required}>*</Text>}
                    {task.title}
                  </Text>
                  <View className={classnames(styles.statusIcon, styles[task.status])}>
                    {task.status === 'pending' ? '○' : task.status === 'pass' ? '✓' : '✗'}
                  </View>
                </View>
                <View className={styles.taskContent}>{task.content}</View>

                {task.status === 'pending' && (
                  <View className={styles.taskActions}>
                    <Button
                      className={classnames(styles.taskBtn, styles.pass)}
                      onClick={() => markTaskStatus(task.id, 'pass')}
                    >
                      正常
                    </Button>
                    <Button
                      className={classnames(styles.taskBtn, styles.fail)}
                      onClick={() => markTaskStatus(task.id, 'fail')}
                    >
                      异常
                    </Button>
                  </View>
                )}

                {(task.status === 'pass' || task.status === 'fail') && (
                  <View className={styles.remarkSection}>
                    <Text className={styles.remarkLabel}>
                      {task.status === 'pass' ? '检查结果：正常' : '检查结果：异常'}
                    </Text>
                    {task.remark && <Text className={styles.remarkText}>{task.remark}</Text>}
                    <View className={styles.photoPreview}>
                      {task.photoUrl ? (
                        <Image src={task.photoUrl} mode="aspectFill" />
                      ) : (
                        <Button
                          className={classnames(styles.taskBtn, styles.photo)}
                          style={{ width: '100%', height: '100%', borderRadius: '12rpx' }}
                          onClick={() => handlePhoto(task.id)}
                        >
                          拍照
                        </Button>
                      )}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        <View className={styles.submitBar}>
          <Button className={styles.backBtn} onClick={goBack}>返回</Button>
          <Button className={styles.submitBtn} onClick={submitInspection}>
            提交巡检结果
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.title}>巡检管理</Text>
        <Text className={styles.subtitle}>规范巡检流程，确保设备稳定运行</Text>
      </View>

      <View className={styles.actionBar}>
        <View className={styles.actionCard} onClick={() => setShowCreateModal(true)}>
          <View className={styles.actionIcon}>＋</View>
          <Text className={styles.actionLabel}>发起巡检</Text>
        </View>
        <View className={styles.actionCard} onClick={handleScan}>
          <View className={classnames(styles.actionIcon, styles.scan)}>⌖</View>
          <Text className={styles.actionLabel}>扫码绑定</Text>
        </View>
        <View className={styles.actionCard} onClick={() => Taro.showToast({ title: '功能开发中', icon: 'none' })}>
          <View className={classnames(styles.actionIcon, styles.photo)}>📷</View>
          <Text className={styles.actionLabel}>现场照片</Text>
        </View>
      </View>

      <ScrollView
        scrollY
        className={styles.content}
        refresherEnabled
        refresherTriggered={refreshing}
        onRefresherRefresh={handleRefresh}
        style={{ height: 'calc(100vh - 360rpx)' }}
      >
        <Text className={styles.sectionTitle}>巡检任务</Text>

        <View className={styles.inspectionList}>
          {list.map(item => (
            <View key={item.id} className={styles.inspectionCard}>
              <View className={styles.cardHeader}>
                <Text className={styles.cardTitle}>{item.title}</Text>
                <StatusTag type={item.status} text={statusTextMap[item.status]} />
              </View>

              <View className={styles.cardMeta}>
                <View className={styles.metaItem}>
                  <Text className={styles.label}>机房：</Text>
                  <Text className={styles.value}>{item.idc}</Text>
                </View>
                <View className={styles.metaItem}>
                  <Text className={styles.label}>开始时间：</Text>
                  <Text className={styles.value}>{item.startTime}</Text>
                </View>
              </View>

              <View className={styles.progressSection}>
                <View className={styles.progressHeader}>
                  <Text className={styles.progressLabel}>完成进度</Text>
                  <Text className={styles.progressValue}>{item.finished}/{item.total}</Text>
                </View>
                <View className={styles.progressBar}>
                  <View
                    className={styles.progressFill}
                    style={{ width: `${item.total > 0 ? (item.finished / item.total) * 100 : 0}%` }}
                  />
                </View>
              </View>

              <View className={styles.cardFooter}>
                <Text className={styles.inspector}>
                  {item.inspector ? `巡检员：${item.inspector}` : '待分配'}
                </Text>
                {item.status === 'pending' && (
                  <Button
                    className={styles.actionBtn}
                    onClick={() => startInspection(item)}
                  >
                    开始巡检
                  </Button>
                )}
                {item.status === 'processing' && (
                  <Button
                    className={styles.actionBtn}
                    onClick={() => startInspection(item)}
                  >
                    继续巡检
                  </Button>
                )}
                {item.status === 'completed' && (
                  <Button
                    className={classnames(styles.actionBtn, styles.secondary)}
                    onClick={() => startInspection(item)}
                  >
                    查看详情
                  </Button>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {showCreateModal && (
        <View className={styles.modalMask} onClick={() => setShowCreateModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalIcon}>📋</View>
            <Text className={styles.modalTitle}>发起巡检</Text>
            <Text className={styles.modalDesc}>
              选择巡检类型和机房后，系统将自动生成巡检任务清单
            </Text>
            <View className={styles.modalActions}>
              <Button
                className={classnames(styles.btn, styles.cancel)}
                onClick={() => setShowCreateModal(false)}
              >
                取消
              </Button>
              <Button
                className={classnames(styles.btn, styles.confirm)}
                onClick={createInspection}
              >
                确认创建
              </Button>
            </View>
          </View>
        </View>
      )}

      {showScanResult && (
        <View className={styles.modalMask} onClick={() => setShowScanResult(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalIcon}>📱</View>
            <Text className={styles.modalTitle}>扫码成功</Text>
            <Text className={styles.modalDesc}>{scanResult}</Text>
            <View className={styles.modalActions}>
              <Button
                className={classnames(styles.btn, styles.cancel)}
                onClick={() => setShowScanResult(false)}
              >
                关闭
              </Button>
              <Button
                className={classnames(styles.btn, styles.confirm)}
                onClick={() => {
                  setShowScanResult(false);
                  Taro.showToast({ title: '绑定成功', icon: 'success' });
                }}
              >
                确认绑定
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default InspectionPage;
