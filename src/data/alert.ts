import type { AlertItem, AlertLevel } from '@/types';

export const alertList: AlertItem[] = [
  {
    id: 'alert001',
    title: 'CPU使用率超过90%',
    level: 'P0',
    status: 'pending',
    hostName: 'order-db-01',
    serviceName: '订单服务',
    idc: '华东机房',
    biz: '订单业务',
    content: '主机 order-db-01 CPU使用率连续5分钟超过90%，当前值92.5%，可能影响数据库性能',
    createTime: '2024-01-15 14:32:00'
  },
  {
    id: 'alert002',
    title: '服务响应时间过长',
    level: 'P1',
    status: 'confirmed',
    hostName: 'pay-api-03',
    serviceName: '支付服务',
    idc: '华南机房',
    biz: '支付业务',
    content: '支付服务近10分钟平均响应时间超过800ms，阈值500ms',
    createTime: '2024-01-15 14:15:00',
    confirmTime: '2024-01-15 14:20:00',
    handler: 'zhangsan',
    handlerName: '张三'
  },
  {
    id: 'alert003',
    title: '磁盘空间不足',
    level: 'P2',
    status: 'processing',
    hostName: 'log-server-05',
    serviceName: '日志服务',
    idc: '华北机房',
    biz: '基础架构',
    content: '日志服务器 /data 分区使用率达到85%，剩余空间不足100GB',
    createTime: '2024-01-15 13:45:00',
    confirmTime: '2024-01-15 13:50:00',
    handler: 'lisi',
    handlerName: '李四'
  },
  {
    id: 'alert004',
    title: '内存使用率过高',
    level: 'P1',
    status: 'pending',
    hostName: 'user-cache-02',
    serviceName: '用户服务',
    idc: '华东机房',
    biz: '用户业务',
    content: 'Redis缓存服务器内存使用率达到95%，存在OOM风险',
    createTime: '2024-01-15 13:20:00'
  },
  {
    id: 'alert005',
    title: '数据库连接数接近上限',
    level: 'P2',
    status: 'resolved',
    hostName: 'goods-db-01',
    serviceName: '商品服务',
    idc: '西南机房',
    biz: '商品业务',
    content: '商品数据库连接数达到上限的90%，当前连接数900/1000',
    createTime: '2024-01-15 12:30:00',
    confirmTime: '2024-01-15 12:35:00',
    resolveTime: '2024-01-15 13:10:00',
    handler: 'wangwu',
    handlerName: '王五'
  },
  {
    id: 'alert006',
    title: '接口错误率上升',
    level: 'P0',
    status: 'processing',
    hostName: 'marketing-api-01',
    serviceName: '营销服务',
    idc: '华东机房',
    biz: '营销业务',
    content: '营销活动接口近5分钟错误率达到15%，影响用户参与活动',
    createTime: '2024-01-15 11:45:00',
    confirmTime: '2024-01-15 11:50:00',
    handler: 'zhaoliu',
    handlerName: '赵六'
  },
  {
    id: 'alert007',
    title: '网络丢包严重',
    level: 'P3',
    status: 'pending',
    hostName: 'gateway-04',
    serviceName: '网关服务',
    idc: '华南机房',
    biz: '基础架构',
    content: '网关服务器网络丢包率达到5%，可能影响服务可用性',
    createTime: '2024-01-15 11:30:00'
  },
  {
    id: 'alert008',
    title: '证书即将过期',
    level: 'P4',
    status: 'pending',
    hostName: 'ssl-cert-01',
    serviceName: '安全服务',
    idc: '华东机房',
    biz: '基础架构',
    content: 'API网关SSL证书将于7天后过期，请及时更新',
    createTime: '2024-01-15 10:00:00'
  },
  {
    id: 'alert009',
    title: '定时任务执行失败',
    level: 'P2',
    status: 'confirmed',
    hostName: 'scheduler-02',
    serviceName: '调度服务',
    idc: '华北机房',
    biz: '基础架构',
    content: '每日数据统计任务执行失败，已重试3次均失败',
    createTime: '2024-01-15 09:30:00',
    confirmTime: '2024-01-15 09:45:00',
    handler: 'sunqi',
    handlerName: '孙七'
  },
  {
    id: 'alert010',
    title: 'MQ消息堆积',
    level: 'P1',
    status: 'pending',
    hostName: 'mq-broker-03',
    serviceName: '消息服务',
    idc: '华东机房',
    biz: '基础架构',
    content: '订单消息队列堆积量超过10万条，消费速度跟不上生产速度',
    createTime: '2024-01-15 09:15:00'
  }
];

export const alertLevelOptions: { value: AlertLevel | 'all'; label: string }[] = [
  { value: 'all', label: '全部级别' },
  { value: 'P0', label: 'P0 紧急' },
  { value: 'P1', label: 'P1 严重' },
  { value: 'P2', label: 'P2 警告' },
  { value: 'P3', label: 'P3 提示' },
  { value: 'P4', label: 'P4 通知' }
];

export const alertStatusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待处理' },
  { value: 'confirmed', label: '已确认' },
  { value: 'processing', label: '处理中' },
  { value: 'resolved', label: '已解决' },
  { value: 'closed', label: '已关闭' }
];
