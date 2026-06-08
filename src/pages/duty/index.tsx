import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Button, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { DutyRecord, HandoverItem, AlertItem } from '@/types';
import { useAppStore } from '@/store';
import { generateMonthDutyList, dutyPersons } from '@/data/duty';
import { statusLabelMap } from '@/data/alert';
import StatusTag from '@/components/StatusTag';
import AlertCard from '@/components/AlertCard';
import styles from './index.module.scss';

const DutyPage: React.FC = () => {
  const { handovers, addHandover, completeHandover, alerts } = useAppStore();
  const [activeTab, setActiveTab] = useState<'schedule' | 'handover' | 'mytodo'>('schedule');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    to: '张三',
    toId: 'zhangsan'
  });

  const currentUser = { name: '张三', id: 'zhangsan' };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const monthDutyList = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return generateMonthDutyList(year, month);
  }, [currentMonth]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 1000);
  }, []);

  const currentDuty = useMemo(() => {
    const todayDuties = monthDutyList.filter(d => d.date === todayStr);
    return todayDuties;
  }, [monthDutyList, todayStr]);

  const displayDate = selectedDate || todayStr;
  const selectedDuty = useMemo(() => {
    return monthDutyList.filter(d => d.date === displayDate);
  }, [monthDutyList, displayDate]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayWeekday = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [currentMonth]);

  const getDutyForDate = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return monthDutyList.filter(d => d.date === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const markHandoverDone = (id: string) => {
    completeHandover(id);
    Taro.showToast({ title: '已完成交接', icon: 'success' });
  };

  const callPhone = (phone: string) => {
    Taro.makePhoneCall({
      phoneNumber: phone.replace(/\*/g, '0'),
      fail: () => {
        Taro.showToast({ title: '拨号功能需真机测试', icon: 'none' });
      }
    });
  };

  const handleAddHandover = () => {
    if (!formData.title.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }
    if (!formData.content.trim()) {
      Taro.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newItem: HandoverItem = {
      id: `h-${Date.now()}`,
      title: formData.title,
      content: formData.content,
      status: 'pending',
      createTime: timeStr,
      from: '我',
      fromId: 'currentUser',
      to: formData.to,
      toId: formData.toId
    };

    addHandover(newItem);
    setShowAddModal(false);
    setFormData({ title: '', content: '', to: '张三', toId: 'zhangsan' });
    Taro.showToast({ title: '交接事项已创建', icon: 'success' });
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const pendingCount = handovers.filter(h => h.status === 'pending').length;

  const myAlerts = useMemo(() => {
    return alerts.filter(a => 
      a.handler === currentUser.id && 
      a.status !== 'resolved' && 
      a.status !== 'closed'
    );
  }, [alerts, currentUser.id]);

  const myHandovers = useMemo(() => {
    return handovers.filter(h => h.to === currentUser.name && h.status === 'pending');
  }, [handovers, currentUser.name]);

  const myTodoCount = myAlerts.length + myHandovers.length;

  const receiverOptions = [
    { value: 'zhangsan', label: '张三' },
    { value: 'lisi', label: '李四' },
    { value: 'wangwu', label: '王五' },
    { value: 'zhaoliu', label: '赵六' },
    { value: 'sunqi', label: '孙七' },
    { value: 'zhouba', label: '周八' },
    { value: 'wujiu', label: '吴九' },
    { value: 'zhengshi', label: '郑十' }
  ];

  const monthListDays = useMemo(() => {
    const uniqueDates = Array.from(new Set(monthDutyList.map(d => d.date))).sort();
    return uniqueDates.map(date => {
      const dayDuties = monthDutyList.filter(d => d.date === date);
      return { date, duties: dayDuties };
    });
  }, [monthDutyList]);

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
  };

  const isToday = (dateStr: string) => dateStr === todayStr;
  const isSelected = (dateStr: string) => dateStr === displayDate;

  return (
    <View className={styles.pageContainer}>
      <View className={styles.tabBar}>
        <View
          className={classnames(styles.tabItem, { [styles.active]: activeTab === 'schedule' })}
          onClick={() => setActiveTab('schedule')}
        >
          值班排班
        </View>
        <View
          className={classnames(styles.tabItem, { [styles.active]: activeTab === 'mytodo' })}
          onClick={() => setActiveTab('mytodo')}
        >
          我的待办
          {myTodoCount > 0 && (
            <Text className={styles.badge}>{myTodoCount}</Text>
          )}
        </View>
        <View
          className={classnames(styles.tabItem, { [styles.active]: activeTab === 'handover' })}
          onClick={() => setActiveTab('handover')}
        >
          交接事项
          {pendingCount > 0 && (
            <Text className={styles.badge}>{pendingCount}</Text>
          )}
        </View>
      </View>

      <ScrollView
        scrollY
        refresherEnabled
        refresherTriggered={refreshing}
        onRefresherRefresh={handleRefresh}
        style={{ height: 'calc(100vh - 100rpx)' }}
      >
        <View className={styles.content}>
          {activeTab === 'schedule' && (
            <>
              <View className={styles.currentDuty}>
                <Text className={styles.dutyLabel}>
                  {selectedDate ? formatDateLabel(selectedDate) + ' 值班' : '今日值班'}
                  {!selectedDate && <Text className={styles.todayBadge}>今天</Text>}
                </Text>
                {selectedDuty.length > 0 ? (
                  <View className={styles.dutyCards}>
                    {selectedDuty.map(duty => (
                      <View key={duty.id} className={styles.dutyInfo}>
                        <View className={styles.dutyPerson}>
                          <View className={classnames(styles.avatar, { [styles.night]: duty.shift === '夜班' })}>
                            {duty.name.charAt(0)}
                          </View>
                          <View className={styles.personInfo}>
                            <Text className={styles.name}>{duty.name}</Text>
                            <Text className={styles.shift}>
                              {duty.shift} · {duty.phone}
                            </Text>
                          </View>
                        </View>
                        <Button
                          className={styles.contactBtn}
                          onClick={() => callPhone(duty.phone)}
                        >
                          联系
                        </Button>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={{ color: '#86909c', fontSize: '28rpx' }}>暂无值班信息</Text>
                )}
              </View>

              <View className={styles.dutyCalendar}>
                <View className={styles.calendarHeader}>
                  <View className={styles.navBtn} onClick={handlePrevMonth}>‹</View>
                  <Text className={styles.monthLabel}>
                    {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
                  </Text>
                  <View className={styles.navBtn} onClick={handleNextMonth}>›</View>
                </View>
                <View className={styles.weekDays}>
                  {weekDays.map(day => (
                    <View key={day} className={styles.weekDay}>{day}</View>
                  ))}
                </View>
                <View className={styles.daysGrid}>
                  {calendarDays.map((day, index) => {
                    if (day === null) {
                      return <View key={index} className={classnames(styles.dayCell, styles.empty)} />;
                    }
                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayDuties = getDutyForDate(day);
                    const hasDuty = dayDuties.length > 0;
                    const dayShift = dayDuties.find(d => d.shift === '白班');
                    const nightShift = dayDuties.find(d => d.shift === '夜班');
                    const todayFlag = isToday(dateStr);
                    const selectedFlag = isSelected(dateStr);

                    return (
                      <View
                        key={index}
                        className={classnames(styles.dayCell, {
                          [styles.today]: todayFlag,
                          [styles.selected]: selectedFlag,
                          [styles.hasDuty]: hasDuty
                        })}
                        onClick={() => handleDateSelect(day)}
                      >
                        <Text className={styles.dayNum}>{day}</Text>
                        {hasDuty && (
                          <View className={styles.dayDutyNames}>
                            <Text className={styles.dutyInitial}>{dayShift?.name.charAt(0)}</Text>
                            <Text className={styles.dutyInitial}>{nightShift?.name.charAt(0)}</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>

              <Text className={styles.sectionTitle}>
                <Text className={styles.titleLeft}>当月排班</Text>
                <Text className={styles.more}>{monthListDays.length}天</Text>
              </Text>

              <View className={styles.dutyList}>
                {monthListDays.map(({ date, duties }) => {
                  const dayShift = duties.find(r => r.shift === '白班');
                  const nightShift = duties.find(r => r.shift === '夜班');
                  const todayFlag = isToday(date);

                  return (
                    <View
                      key={date}
                      className={classnames(styles.dutyItem, { [styles.todayItem]: todayFlag })}
                    >
                      <View className={styles.dateInfo}>
                        <Text className={styles.date}>
                          {new Date(date).getDate()}
                        </Text>
                        <Text className={styles.weekday}>
                          {formatDateLabel(date).split(' ')[1]}
                          {todayFlag && ' (今天)'}
                        </Text>
                      </View>
                      <View className={styles.shiftInfo}>
                        {dayShift && (
                          <View className={styles.shiftRow}>
                            <Text className={styles.shiftLabel}>白班</Text>
                            <Text className={styles.person}>{dayShift.name}</Text>
                          </View>
                        )}
                        {nightShift && (
                          <View className={styles.shiftRow}>
                            <Text className={styles.shiftLabel}>夜班</Text>
                            <Text className={styles.person}>{nightShift.name}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {activeTab === 'mytodo' && (
            <>
              <View className={styles.myTodoHeader}>
                <Text className={styles.sectionTitle}>
                  我的待办
                  <Text style={{ fontSize: '24rpx', color: '#86909c', marginLeft: '16rpx', fontWeight: 'normal' }}>
                    当前身份：{currentUser.name}
                  </Text>
                </Text>
              </View>

              <View className={styles.todoStats}>
                <View className={styles.todoStatItem}>
                  <Text className={styles.todoStatNum}>{myAlerts.length}</Text>
                  <Text className={styles.todoStatLabel}>待处理告警</Text>
                </View>
                <View className={styles.todoStatItem}>
                  <Text className={styles.todoStatNum}>{myHandovers.length}</Text>
                  <Text className={styles.todoStatLabel}>交接事项</Text>
                </View>
              </View>

              <View className={styles.todoSection}>
                <Text className={styles.sectionSubTitle}>待处理告警</Text>
                {myAlerts.length > 0 ? (
                  <View className={styles.alertMiniList}>
                    {myAlerts.map(alert => (
                      <View key={alert.id} className={styles.alertMiniCard}>
                        <View className={styles.alertMiniHeader}>
                          <StatusTag type={alert.level.toLowerCase()} text={alert.level} />
                          <Text className={styles.alertMiniTitle}>{alert.title}</Text>
                        </View>
                        <View className={styles.alertMiniMeta}>
                          <Text>{alert.hostName}</Text>
                          <StatusTag type={alert.status} text={statusLabelMap[alert.status]} />
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className={styles.emptySmall}>
                    <Text>暂无待处理告警</Text>
                  </View>
                )}
              </View>

              <View className={styles.todoSection}>
                <Text className={styles.sectionSubTitle}>待接交接</Text>
                {myHandovers.length > 0 ? (
                  myHandovers.map(item => (
                    <View key={item.id} className={classnames(styles.handoverCard, styles[item.status])}>
                      <View className={styles.cardHeader}>
                        <Text className={styles.cardTitle}>{item.title}</Text>
                        <StatusTag type={item.status} text={item.status === 'pending' ? '待办' : '已完成'} />
                      </View>
                      <View className={styles.cardContent}>{item.content}</View>
                      {item.sourceAlertTitle && (
                        <View className={styles.sourceAlert}>
                          <Text className={styles.sourceAlertLabel}>来源告警：</Text>
                          <View className={styles.sourceAlertInfo}>
                            <StatusTag type={item.sourceAlertLevel?.toLowerCase()} text={item.sourceAlertLevel} />
                            <Text className={styles.sourceAlertTitle}>{item.sourceAlertTitle}</Text>
                          </View>
                          {item.alertStatus && (
                            <Text className={styles.sourceAlertStatus}>
                              当前状态：{statusLabelMap[item.alertStatus]}
                            </Text>
                          )}
                          {item.nextAction && (
                            <Text className={styles.sourceAlertNext}>下一步：{item.nextAction}</Text>
                          )}
                        </View>
                      )}
                      <View className={styles.cardFooter}>
                        <View className={styles.fromInfo}>
                          <Text>交接人：{item.from}</Text>
                        </View>
                        <Text className={styles.time}>{item.createTime}</Text>
                      </View>
                      {item.status === 'pending' && (
                        <View style={{ marginTop: '24rpx', textAlign: 'right' }}>
                          <Button
                            className={styles.actionBtn}
                            onClick={() => markHandoverDone(item.id)}
                          >
                            标记完成
                          </Button>
                        </View>
                      )}
                    </View>
                  ))
                ) : (
                  <View className={styles.emptySmall}>
                    <Text>暂无待接交接</Text>
                  </View>
                )}
              </View>
            </>
          )}

          {activeTab === 'handover' && (
            <>
              <View className={styles.handoverHeader}>
                <Text className={styles.sectionTitle} style={{ marginBottom: 0 }}>
                  <Text className={styles.titleLeft}>交接待办</Text>
                  <Text className={styles.more}>{pendingCount} 项待办</Text>
                </Text>
                <Button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
                  + 新增
                </Button>
              </View>

              <View className={styles.handoverSection}>
                {handovers.length > 0 ? (
                  handovers.map(item => (
                    <View
                      key={item.id}
                      className={classnames(styles.handoverCard, styles[item.status])}
                    >
                      <View className={styles.cardHeader}>
                        <Text className={styles.cardTitle}>{item.title}</Text>
                        <StatusTag
                          type={item.status}
                          text={item.status === 'pending' ? '待办' : '已完成'}
                        />
                      </View>
                      <View className={styles.cardContent}>{item.content}</View>
                      {item.sourceAlertTitle && (
                        <View className={styles.sourceAlert}>
                          <Text className={styles.sourceAlertLabel}>来源告警：</Text>
                          <View className={styles.sourceAlertInfo}>
                            <StatusTag type={item.sourceAlertLevel?.toLowerCase()} text={item.sourceAlertLevel} />
                            <Text className={styles.sourceAlertTitle}>{item.sourceAlertTitle}</Text>
                          </View>
                          {item.alertStatus && (
                            <Text className={styles.sourceAlertStatus}>
                              当前状态：{statusLabelMap[item.alertStatus]}
                            </Text>
                          )}
                          {item.nextAction && (
                            <Text className={styles.sourceAlertNext}>下一步：{item.nextAction}</Text>
                          )}
                        </View>
                      )}
                      <View className={styles.cardFooter}>
                        <View className={styles.fromInfo}>
                          <Text>交接人：{item.from}</Text>
                          {item.to && <Text style={{ marginLeft: '16rpx' }}>→ 接收人：{item.to}</Text>}
                        </View>
                        <Text className={styles.time}>{item.createTime}</Text>
                      </View>
                      {item.status === 'pending' && (
                        <View style={{ marginTop: '24rpx', textAlign: 'right' }}>
                          <Button
                            className={styles.actionBtn}
                            onClick={() => markHandoverDone(item.id)}
                          >
                            标记完成
                          </Button>
                        </View>
                      )}
                      {item.status === 'done' && item.completeTime && (
                        <View style={{ marginTop: '16rpx', textAlign: 'right' }}>
                          <Text style={{ fontSize: '24rpx', color: '#86909c' }}>
                            完成时间：{item.completeTime}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))
                ) : (
                  <View className={styles.emptyState}>
                    <Text className={styles.emptyIcon}>📋</Text>
                    <Text className={styles.emptyText}>暂无交接事项</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {showAddModal && (
        <View className={styles.modalMask} onClick={() => setShowAddModal(false)}>
          <View className={classnames(styles.modalContent, styles.formModal)} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>新增交接事项</Text>
            <Text className={styles.modalDesc}>填写交接信息并指定接收人</Text>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>标题</Text>
              <Input
                className={styles.formInput}
                value={formData.title}
                placeholder="请输入事项标题"
                onInput={e => setFormData(prev => ({ ...prev, title: e.detail.value }))}
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>内容</Text>
              <Textarea
                className={styles.formTextarea}
                value={formData.content}
                placeholder="请输入详细内容"
                onInput={e => setFormData(prev => ({ ...prev, content: e.detail.value }))}
                maxlength={500}
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>交接给</Text>
              <View className={styles.formSelect}>
                {receiverOptions.map(opt => (
                  <View
                    key={opt.value}
                    className={classnames(styles.formOption, { [styles.active]: formData.toId === opt.value })}
                    onClick={() => setFormData(prev => ({ ...prev, to: opt.label, toId: opt.value }))}
                  >
                    {opt.label}
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.modalActions}>
              <Button className={classnames(styles.btn, styles.cancel)} onClick={() => setShowAddModal(false)}>
                取消
              </Button>
              <Button className={classnames(styles.btn, styles.confirm)} onClick={handleAddHandover}>
                确认提交
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default DutyPage;
