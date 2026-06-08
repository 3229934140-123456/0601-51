import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Button, Image, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { InspectionItem, InspectionTask, BoundDevice } from '@/types';
import { useAppStore } from '@/store';
import { inspectionTypes, inspectionTaskTemplates, inspectorOptions } from '@/data/inspection';
import { idcOptions } from '@/data/overview';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

const InspectionPage: React.FC = () => {
  const {
    inspections,
    createInspection,
    updateInspectionTask,
    bindDevice,
    addInspectionPhoto,
    completeInspection
  } = useAppStore();

  const [currentInspection, setCurrentInspection] = useState<InspectionItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBindModal, setShowBindModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedInspectionForBind, setSelectedInspectionForBind] = useState<InspectionItem | null>(null);
  const [selectedInspectionForPhoto, setSelectedInspectionForPhoto] = useState<InspectionItem | null>(null);

  const [formData, setFormData] = useState({
    idcKey: 'hd',
    type: 'daily',
    inspectorId: 'zhangsan',
    planDate: '',
    planTime: '09:00'
  });

  const [bindForm, setBindForm] = useState({
    deviceId: '',
    deviceName: '',
    deviceType: 'server',
    remark: '',
    photoUrl: ''
  });

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 1000);
  }, []);

  const startInspection = (item: InspectionItem) => {
    const freshItem = inspections.find(i => i.id === item.id);
    setCurrentInspection(freshItem || item);
    setShowDetail(true);
  };

  const goBack = () => {
    setShowDetail(false);
    setCurrentInspection(null);
  };

  const handleScan = () => {
    const pendingOrProcessing = inspections.filter(i => i.status !== 'completed');
    if (pendingOrProcessing.length === 0) {
      Taro.showToast({ title: '暂无进行中的巡检任务', icon: 'none' });
      return;
    }
    if (pendingOrProcessing.length === 1) {
      setSelectedInspectionForBind(pendingOrProcessing[0]);
      setBindForm(prev => ({ ...prev, deviceId: `DEV-${Date.now().toString().slice(-6)}`, photoUrl: '' }));
      setShowBindModal(true);
      return;
    }

    const options = pendingOrProcessing.map(i => i.title);
    Taro.showActionSheet({
      itemList: options,
      success: (res) => {
        const selected = pendingOrProcessing[res.tapIndex];
        setSelectedInspectionForBind(selected);
        setBindForm(prev => ({ ...prev, deviceId: `DEV-${Date.now().toString().slice(-6)}`, photoUrl: '' }));
        setShowBindModal(true);
      }
    });
  };

  const handlePhotoEntry = () => {
    const pendingOrProcessing = inspections.filter(i => i.status !== 'completed');
    if (pendingOrProcessing.length === 0) {
      Taro.showToast({ title: '暂无进行中的巡检任务', icon: 'none' });
      return;
    }
    if (pendingOrProcessing.length === 1) {
      setSelectedInspectionForPhoto(pendingOrProcessing[0]);
      choosePhoto(pendingOrProcessing[0].id);
      return;
    }

    const options = pendingOrProcessing.map(i => i.title);
    Taro.showActionSheet({
      itemList: options,
      success: (res) => {
        const selected = pendingOrProcessing[res.tapIndex];
        setSelectedInspectionForPhoto(selected);
        choosePhoto(selected.id);
      }
    });
  };

  const choosePhoto = (inspectionId: string) => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths?.[0] || '';
        if (tempFilePath) {
          addInspectionPhoto(inspectionId, tempFilePath);
          if (currentInspection && currentInspection.id === inspectionId) {
            setCurrentInspection(prev => prev ? {
              ...prev,
              photos: [...prev.photos, tempFilePath]
            } : null);
          }
          Taro.showToast({ title: '照片已添加', icon: 'success' });
        }
      },
      fail: () => {
        const mockUrl = `https://picsum.photos/seed/${Date.now()}/400/400`;
        addInspectionPhoto(inspectionId, mockUrl);
        if (currentInspection && currentInspection.id === inspectionId) {
          setCurrentInspection(prev => prev ? {
            ...prev,
            photos: [...prev.photos, mockUrl]
          } : null);
        }
        Taro.showToast({ title: '照片已添加', icon: 'success' });
      }
    });
  };

  const handleBindDevicePhoto = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths?.[0] || '';
        setBindForm(prev => ({ ...prev, photoUrl: tempFilePath }));
      },
      fail: () => {
        const mockUrl = `https://picsum.photos/seed/${Date.now()}/400/400`;
        setBindForm(prev => ({ ...prev, photoUrl: mockUrl }));
        Taro.showToast({ title: '照片已添加', icon: 'success' });
      }
    });
  };

  const handlePhoto = (taskId: string) => {
    if (!currentInspection) return;
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths?.[0] || '';
        updateInspectionTask(currentInspection.id, taskId, { photoUrl: tempFilePath });
        setCurrentInspection(prev => prev ? {
          ...prev,
          tasks: prev.tasks.map(t => t.id === taskId ? { ...t, photoUrl: tempFilePath } : t)
        } : null);
      },
      fail: () => {
        const mockUrl = `https://picsum.photos/seed/${taskId}/300/300`;
        updateInspectionTask(currentInspection.id, taskId, { photoUrl: mockUrl });
        setCurrentInspection(prev => prev ? {
          ...prev,
          tasks: prev.tasks.map(t => t.id === taskId ? { ...t, photoUrl: mockUrl } : t)
        } : null);
      }
    });
  };

  const markTaskStatus = (taskId: string, status: 'pass' | 'fail') => {
    if (!currentInspection) return;
    updateInspectionTask(currentInspection.id, taskId, { status });
    setCurrentInspection(prev => {
      if (!prev) return null;
      const tasks = prev.tasks.map(t => t.id === taskId ? { ...t, status } : t);
      const finished = tasks.filter(t => t.status !== 'pending').length;
      return { ...prev, tasks, finished, status: finished > 0 ? 'processing' : prev.status };
    });
  };

  const submitInspection = () => {
    if (!currentInspection) return;
    const requiredTasks = currentInspection.tasks.filter(t => t.required);
    const unfinished = requiredTasks.filter(t => t.status === 'pending');
    if (unfinished.length > 0) {
      Taro.showToast({ title: `还有${unfinished.length}项必填任务未完成`, icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '确认提交',
      content: '确定要提交本次巡检结果吗？',
      success: (res) => {
        if (res.confirm && currentInspection) {
          completeInspection(currentInspection.id);
          Taro.showToast({ title: '提交成功', icon: 'success' });
          setShowDetail(false);
          setCurrentInspection(null);
        }
      }
    });
  };

  const handleCreateInspection = () => {
    const idcOption = idcOptions.find(o => o.value === formData.idcKey);
    const typeInfo = inspectionTypes.find(t => t.key === formData.type);
    const inspectorOption = inspectorOptions.find(o => o.value === formData.inspectorId);

    if (!idcOption || !typeInfo) return;

    const planDate = formData.planDate || new Date().toISOString().split('T')[0];
    const planTimeStr = `${planDate} ${formData.planTime}:00`;

    const tasks = (inspectionTaskTemplates[formData.type] || []).map((t, idx) => ({
      ...t,
      id: `new-${Date.now()}-${idx}`
    }));

    const newInspection: InspectionItem = {
      id: `ins-${Date.now()}`,
      title: `${idcOption.label}${typeInfo.label}`,
      idc: idcOption.label,
      idcKey: formData.idcKey,
      type: formData.type,
      typeLabel: typeInfo.label,
      status: 'pending',
      total: tasks.length,
      finished: 0,
      startTime: '',
      planTime: planTimeStr,
      inspector: inspectorOption?.label || '',
      inspectorId: formData.inspectorId,
      tasks,
      boundDevices: [],
      photos: []
    };

    createInspection(newInspection);
    setShowCreateModal(false);
    Taro.showToast({ title: '巡检创建成功', icon: 'success' });
  };

  const handleBindDevice = () => {
    if (!selectedInspectionForBind || !bindForm.deviceName) {
      Taro.showToast({ title: '请填写设备名称', icon: 'none' });
      return;
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const bindTimeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const device: BoundDevice = {
      id: `dev-${Date.now()}`,
      deviceId: bindForm.deviceId,
      deviceName: bindForm.deviceName,
      deviceType: bindForm.deviceType,
      bindTime: bindTimeStr,
      photoUrl: bindForm.photoUrl || undefined,
      remark: bindForm.remark
    };

    bindDevice(selectedInspectionForBind.id, device);

    if (currentInspection && currentInspection.id === selectedInspectionForBind.id) {
      setCurrentInspection(prev => prev ? {
        ...prev,
        boundDevices: [...prev.boundDevices, device]
      } : null);
    }

    setShowBindModal(false);
    setBindForm({ deviceId: '', deviceName: '', deviceType: 'server', remark: '', photoUrl: '' });
    setSelectedInspectionForBind(null);
    Taro.showToast({ title: '设备绑定成功', icon: 'success' });
  };

  const statusTextMap: Record<string, string> = {
    pending: '待开始',
    processing: '进行中',
    completed: '已完成'
  };

  const completedCount = currentInspection?.tasks.filter(t => t.status !== 'pending').length || 0;
  const totalCount = currentInspection?.tasks.length || 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const deviceTypeMap: Record<string, string> = {
    server: '服务器',
    network: '网络设备',
    storage: '存储设备',
    security: '安全设备',
    other: '其他'
  };

  const previewPhoto = (url: string) => {
    Taro.previewImage({
      current: url,
      urls: [url]
    });
  };

  if (showDetail && currentInspection) {
    return (
      <View className={classnames(styles.pageContainer, styles.detailPage)}>
        <ScrollView scrollY style={{ height: '100vh', paddingBottom: '160rpx' }}>
          <View className={styles.detailHeader}>
            <View className={styles.detailBack} onClick={goBack}>
              ‹ 返回
            </View>
            <Text className={styles.detailTitle}>巡检详情</Text>
            <View style={{ width: '80rpx' }} />
          </View>

          <View className={styles.detailInfoCard}>
            <Text className={styles.detailInspectionTitle}>{currentInspection.title}</Text>
            <View className={styles.detailMeta}>
              <View className={styles.metaItem}>
                <Text className={styles.label}>机房：</Text>
                <Text className={styles.value}>{currentInspection.idc}</Text>
              </View>
              <View className={styles.metaItem}>
                <Text className={styles.label}>类型：</Text>
                <Text className={styles.value}>{currentInspection.typeLabel}</Text>
              </View>
              <View className={styles.metaItem}>
                <Text className={styles.label}>状态：</Text>
                <StatusTag type={currentInspection.status} text={statusTextMap[currentInspection.status]} />
              </View>
              <View className={styles.metaItem}>
                <Text className={styles.label}>巡检员：</Text>
                <Text className={styles.value}>{currentInspection.inspector || '待分配'}</Text>
              </View>
              <View className={styles.metaItem}>
                <Text className={styles.label}>计划时间：</Text>
                <Text className={styles.value}>{currentInspection.planTime || '-'}</Text>
              </View>
            </View>
          </View>

          <View className={styles.progressSection}>
            <View className={styles.progressHeader}>
              <Text style={{ fontSize: '28rpx', color: '#4e5969' }}>巡检进度</Text>
              <Text style={{ fontSize: '28rpx', fontWeight: 500, color: '#165dff' }}>{progress}%</Text>
            </View>
            <View className={styles.progressBar}>
              <View className={styles.progressFill} style={{ width: `${progress}%` }} />
            </View>
            <Text className={styles.progressText}>
              已完成 {completedCount} / {totalCount} 项
            </Text>
          </View>

          {currentInspection.photos && currentInspection.photos.length > 0 && (
            <View className={styles.photoSection}>
              <Text className={styles.sectionTitle}>
                现场照片 ({currentInspection.photos.length})
              </Text>
              <View className={styles.photoGrid}>
                {currentInspection.photos.map((photo, index) => (
                  <View key={index} className={styles.photoItem} onClick={() => previewPhoto(photo)}>
                    <Image src={photo} mode="aspectFill" className={styles.photoImg} />
                  </View>
                ))}
                {currentInspection.status !== 'completed' && (
                  <View className={styles.photoAddBtn} onClick={() => choosePhoto(currentInspection.id)}>
                    <Text className={styles.photoAddIcon}>+</Text>
                    <Text className={styles.photoAddText}>添加照片</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {currentInspection.status !== 'completed' && (!currentInspection.photos || currentInspection.photos.length === 0) && (
            <View className={styles.photoSection}>
              <Text className={styles.sectionTitle}>现场照片</Text>
              <View className={styles.photoEmpty} onClick={() => choosePhoto(currentInspection.id)}>
                <Text className={styles.photoEmptyIcon}>📷</Text>
                <Text className={styles.photoEmptyText}>点击添加现场照片</Text>
              </View>
            </View>
          )}

          {currentInspection.boundDevices && currentInspection.boundDevices.length > 0 && (
            <View className={styles.deviceSection}>
              <Text className={styles.sectionTitle}>
                已绑定设备 ({currentInspection.boundDevices.length})
              </Text>
              {currentInspection.boundDevices.map(device => (
                <View key={device.id} className={styles.deviceCard}>
                  <View className={styles.deviceInfo}>
                    <Text className={styles.deviceName}>{device.deviceName}</Text>
                    <Text className={styles.deviceDesc}>
                      编号：{device.deviceId} · {deviceTypeMap[device.deviceType] || '其他'}
                    </Text>
                    {device.remark && (
                      <Text className={styles.deviceRemark}>备注：{device.remark}</Text>
                    )}
                    <Text className={styles.deviceTime}>绑定时间：{device.bindTime}</Text>
                  </View>
                  {device.photoUrl && (
                    <View className={styles.devicePhoto} onClick={() => previewPhoto(device.photoUrl!)}>
                      <Image src={device.photoUrl} mode="aspectFill" />
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          <View className={styles.taskSection}>
            <Text className={styles.sectionTitle}>检查清单</Text>
            <View className={styles.taskList}>
              {currentInspection.tasks.map(task => (
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
                      <View className={styles.taskPhotoWrap}>
                        {task.photoUrl ? (
                          <View className={styles.taskPhoto} onClick={() => previewPhoto(task.photoUrl!)}>
                            <Image src={task.photoUrl} mode="aspectFill" />
                          </View>
                        ) : (
                          <Button
                            className={classnames(styles.taskBtn, styles.photo)}
                            onClick={() => handlePhoto(task.id)}
                          >
                            📷 拍照记录
                          </Button>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View className={styles.submitBar}>
          <Button className={styles.backBtn} onClick={goBack}>返回</Button>
          <Button
            className={styles.submitBtn}
            onClick={submitInspection}
            disabled={currentInspection.status === 'completed'}
          >
            {currentInspection.status === 'completed' ? '已完成' : '提交巡检结果'}
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
        <View className={styles.actionCard} onClick={handlePhotoEntry}>
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
        <Text className={styles.sectionTitleHeader}>巡检任务</Text>

        <View className={styles.inspectionList}>
          {inspections.map(item => (
            <View key={item.id} className={styles.inspectionCard} onClick={() => startInspection(item)}>
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
                  <Text className={styles.label}>类型：</Text>
                  <Text className={styles.value}>{item.typeLabel || '日常巡检'}</Text>
                </View>
                <View className={styles.metaItem}>
                  <Text className={styles.label}>计划时间：</Text>
                  <Text className={styles.value}>{item.planTime || item.startTime}</Text>
                </View>
              </View>

              <View className={styles.cardPhotos}>
                {item.photos && item.photos.length > 0 && (
                  <>
                    <Text className={styles.photoCountLabel}>📷 {item.photos.length}张照片</Text>
                    <View className={styles.cardPhotoList}>
                      {item.photos.slice(0, 3).map((photo, idx) => (
                        <Image key={idx} src={photo} mode="aspectFill" className={styles.cardPhoto} />
                      ))}
                    </View>
                  </>
                )}
                {item.boundDevices && item.boundDevices.length > 0 && (
                  <Text className={styles.deviceCountLabel}>📱 绑定{item.boundDevices.length}台设备</Text>
                )}
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
                  <Button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); startInspection(item); }}>
                    开始巡检
                  </Button>
                )}
                {item.status === 'processing' && (
                  <Button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); startInspection(item); }}>
                    继续巡检
                  </Button>
                )}
                {item.status === 'completed' && (
                  <Button className={classnames(styles.actionBtn, styles.secondary)} onClick={(e) => { e.stopPropagation(); startInspection(item); }}>
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
          <View className={classnames(styles.modalContent, styles.formModal)} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>发起巡检</Text>
            <Text className={styles.modalDesc}>填写巡检信息后，系统将自动生成检查清单</Text>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>机房</Text>
              <View className={styles.formSelect}>
                {idcOptions.filter(o => o.value !== 'all').map(option => (
                  <View
                    key={option.value}
                    className={classnames(styles.formOption, { [styles.active]: formData.idcKey === option.value })}
                    onClick={() => setFormData(prev => ({ ...prev, idcKey: option.value }))}
                  >
                    {option.label}
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>巡检类型</Text>
              <View className={styles.formSelect}>
                {inspectionTypes.map(type => (
                  <View
                    key={type.key}
                    className={classnames(styles.formOption, { [styles.active]: formData.type === type.key })}
                    onClick={() => setFormData(prev => ({ ...prev, type: type.key }))}
                  >
                    {type.label}
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>负责人</Text>
              <View className={styles.formSelect}>
                {inspectorOptions.map(opt => (
                  <View
                    key={opt.value}
                    className={classnames(styles.formOption, { [styles.active]: formData.inspectorId === opt.value })}
                    onClick={() => setFormData(prev => ({ ...prev, inspectorId: opt.value }))}
                  >
                    {opt.label}
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>计划时间</Text>
              <View className={styles.timeInputRow}>
                <Input
                  className={styles.dateInput}
                  type="text"
                  placeholder="选择日期"
                  value={formData.planDate}
                  onInput={e => setFormData(prev => ({ ...prev, planDate: e.detail.value }))}
                  onClick={() => {
                    const d = new Date();
                    const defaultDate = formData.planDate || `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                    Taro.showActionSheet({
                      itemList: ['今天', '明天', '后天'],
                      success: (res) => {
                        const dates = ['今天', '明天', '后天'];
                        const offset = dates.indexOf(dates[res.tapIndex]);
                        const targetDate = new Date(Date.now() + offset * 86400000);
                        const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth()+1).padStart(2,'0')}-${String(targetDate.getDate()).padStart(2,'0')}`;
                        setFormData(prev => ({ ...prev, planDate: dateStr }));
                      }
                    });
                  }}
                />
                <Input
                  className={styles.timeInput}
                  type="text"
                  placeholder="09:00"
                  value={formData.planTime}
                  onInput={e => setFormData(prev => ({ ...prev, planTime: e.detail.value }))}
                />
              </View>
            </View>

            <View className={styles.modalActions}>
              <Button className={classnames(styles.btn, styles.cancel)} onClick={() => setShowCreateModal(false)}>
                取消
              </Button>
              <Button className={classnames(styles.btn, styles.confirm)} onClick={handleCreateInspection}>
                确认创建
              </Button>
            </View>
          </View>
        </View>
      )}

      {showBindModal && (
        <View className={styles.modalMask} onClick={() => setShowBindModal(false)}>
          <View className={classnames(styles.modalContent, styles.formModal)} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>绑定设备</Text>
            <Text className={styles.modalDesc}>
              绑定到：{selectedInspectionForBind?.title}
            </Text>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>设备编号</Text>
              <Input
                className={styles.formInput}
                value={bindForm.deviceId}
                placeholder="请输入设备编号"
                onInput={e => setBindForm(prev => ({ ...prev, deviceId: e.detail.value }))}
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>设备名称</Text>
              <Input
                className={styles.formInput}
                value={bindForm.deviceName}
                placeholder="请输入设备名称"
                onInput={e => setBindForm(prev => ({ ...prev, deviceName: e.detail.value }))}
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>设备类型</Text>
              <View className={styles.formSelect}>
                {Object.entries(deviceTypeMap).map(([key, label]) => (
                  <View
                    key={key}
                    className={classnames(styles.formOption, { [styles.active]: bindForm.deviceType === key })}
                    onClick={() => setBindForm(prev => ({ ...prev, deviceType: key }))}
                  >
                    {label}
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>现场照片</Text>
              <View className={styles.bindPhotoWrap}>
                {bindForm.photoUrl ? (
                  <View className={styles.bindPhotoPreview} onClick={() => previewPhoto(bindForm.photoUrl)}>
                    <Image src={bindForm.photoUrl} mode="aspectFill" />
                    <View className={styles.bindPhotoRemove} onClick={(e) => {
                      e.stopPropagation();
                      setBindForm(prev => ({ ...prev, photoUrl: '' }));
                    }}>×</View>
                  </View>
                ) : (
                  <View className={styles.bindPhotoUpload} onClick={handleBindDevicePhoto}>
                    <Text className={styles.uploadIcon}>📷</Text>
                    <Text className={styles.uploadText}>点击上传照片</Text>
                  </View>
                )}
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>备注</Text>
              <Textarea
                className={styles.formTextarea}
                value={bindForm.remark}
                placeholder="请输入备注信息（选填）"
                onInput={e => setBindForm(prev => ({ ...prev, remark: e.detail.value }))}
                maxlength={200}
              />
            </View>

            <View className={styles.modalActions}>
              <Button className={classnames(styles.btn, styles.cancel)} onClick={() => setShowBindModal(false)}>
                取消
              </Button>
              <Button className={classnames(styles.btn, styles.confirm)} onClick={handleBindDevice}>
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
