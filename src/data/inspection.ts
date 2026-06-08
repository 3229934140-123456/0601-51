import type { InspectionItem, InspectionTask } from '@/types';

export const inspectionList: InspectionItem[] = [
  {
    id: 'ins001',
    title: '华东机房日常巡检',
    idc: '华东机房',
    status: 'processing',
    total: 15,
    finished: 8,
    startTime: '2024-01-15 09:00:00',
    inspector: '张三'
  },
  {
    id: 'ins002',
    title: '华南机房周度巡检',
    idc: '华南机房',
    status: 'pending',
    total: 20,
    finished: 0,
    startTime: '2024-01-15 14:00:00'
  },
  {
    id: 'ins003',
    title: '华北机房月度深度巡检',
    idc: '华北机房',
    status: 'completed',
    total: 25,
    finished: 25,
    startTime: '2024-01-14 09:00:00',
    endTime: '2024-01-14 16:30:00',
    inspector: '李四'
  },
  {
    id: 'ins004',
    title: '西南机房日常巡检',
    idc: '西南机房',
    status: 'pending',
    total: 12,
    finished: 0,
    startTime: '2024-01-15 15:00:00'
  },
  {
    id: 'ins005',
    title: '核心数据库专项巡检',
    idc: '华东机房',
    status: 'completed',
    total: 8,
    finished: 8,
    startTime: '2024-01-13 10:00:00',
    endTime: '2024-01-13 12:00:00',
    inspector: '王五'
  }
];

export const inspectionTasks: InspectionTask[] = [
  { id: 't001', title: '机房环境检查', content: '检查机房温度、湿度是否正常，空调运行状态', required: true, status: 'pass' },
  { id: 't002', title: '服务器硬件状态', content: '检查服务器电源、风扇、硬盘指示灯状态', required: true, status: 'pass' },
  { id: 't003', title: '网络设备巡检', content: '检查交换机、路由器运行状态，端口流量', required: true, status: 'pending' },
  { id: 't004', title: '数据库健康检查', content: '检查数据库连接数、慢查询、主从同步状态', required: true, status: 'pending' },
  { id: 't005', title: '中间件服务检查', content: '检查Redis、MQ、Nginx等中间件运行状态', required: true, status: 'fail', remark: 'Redis内存使用率偏高，需要关注' },
  { id: 't006', title: '应用服务监控', content: '检查各业务应用服务健康状态、响应时间', required: true, status: 'pending' },
  { id: 't007', title: '磁盘空间检查', content: '检查各服务器磁盘使用率，清理过期日志', required: false, status: 'pending' },
  { id: 't008', title: '备份验证', content: '验证数据库备份文件完整性和可恢复性', required: true, status: 'pending' },
  { id: 't009', title: '安全漏洞扫描', content: '执行安全漏洞扫描，检查是否有新增高危漏洞', required: false, status: 'pending' },
  { id: 't010', title: '消防设施检查', content: '检查消防设备是否完好有效', required: true, status: 'pending' },
  { id: 't011', title: 'UPS电源检查', content: '检查UPS电池状态和负载情况', required: true, status: 'pending' },
  { id: 't012', title: '机柜走线整理', content: '检查机柜台线是否整齐，标签是否清晰', required: false, status: 'pending' },
  { id: 't013', title: '监控系统检查', content: '检查监控系统运行状态，告警通道是否正常', required: true, status: 'pending' },
  { id: 't014', title: '日志审计', content: '抽查安全日志、操作日志是否有异常', required: false, status: 'pending' },
  { id: 't015', title: '现场照片记录', content: '拍摄机房整体照片，记录当前状态', required: true, status: 'pending' }
];
