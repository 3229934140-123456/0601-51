import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Textarea, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { AlertItem, AlertLevel, AlertStatus } from '@/types';
import { useAppStore } from '@/store';
import { alertLevelOptions, alertStatusOptions, statusLabelMap } from '@/data/alert';
import { idcOptions, bizOptions } from '@/data/overview';
import AlertCard from '@/components/AlertCard';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

const AlertPage: React.FC = () => {
  const { alerts, confirmAlert, transferAlert, resolveAlert, updateAlertStatus, addHandover } = useAppStore();
  const [levelFilter, setLevelFilter] = useState<AlertLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [idcFilter, setIdcFilter] = useState('all');
  const [bizFilter, setBizFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showIdcPicker, setShowIdcPicker] = useState(false);
  const [showBizPicker, setShowBizPicker] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<AlertItem | null>(null);
  const [processRecord, setProcessRecord] = useState('');
  const [transferRemark, setTransferRemark] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [processType, setProcessType] = useState<'confirm' | 'resolve'>('confirm');
  const [progressType, setProgressType] = useState<AlertStatus>('investigating');
  const [progressContent, setProgressContent] = useState('');
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverTo, setHandoverTo] = useState('');
  const [handoverNextAction, setHandoverNextAction] = useState('');

  const handlePersons = ['张三', '李四', '王五', '赵六', '孙七'];

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (levelFilter !== 'all' && alert.level !== levelFilter) return false;
      if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
      if (idcFilter !== 'all' && alert.idcKey !== idcFilter) return false;
      if (bizFilter !== 'all' && alert.bizKey !== bizFilter) return false;
      return true;
    });
  }, [alerts, levelFilter, statusFilter, idcFilter, bizFilter]);

  const stats = useMemo(() => {
    return {
      total: filteredAlerts.length,
      pending: filteredAlerts.filter(a => a.status === 'pending').length,
      processing: filteredAlerts.filter(a => 
        a.status === 'investigating' || 
        a.status === 'waiting_external' || 
        a.status === 'temp_restored'
      ).length,
      resolved: filteredAlerts.filter(a => a.status === 'resolved' || a.status === 'closed').length
    };
  }, [filteredAlerts]);

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
    setProcessType('confirm');
    setProcessRecord('');
    setShowProcessModal(true);
  };

  const handleTransfer = (id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (!alert) return;
    setCurrentAlert(alert);
    setSelectedPerson('');
    setTransferRemark('');
    setShowTransferModal(true);
  };

  const handleResolve = (id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (!alert) return;
    setCurrentAlert(alert);
    setProcessType('resolve');
    setProcessRecord('');
    setShowProcessModal(true);
  };

  const handleProgress = (id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (!alert) return;
    setCurrentAlert(alert);
    setProgressType('investigating');
    setProgressContent('');
    setShowProgressModal(true);
  };

  const handleViewDetail = (alert: AlertItem) => {
    const freshAlert = alerts.find(a => a.id === alert.id);
    setCurrentAlert(freshAlert || alert);
    setShowDetail(true);
  };

  const submitProcess = () => {
    if (!currentAlert || !processRecord.trim()) {
      Taro.showToast({ title: '请填写处理记录', icon: 'none' });
      return;
    }
    if (processType === 'confirm') {
      confirmAlert(currentAlert.id, processRecord);
    } else {
      resolveAlert(currentAlert.id, processRecord);
    }
    setShowProcessModal(false);
    Taro.showToast({ title: '操作成功', icon: 'success' });
  };

  const submitTransfer = () => {
    if (!currentAlert || !selectedPerson) {
      Taro.showToast({ title: '请选择转派人', icon: 'none' });
      return;
    }
    transferAlert(currentAlert.id, selectedPerson, transferRemark);
    setShowTransferModal(false);
    Taro.showToast({ title: '转派成功', icon: 'success' });
  };

  const progressOptions = [
    { value: 'investigating' as AlertStatus, label: '开始排查', action: '开始排查' },
    { value: 'waiting_external' as AlertStatus, label: '等待外部支持', action: '等待外部支持' },
    { value: 'temp_restored' as AlertStatus, label: '临时恢复', action: '临时恢复' },
    { value: 'resolved' as AlertStatus, label: '彻底解决', action: '彻底解决' }
  ];

  const submitProgress = () => {
    if (!currentAlert) return;
    if (!progressContent.trim()) {
      Taro.showToast({ title: '请填写进展说明', icon: 'none' });
      return;
    }
    const option = progressOptions.find(o => o.value === progressType);
    updateAlertStatus(currentAlert.id, progressType, option?.action || '追加进展', progressContent);
    setShowProgressModal(false);
    Taro.showToast({ title: '已更新', icon: 'success' });
  };

  const handleHandover = (id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (!alert) return;
    setCurrentAlert(alert);
    setHandoverTo('');
    setHandoverNextAction('');
    setShowHandoverModal(true);
  };

  const submitHandover = () => {
    if (!currentAlert) return;
    if (!handoverTo) {
      Taro.showToast({ title: '请选择接收人', icon: 'none' });
      return;
    }
    if (!handoverNextAction.trim()) {
      Taro.showToast({ title: '请填写下一步动作', icon: 'none' });
      return;
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newItem: any = {
      id: `h-${Date.now()}`,
      title: `【告警交接】${currentAlert.title}`,
      content: `告警状态：${statusLabelMap[currentAlert.status]}\n当前进展：${currentAlert.content}`,
      status: 'pending',
      createTime: timeStr,
      from: '我',
      fromId: 'currentUser',
      to: handoverTo,
      toId: handoverTo,
      sourceAlertId: currentAlert.id,
      sourceAlertTitle: currentAlert.title,
      sourceAlertLevel: currentAlert.level,
      alertStatus: currentAlert.status,
      nextAction: handoverNextAction
    };

    addHandover(newItem);
    setShowHandoverModal(false);
    Taro.showToast({ title: '交接已创建', icon: 'success' });
  };

  const handleReset = () => {
    setLevelFilter('all');
    setStatusFilter('all');
    setIdcFilter('all');
    setBizFilter('all');
    Taro.showToast({ title: '已重置筛选', icon: 'none' });
  };

  const hasActiveFilter = levelFilter !== 'all' || statusFilter !== 'all' || idcFilter !== 'all' || bizFilter !== 'all';

  const idcLabelMap: Record<string, string> = {};
  idcOptions.forEach(opt => { idcLabelMap[opt.value] = opt.label; });

  const bizLabelMap: Record<string, string> = {};
  bizOptions.forEach(opt => { bizLabelMap[opt.value] = opt.label; });

  const detailAlert = useMemo(() => {
    if (!currentAlert) return null;
    return alerts.find(a => a.id === currentAlert.id) || currentAlert;
  }, [alerts, currentAlert]);

  if (showDetail && detailAlert) {
    return (
      <View className={classnames(styles.pageContainer, styles.detailPage)}>
        <ScrollView scrollY style={{ height: '100vh', paddingBottom: '40rpx' }}>
          <View className={styles.detailHeader}>
            <View className={styles.detailBack} onClick={() => { setShowDetail(false); setCurrentAlert(null); }}>
              ‹ 返回
            </View>
            <Text className={styles.detailTitle}>告警详情</Text>
            <View style={{ width: '80rpx' }} />
          </View>

          <View className={styles.alertDetailCard}>
            <View className={styles.alertTitleRow}>
              <StatusTag type={detailAlert.level.toLowerCase()} text={detailAlert.level} />
              <Text className={styles.alertTitle}>{detailAlert.title}</Text>
            </View>
            <View className={styles.alertMeta}>
              <View className={styles.metaItem}>
                <Text className={styles.metaLabel}>主机：</Text>
                <Text className={styles.metaValue}>{detailAlert.hostName}</Text>
              </View>
              <View className={styles.metaItem}>
                <Text className={styles.metaLabel}>服务：</Text>
                <Text className={styles.metaValue}>{detailAlert.serviceName}</Text>
              </View>
              <View className={styles.metaItem}>
                <Text className={styles.metaLabel}>机房：</Text>
                <Text className={styles.metaValue}>{detailAlert.idc}</Text>
              </View>
              <View className={styles.metaItem}>
                <Text className={styles.metaLabel}>业务：</Text>
                <Text className={styles.metaValue}>{detailAlert.biz}</Text>
              </View>
              <View className={styles.metaItem}>
                <Text className={styles.metaLabel}>创建时间：</Text>
                <Text className={styles.metaValue}>{detailAlert.createTime}</Text>
              </View>
              {detailAlert.handlerName && (
                <View className={styles.metaItem}>
                  <Text className={styles.metaLabel}>处理人：</Text>
                  <Text className={styles.metaValue}>{detailAlert.handlerName}</Text>
                </View>
              )}
            </View>
            <View className={styles.alertContent}>
              <Text className={styles.contentLabel}>告警描述</Text>
              <Text className={styles.contentText}>{detailAlert.content}</Text>
            </View>
          </View>

          <View className={styles.timelineSection}>
            <Text className={styles.sectionTitle}>处理时间线</Text>
            {detailAlert.processRecords && detailAlert.processRecords.length > 0 ? (
              <View className={styles.timeline}>
                {detailAlert.processRecords.map((record, index) => (
                  <View key={record.id} className={styles.timelineItem}>
                    <View className={classnames(styles.timelineDot, { [styles.first]: index === 0 })} />
                    <View className={styles.timelineContent}>
                      <View className={styles.timelineHeader}>
                        <Text className={styles.timelineAction}>{record.action}</Text>
                        <Text className={styles.timelineTime}>{record.time}</Text>
                      </View>
                      <Text className={styles.timelineOperator}>操作人：{record.operatorName}</Text>
                      {record.fromStatus && record.toStatus && record.fromStatus !== record.toStatus && (
                        <Text className={styles.timelineStatus}>
                          状态：{statusLabelMap[record.fromStatus]} → {statusLabelMap[record.toStatus]}
                        </Text>
                      )}
                      {record.transferToName && (
                        <Text className={styles.timelineTransfer}>转派给：{record.transferToName}</Text>
                      )}
                      {record.content && (
                        <Text className={styles.timelineRemark}>{record.content}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className={styles.emptyTimeline}>
                <Text>暂无处理记录</Text>
              </View>
            )}
          </View>

          {(detailAlert.status === 'pending' || detailAlert.status === 'investigating' || detailAlert.status === 'waiting_external' || detailAlert.status === 'temp_restored') && (
            <View className={styles.detailActions}>
              {detailAlert.status === 'pending' && (
                <Button className={styles.actionPrimary} onClick={() => handleConfirm(detailAlert.id)}>
                  确认告警
                </Button>
              )}
              {detailAlert.status !== 'pending' && (
                <Button className={styles.actionPrimary} onClick={() => handleProgress(detailAlert.id)}>
                  追加进展
                </Button>
              )}
              <Button className={styles.actionSecondary} onClick={() => handleTransfer(detailAlert.id)}>
                转派告警
              </Button>
              <Button className={styles.actionWarning} onClick={() => handleHandover(detailAlert.id)}>
                生成交接
              </Button>
              {detailAlert.status !== 'pending' && (
                <Button className={styles.actionSuccess} onClick={() => handleResolve(detailAlert.id)}>
                  标记解决
                </Button>
              )}
            </View>
          )}
        </ScrollView>

        {showProcessModal && currentAlert && (
          <View className={styles.modalMask} onClick={() => setShowProcessModal(false)}>
            <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <Text className={styles.modalTitle}>
                {processType === 'confirm' ? '确认告警' : '处理记录'}
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

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>转派说明</Text>
                <Textarea
                  className={styles.formTextarea}
                  placeholder="请输入转派说明（选填）"
                  value={transferRemark}
                  onInput={e => setTransferRemark(e.detail.value)}
                  maxlength={500}
                />
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

        {showProgressModal && currentAlert && (
          <View className={styles.modalMask} onClick={() => setShowProgressModal(false)}>
            <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <Text className={styles.modalTitle}>追加进展</Text>
              <StatusTag type={currentAlert.level.toLowerCase()} text={currentAlert.level} />
              <Text style={{ marginTop: '16rpx', fontSize: '28rpx', color: '#1d2129', fontWeight: 500 }}>
                {currentAlert.title}
              </Text>

              <View className={styles.formGroup} style={{ marginTop: '32rpx' }}>
                <Text className={styles.formLabel}>进展状态</Text>
                <View className={styles.progressTypeList}>
                  {progressOptions.map(option => (
                    <View
                      key={option.value}
                      className={classnames(styles.progressTypeItem, { [styles.selected]: progressType === option.value })}
                      onClick={() => setProgressType(option.value)}
                    >
                      <Text>{option.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>进展说明</Text>
                <Textarea
                  className={styles.formTextarea}
                  placeholder="请输入进展说明..."
                  value={progressContent}
                  onInput={e => setProgressContent(e.detail.value)}
                  maxlength={500}
                />
              </View>

              <View className={styles.modalActions}>
                <Button className={classnames(styles.btn, styles.cancel)} onClick={() => setShowProgressModal(false)}>
                  取消
                </Button>
                <Button className={classnames(styles.btn, styles.confirm)} onClick={submitProgress}>
                  提交进展
                </Button>
              </View>
            </View>
          </View>
        )}

        {showHandoverModal && currentAlert && (
          <View className={styles.modalMask} onClick={() => setShowHandoverModal(false)}>
            <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <Text className={styles.modalTitle}>生成交接待办</Text>
              <StatusTag type={currentAlert.level.toLowerCase()} text={currentAlert.level} />
              <Text style={{ marginTop: '16rpx', fontSize: '28rpx', color: '#1d2129', fontWeight: 500 }}>
                {currentAlert.title}
              </Text>
              <Text style={{ marginTop: '8rpx', fontSize: '24rpx', color: '#86909c' }}>
                当前状态：{statusLabelMap[currentAlert.status]}
              </Text>

              <View className={styles.formGroup} style={{ marginTop: '32rpx' }}>
                <Text className={styles.formLabel}>接收人</Text>
                <View className={styles.personList}>
                  {handlePersons.map(person => (
                    <View
                      key={person}
                      className={classnames(styles.personItem, { [styles.selected]: handoverTo === person })}
                      onClick={() => setHandoverTo(person)}
                    >
                      {person}
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>下一步动作</Text>
                <Textarea
                  className={styles.formTextarea}
                  placeholder="请描述下一步需要做什么..."
                  value={handoverNextAction}
                  onInput={e => setHandoverNextAction(e.detail.value)}
                  maxlength={500}
                />
              </View>

              <View className={styles.modalActions}>
                <Button className={classnames(styles.btn, styles.cancel)} onClick={() => setShowHandoverModal(false)}>
                  取消
                </Button>
                <Button className={classnames(styles.btn, styles.confirm)} onClick={submitHandover}>
                  生成交接
                </Button>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }

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
        <ScrollView scrollX className={styles.levelTabs}>
          {alertLevelOptions.map(option => (
            <View
              key={option.value}
              className={classnames(styles.levelTab, { [styles.active]: levelFilter === option.value })}
              onClick={() => setLevelFilter(option.value as any)}
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
              <View key={alert.id} onClick={() => handleViewDetail(alert)}>
                <AlertCard
                  alert={alert}
                  onConfirm={handleConfirm}
                  onTransfer={handleTransfer}
                  onResolve={handleResolve}
                  onProgress={handleProgress}
                />
              </View>
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>🔔</Text>
              <Text className={styles.emptyText}>暂无告警数据</Text>
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

      {showProcessModal && currentAlert && (
        <View className={styles.modalMask} onClick={() => setShowProcessModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>
              {processType === 'confirm' ? '确认告警' : '处理记录'}
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
