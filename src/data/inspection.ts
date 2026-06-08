import type { InspectionItem, InspectionTask, BoundDevice, InspectionType } from '@/types';

const now = new Date();
const pad = (n: number) => String(n).padStart(2, '0');
const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmt = (date: Date, h: number, m: number = 0, s: number = 0) =>
  `${fmtDate(date)} ${pad(h)}:${pad(m)}:${pad(s)}`;

const today = new Date();
const yesterday = new Date(today.getTime() - 86400000);
const dayBefore = new Date(today.getTime() - 2 * 86400000);

export const inspectionTypes: InspectionType[] = [
  { key: 'daily', label: '日常巡检', defaultTasks: 12 },
  { key: 'weekly', label: '周度巡检', defaultTasks: 20 },
  { key: 'monthly', label: '月度深度巡检', defaultTasks: 25 },
  { key: 'special', label: '专项巡检', defaultTasks: 8 }
];

export const inspectionTaskTemplates: Record<string, InspectionTask[]> = {
  daily: [
    { id: 'd1', title: '机房环境检查', content: '检查机房温度、湿度是否正常，空调运行状态', required: true, status: 'pending' },
    { id: 'd2', title: '服务器硬件状态', content: '检查服务器电源、风扇、硬盘指示灯状态', required: true, status: 'pending' },
    { id: 'd3', title: '网络设备巡检', content: '检查交换机、路由器运行状态，端口流量', required: true, status: 'pending' },
    { id: 'd4', title: '数据库健康检查', content: '检查数据库连接数、慢查询、主从同步状态', required: true, status: 'pending' },
    { id: 'd5', title: '中间件服务检查', content: '检查Redis、MQ、Nginx等中间件运行状态', required: true, status: 'pending' },
    { id: 'd6', title: '应用服务监控', content: '检查各业务应用服务健康状态、响应时间', required: true, status: 'pending' },
    { id: 'd7', title: '磁盘空间检查', content: '检查各服务器磁盘使用率，清理过期日志', required: false, status: 'pending' },
    { id: 'd8', title: '监控系统检查', content: '检查监控系统运行状态，告警通道是否正常', required: true, status: 'pending' },
    { id: 'd9', title: '消防设施检查', content: '检查消防设备是否完好有效', required: true, status: 'pending' },
    { id: 'd10', title: 'UPS电源检查', content: '检查UPS电池状态和负载情况', required: true, status: 'pending' },
    { id: 'd11', title: '安全门禁检查', content: '检查机房门禁系统运行状态', required: false, status: 'pending' },
    { id: 'd12', title: '现场照片记录', content: '拍摄机房整体照片，记录当前状态', required: true, status: 'pending' }
  ],
  weekly: [
    { id: 'w1', title: '机房环境检查', content: '检查机房温度、湿度是否正常，空调运行状态', required: true, status: 'pending' },
    { id: 'w2', title: '服务器硬件状态', content: '检查服务器电源、风扇、硬盘指示灯状态', required: true, status: 'pending' },
    { id: 'w3', title: '网络设备巡检', content: '检查交换机、路由器运行状态，端口流量', required: true, status: 'pending' },
    { id: 'w4', title: '数据库健康检查', content: '检查数据库连接数、慢查询、主从同步状态', required: true, status: 'pending' },
    { id: 'w5', title: '中间件服务检查', content: '检查Redis、MQ、Nginx等中间件运行状态', required: true, status: 'pending' },
    { id: 'w6', title: '应用服务监控', content: '检查各业务应用服务健康状态、响应时间', required: true, status: 'pending' },
    { id: 'w7', title: '磁盘空间检查', content: '检查各服务器磁盘使用率，清理过期日志', required: true, status: 'pending' },
    { id: 'w8', title: '备份验证', content: '验证数据库备份文件完整性和可恢复性', required: true, status: 'pending' },
    { id: 'w9', title: '监控系统检查', content: '检查监控系统运行状态，告警通道是否正常', required: true, status: 'pending' },
    { id: 'w10', title: '日志审计', content: '抽查安全日志、操作日志是否有异常', required: false, status: 'pending' },
    { id: 'w11', title: '消防设施检查', content: '检查消防设备是否完好有效', required: true, status: 'pending' },
    { id: 'w12', title: 'UPS电源检查', content: '检查UPS电池状态和负载情况', required: true, status: 'pending' },
    { id: 'w13', title: '机柜走线整理', content: '检查机柜台线是否整齐，标签是否清晰', required: false, status: 'pending' },
    { id: 'w14', title: '安全漏洞扫描', content: '执行安全漏洞扫描，检查是否有新增高危漏洞', required: false, status: 'pending' },
    { id: 'w15', title: '负载均衡检查', content: '检查负载均衡器配置和运行状态', required: true, status: 'pending' },
    { id: 'w16', title: '域名证书检查', content: '检查SSL证书有效期，及时更新', required: true, status: 'pending' },
    { id: 'w17', title: '存储系统检查', content: '检查存储阵列运行状态和容量', required: true, status: 'pending' },
    { id: 'w18', title: '安全门禁检查', content: '检查机房门禁系统运行状态', required: false, status: 'pending' },
    { id: 'w19', title: '应急预案检查', content: '检查应急预案完整性和可行性', required: false, status: 'pending' },
    { id: 'w20', title: '现场照片记录', content: '拍摄机房整体照片，记录当前状态', required: true, status: 'pending' }
  ],
  monthly: [
    { id: 'm1', title: '机房环境全面检查', content: '检查机房温度、湿度、洁净度，空调运行状态', required: true, status: 'pending' },
    { id: 'm2', title: '服务器硬件深度检查', content: '检查服务器电源、风扇、硬盘、内存状态', required: true, status: 'pending' },
    { id: 'm3', title: '网络设备深度巡检', content: '检查交换机、路由器、防火墙运行状态和配置', required: true, status: 'pending' },
    { id: 'm4', title: '数据库深度健康检查', content: '检查数据库性能、索引、表空间、主从同步', required: true, status: 'pending' },
    { id: 'm5', title: '中间件服务深度检查', content: '检查各类中间件运行状态和性能指标', required: true, status: 'pending' },
    { id: 'm6', title: '应用服务全量检查', content: '检查所有业务应用服务健康状态', required: true, status: 'pending' },
    { id: 'm7', title: '磁盘空间全面检查', content: '检查所有服务器磁盘使用率，深度清理', required: true, status: 'pending' },
    { id: 'm8', title: '备份完整验证', content: '完整验证所有备份文件的可恢复性', required: true, status: 'pending' },
    { id: 'm9', title: '安全漏洞全量扫描', content: '执行全量安全漏洞扫描和修复验证', required: true, status: 'pending' },
    { id: 'm10', title: '消防设施全面检查', content: '全面检查消防设备、烟感、温感系统', required: true, status: 'pending' },
    { id: 'm11', title: 'UPS电源深度检查', content: '检查UPS电池状态、负载、放电记录', required: true, status: 'pending' },
    { id: 'm12', title: '监控系统全面检查', content: '检查所有监控项、告警规则、通知通道', required: true, status: 'pending' },
    { id: 'm13', title: '日志全面审计', content: '全面审计安全日志、操作日志、访问日志', required: true, status: 'pending' },
    { id: 'm14', title: '机柜走线规范检查', content: '全面检查机柜走线和标签规范', required: false, status: 'pending' },
    { id: 'm15', title: '负载均衡配置审计', content: '审计负载均衡配置和调度策略', required: true, status: 'pending' },
    { id: 'm16', title: '存储系统深度检查', content: '深度检查存储阵列运行状态和性能', required: true, status: 'pending' },
    { id: 'm17', title: '安全策略审计', content: '审计安全策略、防火墙规则、访问控制', required: true, status: 'pending' },
    { id: 'm18', title: '应急预案演练', content: '进行应急预案演练和评估', required: false, status: 'pending' },
    { id: 'm19', title: '容量规划评估', content: '评估资源使用情况，规划容量扩展', required: true, status: 'pending' },
    { id: 'm20', title: '域名与证书审计', content: '审计所有域名和SSL证书状态', required: true, status: 'pending' },
    { id: 'm21', title: '权限审计', content: '审计系统账号权限，清理无效账号', required: true, status: 'pending' },
    { id: 'm22', title: '配置管理检查', content: '检查配置管理和变更记录', required: true, status: 'pending' },
    { id: 'm23', title: '文档更新检查', content: '检查运维文档和知识库更新情况', required: false, status: 'pending' },
    { id: 'm24', title: '工具与脚本检查', content: '检查运维工具和脚本的完整性', required: false, status: 'pending' },
    { id: 'm25', title: '现场照片归档', content: '拍摄机房各区域照片并归档', required: true, status: 'pending' }
  ],
  special: [
    { id: 'sp1', title: '专项检查项1', content: '根据专项类型确定的检查项1', required: true, status: 'pending' },
    { id: 'sp2', title: '专项检查项2', content: '根据专项类型确定的检查项2', required: true, status: 'pending' },
    { id: 'sp3', title: '专项检查项3', content: '根据专项类型确定的检查项3', required: true, status: 'pending' },
    { id: 'sp4', title: '专项检查项4', content: '根据专项类型确定的检查项4', required: true, status: 'pending' },
    { id: 'sp5', title: '专项检查项5', content: '根据专项类型确定的检查项5', required: true, status: 'pending' },
    { id: 'sp6', title: '专项检查项6', content: '根据专项类型确定的检查项6', required: false, status: 'pending' },
    { id: 'sp7', title: '专项检查项7', content: '根据专项类型确定的检查项7', required: false, status: 'pending' },
    { id: 'sp8', title: '现场照片记录', content: '拍摄专项检查相关照片', required: true, status: 'pending' }
  ]
};

const sampleTasks1: InspectionTask[] = [
  { id: 't001', title: '机房环境检查', content: '检查机房温度、湿度是否正常，空调运行状态', required: true, status: 'pass' },
  { id: 't002', title: '服务器硬件状态', content: '检查服务器电源、风扇、硬盘指示灯状态', required: true, status: 'pass' },
  { id: 't003', title: '网络设备巡检', content: '检查交换机、路由器运行状态，端口流量', required: true, status: 'pass' },
  { id: 't004', title: '数据库健康检查', content: '检查数据库连接数、慢查询、主从同步状态', required: true, status: 'pass' },
  { id: 't005', title: '中间件服务检查', content: '检查Redis、MQ、Nginx等中间件运行状态', required: true, status: 'pass' },
  { id: 't006', title: '应用服务监控', content: '检查各业务应用服务健康状态、响应时间', required: true, status: 'pass' },
  { id: 't007', title: '磁盘空间检查', content: '检查各服务器磁盘使用率，清理过期日志', required: false, status: 'pass' },
  { id: 't008', title: '监控系统检查', content: '检查监控系统运行状态，告警通道是否正常', required: true, status: 'pending' },
  { id: 't009', title: '消防设施检查', content: '检查消防设备是否完好有效', required: true, status: 'pending' },
  { id: 't010', title: 'UPS电源检查', content: '检查UPS电池状态和负载情况', required: true, status: 'pending' },
  { id: 't011', title: '安全门禁检查', content: '检查机房门禁系统运行状态', required: false, status: 'pending' },
  { id: 't012', title: '现场照片记录', content: '拍摄机房整体照片，记录当前状态', required: true, status: 'fail', remark: '发现机柜3区走线不规范，需整改' }
];

const sampleDevices: BoundDevice[] = [
  {
    id: 'dev001',
    deviceId: 'DEV-SW-001',
    deviceName: '核心交换机-A',
    deviceType: 'network',
    bindTime: fmt(today, 9, 30),
    photoUrl: '',
    remark: '核心交换机运行正常'
  },
  {
    id: 'dev002',
    deviceId: 'DEV-SV-015',
    deviceName: '数据库服务器-015',
    deviceType: 'server',
    bindTime: fmt(today, 9, 45),
    photoUrl: '',
    remark: '服务器状态正常'
  }
];

export const inspectionList: InspectionItem[] = [
  {
    id: 'ins001',
    title: '华东机房日常巡检',
    idc: '华东机房',
    idcKey: 'hd',
    type: 'daily',
    typeLabel: '日常巡检',
    status: 'processing',
    total: 12,
    finished: 8,
    startTime: fmt(today, 9, 0),
    planTime: fmt(today, 9, 0),
    inspector: '张三',
    inspectorId: 'zhangsan',
    tasks: sampleTasks1,
    boundDevices: sampleDevices,
    photos: []
  },
  {
    id: 'ins002',
    title: '华南机房周度巡检',
    idc: '华南机房',
    idcKey: 'hn',
    type: 'weekly',
    typeLabel: '周度巡检',
    status: 'pending',
    total: 20,
    finished: 0,
    startTime: '',
    planTime: fmt(today, 14, 0),
    inspector: '李四',
    inspectorId: 'lisi',
    tasks: inspectionTaskTemplates.weekly.map(t => ({ ...t, id: `ins002-${t.id}` })),
    boundDevices: [],
    photos: []
  },
  {
    id: 'ins003',
    title: '华北机房月度深度巡检',
    idc: '华北机房',
    idcKey: 'hb',
    type: 'monthly',
    typeLabel: '月度深度巡检',
    status: 'completed',
    total: 25,
    finished: 25,
    startTime: fmt(yesterday, 9, 0),
    endTime: fmt(yesterday, 16, 30),
    planTime: fmt(yesterday, 9, 0),
    inspector: '王五',
    inspectorId: 'wangwu',
    tasks: inspectionTaskTemplates.monthly.map(t => ({ ...t, id: `ins003-${t.id}`, status: 'pass' as const })),
    boundDevices: [],
    photos: []
  },
  {
    id: 'ins004',
    title: '西南机房日常巡检',
    idc: '西南机房',
    idcKey: 'xn',
    type: 'daily',
    typeLabel: '日常巡检',
    status: 'pending',
    total: 12,
    finished: 0,
    startTime: '',
    planTime: fmt(today, 15, 0),
    inspector: '赵六',
    inspectorId: 'zhaoliu',
    tasks: inspectionTaskTemplates.daily.map(t => ({ ...t, id: `ins004-${t.id}` })),
    boundDevices: [],
    photos: []
  },
  {
    id: 'ins005',
    title: '核心数据库专项巡检',
    idc: '华东机房',
    idcKey: 'hd',
    type: 'special',
    typeLabel: '专项巡检',
    status: 'completed',
    total: 8,
    finished: 8,
    startTime: fmt(dayBefore, 10, 0),
    endTime: fmt(dayBefore, 12, 0),
    planTime: fmt(dayBefore, 10, 0),
    inspector: '孙七',
    inspectorId: 'sunqi',
    tasks: inspectionTaskTemplates.special.map(t => ({ ...t, id: `ins005-${t.id}`, status: 'pass' as const })),
    boundDevices: [],
    photos: []
  }
];

export const inspectorOptions = [
  { value: 'zhangsan', label: '张三' },
  { value: 'lisi', label: '李四' },
  { value: 'wangwu', label: '王五' },
  { value: 'zhaoliu', label: '赵六' },
  { value: 'sunqi', label: '孙七' },
  { value: 'zhouba', label: '周八' }
];
