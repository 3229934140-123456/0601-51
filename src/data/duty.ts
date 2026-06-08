import type { DutyRecord, HandoverItem } from '@/types';

const pad = (n: number) => String(n).padStart(2, '0');
const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmt = (date: Date, h: number, m: number = 0, s: number = 0) =>
  `${fmtDate(date)} ${pad(h)}:${pad(m)}:${pad(s)}`;

const today = new Date();
export const dutyPersons = [
  { name: '张三', phone: '138****1234', id: 'zhangsan' },
  { name: '李四', phone: '139****5678', id: 'lisi' },
  { name: '王五', phone: '137****9012', id: 'wangwu' },
  { name: '赵六', phone: '136****3456', id: 'zhaoliu' },
  { name: '孙七', phone: '135****7890', id: 'sunqi' },
  { name: '周八', phone: '134****1234', id: 'zhouba' },
  { name: '吴九', phone: '133****5678', id: 'wujiu' },
  { name: '郑十', phone: '132****9012', id: 'zhengshi' }
];

const BASE_DATE = new Date(2026, 0, 1);
const BASE_DAY_IDX = 0;

function getDayIndex(date: Date): number {
  const timeDiff = date.getTime() - BASE_DATE.getTime();
  const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  return (dayDiff + BASE_DAY_IDX + 1000) % dutyPersons.length;
}

function generateDutyList(days: number = 14): DutyRecord[] {
  const list: DutyRecord[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today.getTime() + (i - 1) * 86400000);
    const dateStr = fmtDate(d);
    const dayIdx = getDayIndex(d);
    const dayPerson = dutyPersons[dayIdx % 8];
    const nightPerson = dutyPersons[(dayIdx + 1) % 8];
    list.push({
      id: `d${dateStr}-day`,
      date: dateStr,
      shift: '白班',
      name: dayPerson.name,
      phone: dayPerson.phone,
      userId: dayPerson.id
    });
    list.push({
      id: `d${dateStr}-night`,
      date: dateStr,
      shift: '夜班',
      name: nightPerson.name,
      phone: nightPerson.phone,
      userId: nightPerson.id
    });
  }
  return list;
}

export function generateMonthDutyList(year: number, month: number): DutyRecord[] {
  const list: DutyRecord[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const dateStr = fmtDate(d);
    const dayIdx = getDayIndex(d);
    const dayPerson = dutyPersons[dayIdx % 8];
    const nightPerson = dutyPersons[(dayIdx + 1) % 8];
    list.push({
      id: `d${dateStr}-day`,
      date: dateStr,
      shift: '白班',
      name: dayPerson.name,
      phone: dayPerson.phone,
      userId: dayPerson.id
    });
    list.push({
      id: `d${dateStr}-night`,
      date: dateStr,
      shift: '夜班',
      name: nightPerson.name,
      phone: nightPerson.phone,
      userId: nightPerson.id
    });
  }
  return list;
}

export const dutyList: DutyRecord[] = generateDutyList(14);

export const handoverList: HandoverItem[] = [
  {
    id: 'h001',
    title: '订单数据库CPU告警处理中',
    content: 'order-db-01 主机CPU使用率持续偏高，已联系DBA进行优化，预计今晚完成',
    status: 'pending',
    createTime: fmt(today, 8, 30),
    from: '李四',
    fromId: 'lisi',
    to: '张三',
    toId: 'zhangsan'
  },
  {
    id: 'h002',
    title: '营销服务故障恢复',
    content: '营销服务接口错误率已恢复正常，根因是后端依赖服务超时，已增加熔断机制',
    status: 'done',
    createTime: fmt(today, 8, 0),
    completeTime: fmt(today, 10, 30),
    from: '李四',
    fromId: 'lisi',
    to: '张三',
    toId: 'zhangsan'
  },
  {
    id: 'h003',
    title: '日志服务器磁盘空间',
    content: 'log-server-05 磁盘空间紧张，已申请扩容，预计明天上午完成',
    status: 'pending',
    createTime: fmt(today, 7, 45),
    from: '李四',
    fromId: 'lisi',
    to: '张三',
    toId: 'zhangsan'
  },
  {
    id: 'h004',
    title: 'SSL证书更新提醒',
    content: 'API网关SSL证书7天后过期，证书申请流程已发起，请关注审批进度',
    status: 'pending',
    createTime: fmt(new Date(today.getTime() - 86400000), 20, 0),
    from: '王五',
    fromId: 'wangwu',
    to: '李四',
    toId: 'lisi'
  },
  {
    id: 'h005',
    title: '华南机房网络波动已恢复',
    content: '华南机房网络波动问题已定位为运营商线路故障，现已恢复正常',
    status: 'done',
    createTime: fmt(new Date(today.getTime() - 86400000), 16, 30),
    completeTime: fmt(new Date(today.getTime() - 86400000), 18, 0),
    from: '王五',
    fromId: 'wangwu',
    to: '李四',
    toId: 'lisi'
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
    { date: '06-15', count: 180 },
    { date: '06-16', count: 165 },
    { date: '06-17', count: 195 },
    { date: '06-18', count: 210 },
    { date: '06-19', count: 175 },
    { date: '06-20', count: 198 },
    { date: '06-21', count: 133 }
  ]
};
