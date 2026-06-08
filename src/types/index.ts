export type AlertLevel = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

export type AlertStatus = 'pending' | 'confirmed' | 'processing' | 'resolved' | 'closed';

export type HostStatus = 'online' | 'offline' | 'warning' | 'error';

export type ServiceStatus = 'normal' | 'warning' | 'error' | 'maintenance';

export type InspectionStatus = 'pending' | 'processing' | 'completed';

export interface AlertItem {
  id: string;
  title: string;
  level: AlertLevel;
  status: AlertStatus;
  hostName: string;
  serviceName: string;
  idc: string;
  biz: string;
  content: string;
  createTime: string;
  confirmTime?: string;
  resolveTime?: string;
  handler?: string;
  handlerName?: string;
}

export interface HostItem {
  id: string;
  name: string;
  ip: string;
  idc: string;
  biz: string;
  status: HostStatus;
  cpu: number;
  memory: number;
  disk: number;
  load: number;
}

export interface MetricPoint {
  time: string;
  value: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  status: ServiceStatus;
  biz: string;
  instances: number;
  healthyInstances: number;
  responseTime: number;
  qps: number;
}

export interface InspectionItem {
  id: string;
  title: string;
  idc: string;
  status: InspectionStatus;
  total: number;
  finished: number;
  startTime: string;
  endTime?: string;
  inspector?: string;
}

export interface InspectionTask {
  id: string;
  title: string;
  content: string;
  required: boolean;
  status: 'pending' | 'pass' | 'fail';
  remark?: string;
  photoUrl?: string;
}

export interface DutyRecord {
  id: string;
  date: string;
  shift: string;
  name: string;
  phone: string;
}

export interface HandoverItem {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'done';
  createTime: string;
  from: string;
}

export interface ImportantEvent {
  id: string;
  title: string;
  level: AlertLevel;
  content: string;
  time: string;
  isTop: boolean;
}

export interface OverviewData {
  healthScore: number;
  healthLevel: string;
  alertCount: {
    total: number;
    pending: number;
    today: number;
  };
  hostCount: {
    total: number;
    online: number;
    offline: number;
  };
  serviceCount: {
    total: number;
    normal: number;
    abnormal: number;
  };
  importantEvents: ImportantEvent[];
}

export interface IDCOption {
  value: string;
  label: string;
}

export interface BizOption {
  value: string;
  label: string;
}
