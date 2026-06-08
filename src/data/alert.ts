import type { AlertItem, AlertLevel } from '@/types';

const now = new Date();
const pad = (n: number) => String(n).padStart(2, '0');
const fmt = (h: number, m: number = 0, s: number = 0) =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(h)}:${pad(m)}:${pad(s)}`;

export const alertList: AlertItem[] = [
  {
    id: 'alert001',
    title: 'CPU使用率超过90%',
    level: 'P0',
    status: 'pending',
    hostName: 'order-db-01',
    serviceName: '订单服务',
    idc: '华东机房',
    idcKey: 'hd',
    biz: '订单业务',
    bizKey: 'order',
    content: '主机 order-db-01 CPU使用率连续5分钟超过90%，当前值92.5%，可能影响数据库性能',
    createTime: fmt(14, 32),
    processRecords: []
  },
  {
    id: 'alert002',
    title: '服务响应时间过长',
    level: 'P1',
    status: 'confirmed',
    hostName: 'pay-api-03',
    serviceName: '支付服务',
    idc: '华南机房',
    idcKey: 'hn',
    biz: '支付业务',
    bizKey: 'pay',
    content: '支付服务近10分钟平均响应时间超过800ms，阈值500ms',
    createTime: fmt(14, 15),
    confirmTime: fmt(14, 20),
    handler: 'zhangsan',
    handlerName: '张三',
    processRecords: [
      {
        id: 'pr001',
        action: '创建告警',
        operator: 'system',
        operatorName: '系统',
        time: fmt(14, 15)
      },
      {
        id: 'pr002',
        action: '确认告警',
        operator: 'zhangsan',
        operatorName: '张三',
        time: fmt(14, 20),
        content: '已收到告警，正在排查原因，初步判断是流量高峰导致'
      }
    ]
  },
  {
    id: 'alert003',
    title: '磁盘空间不足',
    level: 'P2',
    status: 'processing',
    hostName: 'log-server-05',
    serviceName: '日志服务',
    idc: '华北机房',
    idcKey: 'hb',
    biz: '基础架构',
    bizKey: 'infra',
    content: '日志服务器 /data 分区使用率达到85%，剩余空间不足100GB',
    createTime: fmt(13, 45),
    confirmTime: fmt(13, 50),
    handler: 'lisi',
    handlerName: '李四',
    processRecords: [
      {
        id: 'pr003',
        action: '创建告警',
        operator: 'system',
        operatorName: '系统',
        time: fmt(13, 45)
      },
      {
        id: 'pr004',
        action: '确认告警',
        operator: 'lisi',
        operatorName: '李四',
        time: fmt(13, 50),
        content: '已确认，正在清理历史日志'
      },
      {
        id: 'pr005',
        action: '转派告警',
        operator: 'lisi',
        operatorName: '李四',
        time: fmt(13, 55),
        transferTo: 'wangwu',
        transferToName: '王五',
        content: '需要存储团队协助扩容，转派给王五'
      },
      {
        id: 'pr006',
        action: '处理中',
        operator: 'wangwu',
        operatorName: '王五',
        time: fmt(14, 5),
        content: '已提交扩容申请，预计明天上午完成'
      }
    ]
  },
  {
    id: 'alert004',
    title: '内存使用率过高',
    level: 'P1',
    status: 'pending',
    hostName: 'user-cache-02',
    serviceName: '用户服务',
    idc: '华东机房',
    idcKey: 'hd',
    biz: '用户业务',
    bizKey: 'user',
    content: 'Redis缓存服务器内存使用率达到95%，存在OOM风险',
    createTime: fmt(13, 20),
    processRecords: [
      { id: 'pr007', action: '创建告警', operator: 'system', operatorName: '系统', time: fmt(13, 20) }
    ]
  },
  {
    id: 'alert005',
    title: '数据库连接数接近上限',
    level: 'P2',
    status: 'resolved',
    hostName: 'goods-db-01',
    serviceName: '商品服务',
    idc: '西南机房',
    idcKey: 'xn',
    biz: '商品业务',
    bizKey: 'goods',
    content: '商品数据库连接数达到上限的90%，当前连接数900/1000',
    createTime: fmt(12, 30),
    confirmTime: fmt(12, 35),
    resolveTime: fmt(13, 10),
    handler: 'wangwu',
    handlerName: '王五',
    processRecords: [
      { id: 'pr008', action: '创建告警', operator: 'system', operatorName: '系统', time: fmt(12, 30) },
      { id: 'pr009', action: '确认告警', operator: 'wangwu', operatorName: '王五', time: fmt(12, 35), content: '收到，正在处理' },
      { id: 'pr010', action: '处理完成', operator: 'wangwu', operatorName: '王五', time: fmt(13, 10), content: '已优化连接池配置，连接数回落至正常水平' }
    ]
  },
  {
    id: 'alert006',
    title: '接口错误率上升',
    level: 'P0',
    status: 'processing',
    hostName: 'marketing-api-01',
    serviceName: '营销服务',
    idc: '华东机房',
    idcKey: 'hd',
    biz: '营销业务',
    bizKey: 'marketing',
    content: '营销活动接口近5分钟错误率达到15%，影响用户参与活动',
    createTime: fmt(11, 45),
    confirmTime: fmt(11, 50),
    handler: 'zhaoliu',
    handlerName: '赵六',
    processRecords: [
      { id: 'pr011', action: '创建告警', operator: 'system', operatorName: '系统', time: fmt(11, 45) },
      { id: 'pr012', action: '确认告警', operator: 'zhaoliu', operatorName: '赵六', time: fmt(11, 50), content: '紧急处理中' }
    ]
  },
  {
    id: 'alert007',
    title: '网络丢包严重',
    level: 'P3',
    status: 'pending',
    hostName: 'gateway-04',
    serviceName: '网关服务',
    idc: '华南机房',
    idcKey: 'hn',
    biz: '基础架构',
    bizKey: 'infra',
    content: '网关服务器网络丢包率达到5%，可能影响服务可用性',
    createTime: fmt(11, 30),
    processRecords: [
      { id: 'pr013', action: '创建告警', operator: 'system', operatorName: '系统', time: fmt(11, 30) }
    ]
  },
  {
    id: 'alert008',
    title: '证书即将过期',
    level: 'P4',
    status: 'pending',
    hostName: 'ssl-cert-01',
    serviceName: '安全服务',
    idc: '华东机房',
    idcKey: 'hd',
    biz: '基础架构',
    bizKey: 'infra',
    content: 'API网关SSL证书将于7天后过期，请及时更新',
    createTime: fmt(10, 0),
    processRecords: [
      { id: 'pr014', action: '创建告警', operator: 'system', operatorName: '系统', time: fmt(10, 0) }
    ]
  },
  {
    id: 'alert009',
    title: '定时任务执行失败',
    level: 'P2',
    status: 'confirmed',
    hostName: 'scheduler-02',
    serviceName: '调度服务',
    idc: '华北机房',
    idcKey: 'hb',
    biz: '基础架构',
    bizKey: 'infra',
    content: '每日数据统计任务执行失败，已重试3次均失败',
    createTime: fmt(9, 30),
    confirmTime: fmt(9, 45),
    handler: 'sunqi',
    handlerName: '孙七',
    processRecords: [
      { id: 'pr015', action: '创建告警', operator: 'system', operatorName: '系统', time: fmt(9, 30) },
      { id: 'pr016', action: '确认告警', operator: 'sunqi', operatorName: '孙七', time: fmt(9, 45), content: '已确认，正在排查任务失败原因' }
    ]
  },
  {
    id: 'alert010',
    title: 'MQ消息堆积',
    level: 'P1',
    status: 'pending',
    hostName: 'mq-broker-03',
    serviceName: '消息服务',
    idc: '华东机房',
    idcKey: 'hd',
    biz: '基础架构',
    bizKey: 'infra',
    content: '订单消息队列堆积量超过10万条，消费速度跟不上生产速度',
    createTime: fmt(9, 15),
    processRecords: [
      { id: 'pr017', action: '创建告警', operator: 'system', operatorName: '系统', time: fmt(9, 15) }
    ]
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
