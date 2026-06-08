import type { OverviewData, ImportantEvent, IDCOption, BizOption } from '@/types';

export const overviewData: OverviewData = {
  healthScore: 85,
  healthLevel: '良好',
  alertCount: {
    total: 128,
    pending: 12,
    today: 36
  },
  hostCount: {
    total: 256,
    online: 248,
    offline: 8
  },
  serviceCount: {
    total: 64,
    normal: 58,
    abnormal: 6
  },
  importantEvents: [
    {
      id: 'evt001',
      title: '订单服务响应延迟告警',
      level: 'P1',
      content: '华东机房订单服务近5分钟平均响应时间超过500ms，影响用户下单体验',
      time: '2024-01-15 14:32:00',
      isTop: true
    },
    {
      id: 'evt002',
      title: '数据库主从同步中断',
      level: 'P0',
      content: '核心数据库主从同步中断超过30分钟，存在数据不一致风险',
      time: '2024-01-15 13:15:00',
      isTop: true
    },
    {
      id: 'evt003',
      title: '支付服务扩容完成',
      level: 'P3',
      content: '支付服务已完成自动扩容，实例数从8台增加至16台，当前负载正常',
      time: '2024-01-15 11:20:00',
      isTop: false
    },
    {
      id: 'evt004',
      title: '华南机房网络波动',
      level: 'P2',
      content: '华南机房出现网络波动，部分服务访问延迟增加，正在排查中',
      time: '2024-01-15 10:05:00',
      isTop: false
    }
  ]
};

export const idcOptions: IDCOption[] = [
  { value: 'all', label: '全部机房' },
  { value: 'hd', label: '华东机房' },
  { value: 'hn', label: '华南机房' },
  { value: 'hb', label: '华北机房' },
  { value: 'xn', label: '西南机房' }
];

export const bizOptions: BizOption[] = [
  { value: 'all', label: '全部业务' },
  { value: 'order', label: '订单业务' },
  { value: 'pay', label: '支付业务' },
  { value: 'user', label: '用户业务' },
  { value: 'goods', label: '商品业务' },
  { value: 'marketing', label: '营销业务' }
];
