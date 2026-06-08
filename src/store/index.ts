import { create } from 'zustand';
import type {
  AlertItem,
  ImportantEvent,
  InspectionItem,
  HandoverItem,
  HostItem,
  ServiceItem,
  ServiceStatus,
  ProcessRecord,
  BoundDevice,
  ProgressAction
} from '@/types';
import { alertList as initialAlerts } from '@/data/alert';
import { hostList } from '@/data/host';
import { serviceList } from '@/data/service';
import { inspectionList as initialInspections, inspectionTaskTemplates } from '@/data/inspection';
import { handoverList as initialHandovers } from '@/data/duty';
import { importantEvents as initialEvents } from '@/data/overview';

interface AppState {
  alerts: AlertItem[];
  importantEvents: ImportantEvent[];
  inspections: InspectionItem[];
  handovers: HandoverItem[];
  hosts: HostItem[];
  services: ServiceItem[];

  confirmAlert: (alertId: string, content: string) => void;
  transferAlert: (alertId: string, transferToId: string, transferToName: string, content?: string) => void;
  resolveAlert: (alertId: string, content: string) => void;
  addProcessRecord: (alertId: string, record: ProcessRecord) => void;
  updateAlertStatus: (alertId: string, status: AlertItem['status'], action: string, content?: string) => void;

  createInspection: (inspection: InspectionItem) => void;
  updateInspectionTask: (inspectionId: string, taskId: string, updates: Partial<InspectionItem['tasks'][0]>) => void;
  bindDevice: (inspectionId: string, device: BoundDevice) => void;
  addInspectionPhoto: (inspectionId: string, photoUrl: string) => void;
  completeInspection: (inspectionId: string) => void;

  addHandover: (item: HandoverItem) => void;
  completeHandover: (itemId: string) => void;

  updateServiceStatus: (serviceId: string, status: ServiceStatus) => void;

  getAlertStats: () => { total: number; pending: number; today: number; processing: number; resolved: number };
  getHostStats: () => { total: number; online: number; offline: number; warning: number };
  getServiceStats: () => { total: number; normal: number; abnormal: number };
  getHealthScore: () => number;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

const formatTime = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const isToday = (dateStr: string) => {
  const today = new Date();
  const date = new Date(dateStr);
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

export const useAppStore = create<AppState>((set, get) => ({
  alerts: initialAlerts as AlertItem[],
  importantEvents: initialEvents,
  inspections: initialInspections as InspectionItem[],
  handovers: initialHandovers,
  hosts: hostList as unknown as HostItem[],
  services: serviceList as unknown as ServiceItem[],

  confirmAlert: (alertId, content) => {
    const now = formatTime(new Date());
    const record: ProcessRecord = {
      id: generateId(),
      action: '确认告警',
      operator: 'currentUser',
      operatorName: '我',
      time: now,
      content,
      fromStatus: 'pending',
      toStatus: 'investigating'
    };

    set(state => {
      const alert = state.alerts.find(a => a.id === alertId);
      const newAlerts = state.alerts.map(a =>
        a.id === alertId
          ? { ...a, status: 'investigating' as const, confirmTime: now, handler: 'currentUser', handlerName: '我', processRecords: [...a.processRecords, record] }
          : a
      );
      const newEvents = alert
        ? state.importantEvents.map(e =>
            e.alertId === alertId || (e.title === alert.title && e.time === alert.createTime)
              ? { ...e, level: 'P1' as const, isTop: false }
              : e
          )
        : state.importantEvents;
      return { alerts: newAlerts, importantEvents: newEvents };
    });
    console.log('[Store] 确认告警:', alertId);
  },

  updateAlertStatus: (alertId, status, action, content) => {
    const now = formatTime(new Date());
    
    set(state => {
      const alert = state.alerts.find(a => a.id === alertId);
      if (!alert) return state;
      
      const record: ProcessRecord = {
        id: generateId(),
        action: action as ProgressAction | string,
        operator: 'currentUser',
        operatorName: '我',
        time: now,
        content,
        fromStatus: alert.status,
        toStatus: status
      };

      let updates: Partial<AlertItem> = {
        status,
        processRecords: [...alert.processRecords, record]
      };

      if (status === 'resolved' || status === 'closed') {
        updates.resolveTime = now;
      }

      const newAlerts = state.alerts.map(a =>
        a.id === alertId ? { ...a, ...updates } : a
      );

      let newEvents = state.importantEvents;
      if (status === 'resolved' || status === 'closed') {
        newEvents = state.importantEvents.filter(e =>
          !(e.alertId === alertId || (e.title === alert.title && e.time === alert.createTime))
        );
      }

      return { alerts: newAlerts, importantEvents: newEvents };
    });
    console.log('[Store] 更新告警状态:', alertId, '→', status);
  },

  transferAlert: (alertId, transferToId, transferToName, content = '') => {
    const now = formatTime(new Date());
    
    set(state => {
      const alert = state.alerts.find(a => a.id === alertId);
      if (!alert) return state;
      
      const record: ProcessRecord = {
        id: generateId(),
        action: '转派告警',
        operator: 'currentUser',
        operatorName: '我',
        time: now,
        transferTo: transferToId,
        transferToName,
        content,
        fromStatus: alert.status,
        toStatus: alert.status
      };

      return {
        alerts: state.alerts.map(a =>
          a.id === alertId
            ? { 
                ...a, 
                handler: transferToId, 
                handlerName: transferToName, 
                transferCount: (a.transferCount || 0) + 1,
                processRecords: [...a.processRecords, record] 
              }
            : a
        )
      };
    });
    console.log('[Store] 转派告警:', alertId, '给', transferToName, `(${transferToId})`);
  },

  resolveAlert: (alertId, content) => {
    const now = formatTime(new Date());
    
    set(state => {
      const alert = state.alerts.find(a => a.id === alertId);
      if (!alert) return state;
      
      const record: ProcessRecord = {
        id: generateId(),
        action: '彻底解决',
        operator: 'currentUser',
        operatorName: '我',
        time: now,
        content,
        fromStatus: alert.status,
        toStatus: 'resolved'
      };

      const newAlerts = state.alerts.map(a =>
        a.id === alertId
          ? { ...a, status: 'resolved' as const, resolveTime: now, processRecords: [...a.processRecords, record] }
          : a
      );
      const newEvents = alert
        ? state.importantEvents.filter(e =>
            !(e.alertId === alertId || (e.title === alert.title && e.time === alert.createTime))
          )
        : state.importantEvents;
      return { alerts: newAlerts, importantEvents: newEvents };
    });
    console.log('[Store] 解决告警:', alertId);
  },

  addProcessRecord: (alertId, record) => {
    set(state => ({
      alerts: state.alerts.map(a =>
        a.id === alertId
          ? { ...a, processRecords: [...a.processRecords, record] }
          : a
      )
    }));
  },

  createInspection: (inspection) => {
    set(state => ({
      inspections: [inspection, ...state.inspections]
    }));
    console.log('[Store] 创建巡检:', inspection.id);
  },

  updateInspectionTask: (inspectionId, taskId, updates) => {
    set(state => {
      const inspections = state.inspections.map(ins => {
        if (ins.id !== inspectionId) return ins;
        const tasks = ins.tasks.map(t =>
          t.id === taskId ? { ...t, ...updates } : t
        );
        const finished = tasks.filter(t => t.status !== 'pending').length;
        return { ...ins, tasks, finished, status: finished > 0 ? 'processing' as const : ins.status };
      });
      return { inspections };
    });
  },

  bindDevice: (inspectionId, device) => {
    set(state => ({
      inspections: state.inspections.map(ins =>
        ins.id === inspectionId
          ? { ...ins, boundDevices: [...ins.boundDevices, device] }
          : ins
      )
    }));
    console.log('[Store] 绑定设备:', device.deviceName, '到巡检', inspectionId);
  },

  addInspectionPhoto: (inspectionId, photoUrl) => {
    set(state => ({
      inspections: state.inspections.map(ins =>
        ins.id === inspectionId
          ? { ...ins, photos: [...ins.photos, photoUrl] }
          : ins
      )
    }));
    console.log('[Store] 添加巡检照片:', inspectionId);
  },

  completeInspection: (inspectionId) => {
    const now = formatTime(new Date());
    set(state => ({
      inspections: state.inspections.map(ins =>
        ins.id === inspectionId
          ? { ...ins, status: 'completed' as const, endTime: now }
          : ins
      )
    }));
    console.log('[Store] 完成巡检:', inspectionId);
  },

  addHandover: (item) => {
    set(state => ({
      handovers: [item, ...state.handovers]
    }));
    console.log('[Store] 新增交接事项:', item.id);
  },

  completeHandover: (itemId) => {
    const now = formatTime(new Date());
    set(state => ({
      handovers: state.handovers.map(h =>
        h.id === itemId
          ? { ...h, status: 'done' as const, completeTime: now }
          : h
      )
    }));
    console.log('[Store] 完成交接事项:', itemId);
  },

  updateServiceStatus: (serviceId, status) => {
    set(state => ({
      services: state.services.map(s =>
        s.id === serviceId ? { ...s, status } : s
      )
    }));
    console.log('[Store] 更新服务状态:', serviceId, status);
  },

  getAlertStats: () => {
    const alerts = get().alerts;
    return {
      total: alerts.length,
      pending: alerts.filter(a => a.status === 'pending').length,
      today: alerts.filter(a => isToday(a.createTime)).length,
      processing: alerts.filter(a => 
        a.status === 'investigating' || 
        a.status === 'waiting_external' || 
        a.status === 'temp_restored'
      ).length,
      resolved: alerts.filter(a => a.status === 'resolved' || a.status === 'closed').length
    };
  },

  getHostStats: () => {
    const hosts = get().hosts;
    return {
      total: hosts.length,
      online: hosts.filter(h => h.status === 'online').length,
      offline: hosts.filter(h => h.status === 'offline' || h.status === 'error').length,
      warning: hosts.filter(h => h.status === 'warning').length
    };
  },

  getServiceStats: () => {
    const services = get().services;
    return {
      total: services.length,
      normal: services.filter(s => s.status === 'normal').length,
      abnormal: services.filter(s => s.status !== 'normal' && s.status !== 'maintenance').length
    };
  },

  getHealthScore: () => {
    const alertStats = get().getAlertStats();
    const hostStats = get().getHostStats();
    const serviceStats = get().getServiceStats();

    const alertScore = Math.max(0, 100 - alertStats.pending * 5 - alertStats.today * 0.5);
    const hostScore = hostStats.total > 0 ? (hostStats.online / hostStats.total) * 100 : 100;
    const serviceScore = serviceStats.total > 0 ? (serviceStats.normal / serviceStats.total) * 100 : 100;

    const score = Math.round(alertScore * 0.4 + hostScore * 0.3 + serviceScore * 0.3);
    return Math.min(100, Math.max(0, score));
  }
}));
