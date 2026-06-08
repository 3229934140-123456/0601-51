import type { DutyRecord, HandoverItem } from '@/types';

export const dutyList: DutyRecord[] = [
  { id: 'd001', date: '2024-01-15', shift: '白班', name: '张三', phone: '138****1234' },
  { id: 'd002', date: '2024-01-15', shift: '夜班', name: '李四', phone: '139****5678' },
  { id: 'd003', date: '2024-01-16', shift: '白班', name: '王五', phone: '137****9012' },
  { id: 'd004', date: '2024-01-16', shift: '夜班', name: '赵六', phone: '136****3456' },
  { id: 'd005', date: '2024-01-17', shift: '白班', name: '孙七', phone: '135****7890' },
  { id: 'd006', date: '2024-01-17', shift: '夜班', name: '周八', phone: '134****1234' },
  { id: 'd007', date: '2024-01-18', shift: '白班', name: '吴九', phone: '133****5678' },
  { id: 'd008', date: '2024-01-18', shift: '夜班', name: '郑十', phone: '132****9012' },
  { id: 'd009', date: '2024-01-19', shift: '白班', name: '张三', phone: '138****1234' },
  { id: 'd010', date: '2024-01-19', shift: '夜班', name: '李四', phone: '139****5678' },
  { id: 'd011', date: '2024-01-20', shift: '白班', name: '王五', phone: '137****9012' },
  { id: 'd012', date: '2024-01-20', shift: '夜班', name: '赵六', phone: '136****3456' },
  { id: 'd013', date: '2024-01-21', shift: '白班', name: '孙七', phone: '135****7890' },
  { id: 'd014', date: '2024-01-21', shift: '夜班', name: '周八', phone: '134****1234' }
];

export const handoverList: HandoverItem[] = [
  {
    id: 'h001',
    title: '订单数据库CPU告警处理中',
    content: 'order-db-01 主机CPU使用率持续偏高，已联系DBA进行优化，预计今晚完成',
    status: 'pending',
    createTime: '2024-01-15 08:30:00',
    from: '李四'
  },
  {
    id: 'h002',
    title: '营销服务故障恢复',
    content: '营销服务接口错误率已恢复正常，根因是后端依赖服务超时，已增加熔断机制',
    status: 'done',
    createTime: '2024-01-15 08:00:00',
    from: '李四'
  },
  {
    id: 'h003',
    title: '日志服务器磁盘空间',
    content: 'log-server-05 磁盘空间紧张，已申请扩容，预计明天上午完成',
    status: 'pending',
    createTime: '2024-01-15 07:45:00',
    from: '李四'
  },
  {
    id: 'h004',
    title: 'SSL证书更新提醒',
    content: 'API网关SSL证书7天后过期，证书申请流程已发起，请关注审批进度',
    status: 'pending',
    createTime: '2024-01-14 20:00:00',
    from: '王五'
  },
  {
    id: 'h005',
    title: '华南机房网络波动已恢复',
    content: '华南机房网络波动问题已定位为运营商线路故障，现已恢复正常',
    status: 'done',
    createTime: '2024-01-14 16:30:00',
    from: '王五'
  }
];

export const reviewStats = {
  totalAlerts: 1256,
  p0Count: 12,
  p1Count: 38,
  p2Count: 156,
  p3Count: 420,
  p4Count: 630,
  avgResolveTime: '45分钟',
  autoResolveRate: '32%',
  topAlerts: [
    { name: 'CPU使用率告警', count: 328 },
    { name: '内存使用率告警', count: 256 },
    { name: '磁盘空间告警', count: 189 },
    { name: '接口响应超时', count: 156 },
    { name: '服务不可用', count: 87 }
  ],
  dailyTrend: [
    { date: '01-09', count: 180 },
    { date: '01-10', count: 165 },
    { date: '01-11', count: 195 },
    { date: '01-12', count: 210 },
    { date: '01-13', count: 175 },
    { date: '01-14', count: 198 },
    { date: '01-15', count: 133 }
  ]
};
