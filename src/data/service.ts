import type { ServiceItem } from '@/types';

export const serviceList: ServiceItem[] = [
  { id: 's001', name: '订单服务', status: 'warning', idc: '华东机房', idcKey: 'hd', biz: '订单业务', bizKey: 'order', instances: 12, healthyInstances: 10, responseTime: 450, qps: 2800 },
  { id: 's002', name: '支付服务', status: 'normal', idc: '华南机房', idcKey: 'hn', biz: '支付业务', bizKey: 'pay', instances: 16, healthyInstances: 16, responseTime: 120, qps: 3500 },
  { id: 's003', name: '用户服务', status: 'normal', idc: '华东机房', idcKey: 'hd', biz: '用户业务', bizKey: 'user', instances: 8, healthyInstances: 8, responseTime: 80, qps: 5000 },
  { id: 's004', name: '商品服务', status: 'normal', idc: '西南机房', idcKey: 'xn', biz: '商品业务', bizKey: 'goods', instances: 10, healthyInstances: 10, responseTime: 95, qps: 4200 },
  { id: 's005', name: '营销服务', status: 'error', idc: '华东机房', idcKey: 'hd', biz: '营销业务', bizKey: 'marketing', instances: 6, healthyInstances: 3, responseTime: 800, qps: 1500 },
  { id: 's006', name: '网关服务', status: 'normal', idc: '华南机房', idcKey: 'hn', biz: '基础架构', bizKey: 'infra', instances: 4, healthyInstances: 4, responseTime: 50, qps: 10000 },
  { id: 's007', name: '消息服务', status: 'warning', idc: '华东机房', idcKey: 'hd', biz: '基础架构', bizKey: 'infra', instances: 3, healthyInstances: 3, responseTime: 25, qps: 8000 },
  { id: 's008', name: '日志服务', status: 'maintenance', idc: '华北机房', idcKey: 'hb', biz: '基础架构', bizKey: 'infra', instances: 2, healthyInstances: 1, responseTime: 200, qps: 500 },
  { id: 's009', name: '搜索服务', status: 'normal', idc: '西南机房', idcKey: 'xn', biz: '商品业务', bizKey: 'goods', instances: 4, healthyInstances: 4, responseTime: 150, qps: 2000 },
  { id: 's010', name: '推荐服务', status: 'normal', idc: '西南机房', idcKey: 'xn', biz: '商品业务', bizKey: 'goods', instances: 6, healthyInstances: 6, responseTime: 180, qps: 1200 }
];
