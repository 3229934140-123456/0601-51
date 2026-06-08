import type { ImportantEvent, IDCOption, BizOption } from '@/types';

const now = new Date();
const pad = (n: number) => String(n).padStart(2, '0');
const fmt = (h: number, m: number = 0, s: number = 0) =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(h)}:${pad(m)}:${pad(s)}`;

export const importantEvents: ImportantEvent[] = [
  {
    id: 'evt001',
    title: '订单服务CPU使用率告警',
    level: 'P0',
    content: '华东机房订单数据库CPU使用率连续5分钟超过90%，可能影响用户下单体验',
    time: fmt(14, 32),
    isTop: true,
    alertId: 'alert001'
  },
  {
    id: 'evt002',
    title: '营销服务接口错误率上升',
    level: 'P0',
    content: '华东机房营销活动接口近5分钟错误率达到15%，影响用户参与活动',
    time: fmt(11, 45),
    isTop: true,
    alertId: 'alert006'
  },
  {
    id: 'evt003',
    title: '支付服务响应时间过长',
    level: 'P1',
    content: '华南机房支付服务近10分钟平均响应时间超过800ms',
    time: fmt(14, 15),
    isTop: false,
    alertId: 'alert002'
  },
  {
    id: 'evt004',
    title: '日志服务器磁盘空间不足',
    level: 'P2',
    content: '华北机房日志服务器 /data 分区使用率达到85%，剩余空间不足100GB',
    time: fmt(13, 45),
    isTop: false,
    alertId: 'alert003'
  }
];

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
  { value: 'marketing', label: '营销业务' },
  { value: 'infra', label: '基础架构' }
];
