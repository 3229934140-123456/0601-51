import type { HostItem, MetricPoint } from '@/types';

export const hostList: HostItem[] = [
  { id: 'h001', name: 'order-db-01', ip: '10.0.1.101', idc: '华东机房', idcKey: 'hd', biz: '订单业务', bizKey: 'order', status: 'warning', cpu: 92, memory: 78, disk: 65, load: 8.5 },
  { id: 'h002', name: 'order-db-02', ip: '10.0.1.102', idc: '华东机房', idcKey: 'hd', biz: '订单业务', bizKey: 'order', status: 'online', cpu: 45, memory: 62, disk: 58, load: 3.2 },
  { id: 'h003', name: 'pay-api-01', ip: '10.0.2.101', idc: '华南机房', idcKey: 'hn', biz: '支付业务', bizKey: 'pay', status: 'online', cpu: 56, memory: 68, disk: 42, load: 4.1 },
  { id: 'h004', name: 'pay-api-02', ip: '10.0.2.102', idc: '华南机房', idcKey: 'hn', biz: '支付业务', bizKey: 'pay', status: 'online', cpu: 48, memory: 55, disk: 42, load: 3.5 },
  { id: 'h005', name: 'pay-api-03', ip: '10.0.2.103', idc: '华南机房', idcKey: 'hn', biz: '支付业务', bizKey: 'pay', status: 'error', cpu: 0, memory: 0, disk: 0, load: 0 },
  { id: 'h006', name: 'user-cache-01', ip: '10.0.1.201', idc: '华东机房', idcKey: 'hd', biz: '用户业务', bizKey: 'user', status: 'online', cpu: 35, memory: 82, disk: 30, load: 2.1 },
  { id: 'h007', name: 'user-cache-02', ip: '10.0.1.202', idc: '华东机房', idcKey: 'hd', biz: '用户业务', bizKey: 'user', status: 'warning', cpu: 42, memory: 95, disk: 30, load: 2.8 },
  { id: 'h008', name: 'goods-web-01', ip: '10.0.3.101', idc: '西南机房', idcKey: 'xn', biz: '商品业务', bizKey: 'goods', status: 'online', cpu: 38, memory: 52, disk: 45, load: 2.5 },
  { id: 'h009', name: 'goods-web-02', ip: '10.0.3.102', idc: '西南机房', idcKey: 'xn', biz: '商品业务', bizKey: 'goods', status: 'online', cpu: 41, memory: 48, disk: 45, load: 2.7 },
  { id: 'h010', name: 'goods-db-01', ip: '10.0.3.151', idc: '西南机房', idcKey: 'xn', biz: '商品业务', bizKey: 'goods', status: 'online', cpu: 55, memory: 70, disk: 72, load: 4.8 },
  { id: 'h011', name: 'log-server-01', ip: '10.0.4.101', idc: '华北机房', idcKey: 'hb', biz: '基础架构', bizKey: 'infra', status: 'online', cpu: 28, memory: 65, disk: 82, load: 1.5 },
  { id: 'h012', name: 'log-server-05', ip: '10.0.4.105', idc: '华北机房', idcKey: 'hb', biz: '基础架构', bizKey: 'infra', status: 'warning', cpu: 32, memory: 58, disk: 85, load: 1.8 },
  { id: 'h013', name: 'gateway-01', ip: '10.0.2.51', idc: '华南机房', idcKey: 'hn', biz: '基础架构', bizKey: 'infra', status: 'online', cpu: 45, memory: 60, disk: 25, load: 3.0 },
  { id: 'h014', name: 'gateway-04', ip: '10.0.2.54', idc: '华南机房', idcKey: 'hn', biz: '基础架构', bizKey: 'infra', status: 'warning', cpu: 50, memory: 55, disk: 25, load: 3.5 },
  { id: 'h015', name: 'mq-broker-01', ip: '10.0.1.51', idc: '华东机房', idcKey: 'hd', biz: '基础架构', bizKey: 'infra', status: 'online', cpu: 40, memory: 75, disk: 60, load: 2.2 },
  { id: 'h016', name: 'mq-broker-03', ip: '10.0.1.53', idc: '华东机房', idcKey: 'hd', biz: '基础架构', bizKey: 'infra', status: 'warning', cpu: 62, memory: 80, disk: 65, load: 5.5 }
];

export function generateMetricData(baseValue: number, variance: number, points: number = 24): MetricPoint[] {
  const result: MetricPoint[] = [];
  const now = Date.now();
  for (let i = points - 1; i >= 0; i--) {
    const time = new Date(now - i * 3600000);
    const hour = time.getHours().toString().padStart(2, '0');
    const value = Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * variance * 2));
    result.push({
      time: `${hour}:00`,
      value: Math.round(value * 10) / 10
    });
  }
  return result;
}
