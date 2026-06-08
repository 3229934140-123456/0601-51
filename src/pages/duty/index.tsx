import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { DutyRecord, HandoverItem } from '@/types';
import { dutyList, handoverList as initialHandoverList } from '@/data/duty';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

const DutyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'handover'>('schedule');
  const [dutyRecords] = useState<DutyRecord[]>(dutyList);
  const [handoverList, setHandoverList] = useState<HandoverItem[]>(initialHandoverList);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 1000);
  }, []);

  const currentDuty = useMemo(() => {
    const todayDuties = dutyRecords.filter(d => d.date === todayStr);
    return todayDuties.length > 0 ? todayDuties[0] : null;
  }, [dutyRecords, todayStr]);

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
    return dutyRecords.filter(d => d.date === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const markHandoverDone = (id: string) => {
    setHandoverList(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'done' as const } : item
    ));
    Taro.showToast({ title: '已完成交接', icon: 'success' });
    console.log('[Duty] 完成交接事项:', id);
  };

  const callPhone = (phone: string) => {
    Taro.makePhoneCall({
      phoneNumber: phone.replace(/\*/g, '0'),
      fail: () => {
        Taro.showToast({ title: '拨号功能需真机测试', icon: 'none' });
      }
    });
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const pendingCount = handoverList.filter(h => h.status === 'pending').length;

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
          className={classnames(styles.tabItem, { [styles.active]: activeTab === 'handover' })}
          onClick={() => setActiveTab('handover')}
        >
          交接事项
          {pendingCount > 0 && (
            <Text
              style={{
                marginLeft: '8rpx',
                background: '#f53f3f',
                color: '#fff',
                fontSize: '20rpx',
                padding: '2rpx 12rpx',
                borderRadius: '999rpx'
              }}
            >
              {pendingCount}
            </Text>
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
                <Text className={styles.dutyLabel}>今日值班</Text>
                {currentDuty ? (
                  <View className={styles.dutyInfo}>
                    <View className={styles.dutyPerson}>
                      <View className={styles.avatar}>
                        {currentDuty.name.charAt(0)}
                      </View>
                      <View className={styles.personInfo}>
                        <Text className={styles.name}>{currentDuty.name}</Text>
                        <Text className={styles.shift}>
                          {currentDuty.shift} · {currentDuty.phone}
                        </Text>
                      </View>
                    </View>
                    <Button
                      className={styles.contactBtn}
                      onClick={() => callPhone(currentDuty.phone)}
                    >
                      联系
                    </Button>
                  </View>
                ) : (
                  <Text style={{ color: '#86909c', fontSize: '28rpx' }}>暂无值班信息</Text>
                )}
              </View>

              <Text className={styles.sectionTitle}>
                <Text className={styles.titleLeft}>排班日历</Text>
              </Text>

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
                    const isToday = day === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
                    const dayDuties = getDutyForDate(day);
                    const hasDuty = dayDuties.length > 0;
                    const dayShift = dayDuties.find(d => d.shift === '白班');

                    return (
                      <View
                        key={index}
                        className={classnames(styles.dayCell, {
                          [styles.today]: isToday,
                          [styles.hasDuty]: hasDuty
                        })}
                      >
                        <Text className={styles.dayNum}>{day}</Text>
                        {dayShift && (
                          <Text className={styles.dutyName}>{dayShift.name.charAt(0)}</Text>
                        )}
                        {hasDuty && <View className={styles.dutyDot} />}
                      </View>
                    );
                  })}
                </View>
              </View>

              <Text className={styles.sectionTitle}>
                <Text className={styles.titleLeft}>本周排班</Text>
                <Text className={styles.more}>查看全部</Text>
              </Text>

              <View className={styles.dutyList}>
                {dutyRecords.slice(0, 7).map((record, index, arr) => {
                  const sameDateItems = arr.filter(r => r.date === record.date);
                  if (sameDateItems[0].id !== record.id) return null;

                  const dayShift = sameDateItems.find(r => r.shift === '白班');
                  const nightShift = sameDateItems.find(r => r.shift === '夜班');
                  const date = new Date(record.date);
                  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

                  return (
                    <View key={record.date} className={styles.dutyItem}>
                      <View className={styles.dateInfo}>
                        <Text className={styles.date}>{date.getDate()}</Text>
                        <Text className={styles.weekday}>{weekdays[date.getDay()]}</Text>
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

          {activeTab === 'handover' && (
            <>
              <Text className={styles.sectionTitle}>
                <Text className={styles.titleLeft}>交接待办</Text>
                <Text className={styles.more}>{pendingCount} 项待办</Text>
              </Text>

              <View className={styles.handoverSection}>
                {handoverList.length > 0 ? (
                  handoverList.map(item => (
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
                      <View className={styles.cardFooter}>
                        <Text className={styles.fromInfo}>交接人：{item.from}</Text>
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
    </View>
  );
};

export default DutyPage;
