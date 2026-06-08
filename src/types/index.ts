export type AlertLevel = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

export type AlertStatus = 'pending' | 'confirmed' | 'processing' | 'resolved' | 'closed';

export type HostStatus = 'online' | 'offline' | 'warning' | 'error';

export type ServiceStatus = 'normal' | 'warning' | 'error' | 'maintenance';

export type InspectionStatus = 'pending' | 'processing' | 'completed';

export type InspectionType = 'daily' | 'weekly' | 'monthly' | 'special';

export interface ProcessRecord {
  id: string;
  action: string;
  operator: string;
  operatorName: string;
  time: string;
  content?: string;
  transferTo?: string;
  transferToName?: string;
}

export interface BoundDevice {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  bindTime: string;
  photoUrl?: string;
  remark?: string;
}

export interface AlertItem {
  id: string;
  title: string;
  level: AlertLevel;
  status: AlertStatus;
  hostName: string;
  serviceName: string;
  idc: string;
  idcKey: string;
  biz: string;
  bizKey: string;
  content: string;
  createTime: string;
  confirmTime?: string;
  resolveTime?: string;
  handler?: string;
  handlerName?: string;
  processRecords: ProcessRecord[];
}

export interface HostItem {
  id: string;
  name: string;
  ip: string;
  idc: string;
  idcKey: string;
  biz: string;
  bizKey: string;
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
  idc: string;
  idcKey: string;
  biz: string;
  bizKey: string;
  instances: number;
  healthyInstances: number;
  responseTime: number;
  qps: number;
}

export interface InspectionItem {
  id: string;
  title: string;
  type: InspectionType;
  typeLabel: string;
  idc: string;
  idcKey: string;
  status: InspectionStatus;
  total: number;
  finished: number;
  startTime: string;
  planTime: string;
  planEndTime?: string;
  endTime?: string;
  inspector?: string;
  inspectorId?: string;
  inspectorName?: string;
  tasks: InspectionTask[];
  boundDevices: BoundDevice[];
  photos: string[];
}

export interface InspectionTask {
  id: string;
  title: string;
  content: string;
  required: boolean;
  status: 'pending' | 'pass' | 'fail';
  remark?: string;
  photoUrl?: string;
  finishTime?: string;
}

export interface DutyRecord {
  id: string;
  date: string;
  shift: '白班' | '夜班';
  name: string;
  phone: string;
  userId: string;
}

export interface HandoverItem {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'done';
  createTime: string;
  from: string;
  fromId: string;
  to?: string;
  toId?: string;
  completeTime?: string;
}

export interface ImportantEvent {
  id: string;
  title: string;
  level: AlertLevel;
  content: string;
  time: string;
  isTop: boolean;
  alertId?: string;
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

export interface InspectionTypeOption {
  value: InspectionType;
  label: string;
  defaultTaskCount: number;
}
