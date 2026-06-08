import type { AlertItem, AlertLevel, AlertStatus } from '@/types';

const now = new Date();
const pad = (n: number) => String(n).padStart(2, '0');
const fmt = (h: number, m: number = 0, s: number = 0) =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(h)}:${pad(m)}:${pad(s)}`;

const fmtDateOffset = (dayOffset: number, h: number, m: number = 0, s: number = 0) => {
  const date = new Date(now);
  date.setDate(date.getDate() + dayOffset);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(h)}:${pad(m)}:${pad(s)}`;
};

const getDateStr = (dayOffset: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() + dayOffset);
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const alertList: AlertItem[] = [
  {
    id: 'alert001',
    title: 'CPU使用率超过90%',
    level: 'P0',
    status: 'pending',
    hostName: 'order-db-01',
    serviceName: '订单服务',
    idc: '华东机房',
    idcKey: 'hd',
    biz: '订单业务',
    bizKey: 'order',
    content: '主机 order-db-01 CPU使用率连续5分钟超过90%，当前值92.5%，可能影响数据库性能',
    createTime: fmt(14, 32),
    processRecords: [
      { id: 'pr001', action: '创建告警', operator: 'system', operatorName: '系统', time: fmt(14, 32), toStatus: 'pending' }
    ]
  },
  {
    id: 'alert002',
    title: '服务响应时间过长',
    level: 'P1',
    status: 'investigating',
    hostName: 'pay-api-03',
    serviceName: '支付服务',
    idc: '华南机房',
    idcKey: 'hn',
    biz: '支付业务',
    bizKey: 'pay',
    content: '支付服务近10分钟平均响应时间超过800ms，阈值500ms',
    createTime: fmt(14, 15),
    confirmTime: fmt(14, 20),
    handler: 'zhangsan',
    handlerName: '张三',
    processRecords: [
      { id: 'pr002', action: '创建告警', operator: 'system', operatorName: '系统', time: fmt(14, 15), toStatus: 'pending' },
      { id: 'pr003', action: '确认告警', operator: 'zhangsan', operatorName: '张三', time: fmt(14, 20), content: '已收到告警，正在排查原因，初步判断是流量高峰导致', fromStatus: 'pending', toStatus: 'investigating' }
    ]
  },
  {
    id: 'alert003',
    title: '磁盘空间不足',
    level: 'P2',
    status: 'waiting_external',
    hostName: 'log-server-05',
    serviceName: '日志服务',
    idc: '华北机房',
    idcKey: 'hb',
    biz: '基础架构',
    bizKey: 'infra',
    content: '日志服务器 /data 分区使用率达到85%，剩余空间不足100GB',
    createTime: fmt(13, 45),
    confirmTime: fmt(13, 50),
    handler: 'wangwu',
    handlerName: '王五',
    transferCount: 1,
    processRecords: [
      { id: 'pr004', action: '创建告警', operator: 'system', operatorName: '系统', time: fmt(13, 45), toStatus: 'pending' },
      { id: 'pr005', action: '确认告警', operator: 'lisi', operatorName: '李四', time: fmt(13, 50), content: '已确认，正在清理历史日志', fromStatus: 'pending', toStatus: 'investigating' },
      { id: 'pr006', action: '转派告警', operator: 'lisi', operatorName: '李四', time: fmt(13, 55), transferTo: 'wangwu', transferToName: '王五', content: '需要存储团队协助扩容，转派给王五', fromStatus: 'investigating', toStatus: 'investigating' },
      { id: 'pr007', action: '等待外部支持', operator: 'wangwu', operatorName: '王五', time: fmt(14, 5), content: '已提交扩容申请，等待云厂商审批，预计明天上午完成', fromStatus: 'investigating', toStatus: 'waiting_external' }
    ]
  },
  {
    id: 'alert004',
    title: '内存使用率过高',
    level: 'P1',
    status: 'pending',
    hostName: 'user-cache-02',
    serviceName: '用户服务',
    idc: '华东机房',
    idcKey: 'hd',
    biz: '用户业务',
    bizKey: 'user',
    content: 'Redis缓存服务器内存使用率达到95%，存在OOM风险',
    createTime: fmt(13, 20),
    processRecords: [
      { id: 'pr008', action: '创建告警', operator: 'system', operatorName: '系统', time: fmt(13, 20), toStatus: 'pending' }
    ]
  },
  {
    id: 'alert005',
    title: '数据库连接数接近上限',
    level: 'P2',
    status: 'resolved',
    hostName: 'goods-db-01',
    serviceName: '商品服务',
    idc: '西南机房',
    idcKey: 'xn',
    biz: '商品业务',
    bizKey: 'goods',
    content: '商品数据库连接数达到上限的90%，当前连接数900/1000',
    createTime: fmt(12, 30),
    confirmTime: fmt(12, 35),
    resolveTime: fmt(13, 10),
    handler: 'wangwu',
    handlerName: '王五',
    processRecords: [
      { id: 'pr009', action: '创建告警', operator: 'system', operatorName: '系统', time: fmt(12, 30), toStatus: 'pending' },
      { id: 'pr010', action: '确认告警', operator: 'wangwu', operatorName: '王五', time: fmt(12, 35), content: '收到，正在处理', fromStatus: 'pending', toStatus: 'investigating' },
      { id: 'pr011', action: '临时恢复', operator: 'wangwu', operatorName: '王五', time: fmt(12, 50), content: '重启部分应用实例，连接数暂时下降', fromStatus: 'investigating', toStatus: 'temp_restored' },
      { id: 'pr012', action: '彻底解决', operator: 'wangwu', operatorName: '王五', time: fmt(13, 10), content: '已优化连接池配置，增加最大连接数，连接数回落至正常水平', fromStatus: 'temp_restored', toStatus: 'resolved' }
    ]
  },
  {
    id: 'alert006',
    title: '接口错误率上升',
    level: 'P0',
    status: 'investigating',
    hostName: 'marketing-api-01',
    serviceName: '营销服务',
    idc: '华东机房',
    idcKey: 'hd',
    biz: '营销业务',
    bizKey: 'marketing',
    content: '营销活动接口近5分钟错误率达到15%，影响用户参与活动',
    createTime: fmt(11, 45),
    confirmTime: fmt(11, 50),
    handler: 'zhaoliu',
    handlerName: '赵六',
    processRecords: [
      { id: 'pr013', action: '创建告警', operator: 'system', operatorName: '系统', time: fmt(11, 45), toStatus: 'pending' },
      { id: 'pr014', action: '确认告警', operator: 'zhaoliu', operatorName: '赵六', time: fmt(11, 50), content: '紧急处理中，正在定位错误原因', fromStatus: 'pending', toStatus: 'investigating' }
    ]
  },
  {
    id: 'alert007',
    title: '网络丢包严重',
    level: 'P3',
    status: 'pending',
    hostName: 'gateway-04',
    serviceName: '网关服务',
    idc: '华南机房',
    idcKey: 'hn',
    biz: '基础架构',
    bizKey: 'infra',
    content: '网关服务器网络丢包率达到5%，可能影响服务可用性',
    createTime: fmt(11, 30),
    processRecords: [
      { id: 'pr015', action: '创建告警', operator: 'system', operatorName: '系统', time: fmt(11, 30), toStatus: 'pending' }
    ]
  },
  {
    id: 'alert008',
    title: '证书即将过期',
    level: 'P4',
    status: 'pending',
    hostName: 'ssl-cert-01',
    serviceName: '安全服务',
    idc: '华东机房',
    idcKey: 'hd',
    biz: '基础架构',
    bizKey: 'infra',
    content: 'API网关SSL证书将于7天后过期，请及时更新',
    createTime: fmt(10, 0),
    processRecords: [
      { id: 'pr016', action: '创建告警', operator: 'system', operatorName: '系统', time: fmt(10, 0), toStatus: 'pending' }
    ]
  },
  {
    id: 'alert009',
    title: '定时任务执行失败',
    level: 'P2',
    status: 'investigating',
    hostName: 'scheduler-02',
    serviceName: '调度服务',
    idc: '华北机房',
    idcKey: 'hb',
    biz: '基础架构',
    bizKey: 'infra',
    content: '每日数据统计任务执行失败，已重试3次均失败',
    createTime: fmt(9, 30),
    confirmTime: fmt(9, 45),
    handler: 'sunqi',
    handlerName: '孙七',
    processRecords: [
      { id: 'pr017', action: '创建告警', operator: 'system', operatorName: '系统', time: fmt(9, 30), toStatus: 'pending' },
      { id: 'pr018', action: '确认告警', operator: 'sunqi', operatorName: '孙七', time: fmt(9, 45), content: '已确认，正在排查任务失败原因，怀疑是数据源连接问题', fromStatus: 'pending', toStatus: 'investigating' }
    ]
  },
  {
    id: 'alert010',
    title: 'MQ消息堆积',
    level: 'P1',
    status: 'pending',
    hostName: 'mq-broker-03',
    serviceName: '消息服务',
    idc: '华东机房',
    idcKey: 'hd',
    biz: '基础架构',
    bizKey: 'infra',
    content: '订单消息队列堆积量超过10万条，消费速度跟不上生产速度',
    createTime: fmt(9, 15),
    processRecords: [
      { id: 'pr019', action: '创建告警', operator: 'system', operatorName: '系统', time: fmt(9, 15), toStatus: 'pending' }
    ]
  },
  {
    id: 'alert-h1',
    title: '数据库连接池耗尽',
    level: 'P0',
    status: 'resolved',
    hostName: 'user-db-02',
    serviceName: '用户服务',
    idc: '华东机房',
    idcKey: 'hd',
    biz: '用户业务',
    bizKey: 'user',
    content: '用户数据库连接池使用率100%，新请求无法获取连接',
    createTime: fmtDateOffset(-1, 10, 20),
    confirmTime: fmtDateOffset(-1, 10, 25),
    resolveTime: fmtDateOffset(-1, 11, 10),
    handler: 'zhangsan',
    handlerName: '张三',
    transferCount: 1,
    processRecords: [
      { id: 'pr-h1-1', action: '创建告警', operator: 'system', operatorName: '系统', time: fmtDateOffset(-1, 10, 20), toStatus: 'pending' },
      { id: 'pr-h1-2', action: '确认告警', operator: 'zhangsan', operatorName: '张三', time: fmtDateOffset(-1, 10, 25), fromStatus: 'pending', toStatus: 'investigating', content: '正在排查，可能是慢查询导致' },
      { id: 'pr-h1-3', action: '转派告警', operator: 'zhangsan', operatorName: '张三', time: fmtDateOffset(-1, 10, 35), content: '转DBA团队处理，需要优化SQL', transferTo: 'lisi', transferToName: '李四', fromStatus: 'investigating', toStatus: 'investigating' },
      { id: 'pr-h1-4', action: '开始排查', operator: 'lisi', operatorName: '李四', time: fmtDateOffset(-1, 10, 40), fromStatus: 'investigating', toStatus: 'investigating', content: 'DBA接手，正在分析慢查询日志' },
      { id: 'pr-h1-5', action: '彻底解决', operator: 'lisi', operatorName: '李四', time: fmtDateOffset(-1, 11, 10), fromStatus: 'investigating', toStatus: 'resolved', content: '已添加索引并优化SQL，连接池恢复正常' }
    ]
  },
  {
    id: 'alert-h2',
    title: '服务响应时间过长',
    level: 'P1',
    status: 'resolved',
    hostName: 'order-api-01',
    serviceName: '订单服务',
    idc: '华南机房',
    idcKey: 'hn',
    biz: '订单业务',
    bizKey: 'order',
    content: '订单服务平均响应时间超过1秒，阈值500ms',
    createTime: fmtDateOffset(-1, 14, 30),
    confirmTime: fmtDateOffset(-1, 14, 35),
    resolveTime: fmtDateOffset(-1, 15, 20),
    handler: 'wangwu',
    handlerName: '王五',
    transferCount: 0,
    processRecords: [
      { id: 'pr-h2-1', action: '创建告警', operator: 'system', operatorName: '系统', time: fmtDateOffset(-1, 14, 30), toStatus: 'pending' },
      { id: 'pr-h2-2', action: '确认告警', operator: 'wangwu', operatorName: '王五', time: fmtDateOffset(-1, 14, 35), fromStatus: 'pending', toStatus: 'investigating', content: '流量突增导致，正在扩容' },
      { id: 'pr-h2-3', action: '临时恢复', operator: 'wangwu', operatorName: '王五', time: fmtDateOffset(-1, 14, 50), fromStatus: 'investigating', toStatus: 'temp_restored', content: '临时扩容3个实例，响应时间下降' },
      { id: 'pr-h2-4', action: '彻底解决', operator: 'wangwu', operatorName: '王五', time: fmtDateOffset(-1, 15, 20), fromStatus: 'temp_restored', toStatus: 'resolved', content: '流量回落，已缩容，系统稳定' }
    ]
  },
  {
    id: 'alert-h3',
    title: '磁盘空间不足',
    level: 'P2',
    status: 'waiting_external',
    hostName: 'backup-server-01',
    serviceName: '备份服务',
    idc: '华北机房',
    idcKey: 'hb',
    biz: '基础架构',
    bizKey: 'infra',
    content: '备份服务器 /backup 分区使用率达到90%',
    createTime: fmtDateOffset(-2, 9, 0),
    confirmTime: fmtDateOffset(-2, 9, 10),
    handler: 'zhangsan',
    handlerName: '张三',
    transferCount: 1,
    processRecords: [
      { id: 'pr-h3-1', action: '创建告警', operator: 'system', operatorName: '系统', time: fmtDateOffset(-2, 9, 0), toStatus: 'pending' },
      { id: 'pr-h3-2', action: '确认告警', operator: 'zhangsan', operatorName: '张三', time: fmtDateOffset(-2, 9, 10), fromStatus: 'pending', toStatus: 'investigating', content: '需要清理旧备份文件' },
      { id: 'pr-h3-3', action: '等待外部支持', operator: 'zhangsan', operatorName: '张三', time: fmtDateOffset(-2, 10, 0), fromStatus: 'investigating', toStatus: 'waiting_external', content: '等待存储团队确认哪些备份可以删除' }
    ]
  },
  {
    id: 'alert-h4',
    title: '内存使用率过高',
    level: 'P2',
    status: 'resolved',
    hostName: 'cache-node-03',
    serviceName: '缓存服务',
    idc: '华东机房',
    idcKey: 'hd',
    biz: '基础架构',
    bizKey: 'infra',
    content: '缓存节点内存使用率达到85%',
    createTime: fmtDateOffset(-2, 16, 40),
    confirmTime: fmtDateOffset(-2, 16, 45),
    resolveTime: fmtDateOffset(-2, 17, 30),
    handler: 'lisi',
    handlerName: '李四',
    transferCount: 0,
    processRecords: [
      { id: 'pr-h4-1', action: '创建告警', operator: 'system', operatorName: '系统', time: fmtDateOffset(-2, 16, 40), toStatus: 'pending' },
      { id: 'pr-h4-2', action: '确认告警', operator: 'lisi', operatorName: '李四', time: fmtDateOffset(-2, 16, 45), fromStatus: 'pending', toStatus: 'investigating', content: '检查内存使用情况' },
      { id: 'pr-h4-3', action: '彻底解决', operator: 'lisi', operatorName: '李四', time: fmtDateOffset(-2, 17, 30), fromStatus: 'investigating', toStatus: 'resolved', content: '清理过期缓存，内存使用率降至60%' }
    ]
  },
  {
    id: 'alert-h5',
    title: 'CPU使用率超过80%',
    level: 'P3',
    status: 'resolved',
    hostName: 'web-server-05',
    serviceName: '前端服务',
    idc: '华南机房',
    idcKey: 'hn',
    biz: '用户业务',
    bizKey: 'user',
    content: 'Web服务器CPU使用率连续10分钟超过80%',
    createTime: fmtDateOffset(-3, 11, 20),
    confirmTime: fmtDateOffset(-3, 11, 25),
    resolveTime: fmtDateOffset(-3, 12, 0),
    handler: 'wangwu',
    handlerName: '王五',
    transferCount: 0,
    processRecords: [
      { id: 'pr-h5-1', action: '创建告警', operator: 'system', operatorName: '系统', time: fmtDateOffset(-3, 11, 20), toStatus: 'pending' },
      { id: 'pr-h5-2', action: '确认告警', operator: 'wangwu', operatorName: '王五', time: fmtDateOffset(-3, 11, 25), fromStatus: 'pending', toStatus: 'investigating', content: '活动页面流量高导致' },
      { id: 'pr-h5-3', action: '彻底解决', operator: 'wangwu', operatorName: '王五', time: fmtDateOffset(-3, 12, 0), fromStatus: 'investigating', toStatus: 'resolved', content: '增加CDN缓存，CPU下降到40%' }
    ]
  },
  {
    id: 'alert-h6',
    title: '接口响应超时',
    level: 'P1',
    status: 'resolved',
    hostName: 'pay-api-02',
    serviceName: '支付服务',
    idc: '华东机房',
    idcKey: 'hd',
    biz: '支付业务',
    bizKey: 'pay',
    content: '支付回调接口超时率超过5%',
    createTime: fmtDateOffset(-3, 19, 10),
    confirmTime: fmtDateOffset(-3, 19, 15),
    resolveTime: fmtDateOffset(-3, 20, 30),
    handler: 'zhangsan',
    handlerName: '张三',
    transferCount: 1,
    processRecords: [
      { id: 'pr-h6-1', action: '创建告警', operator: 'system', operatorName: '系统', time: fmtDateOffset(-3, 19, 10), toStatus: 'pending' },
      { id: 'pr-h6-2', action: '确认告警', operator: 'zhangsan', operatorName: '张三', time: fmtDateOffset(-3, 19, 15), fromStatus: 'pending', toStatus: 'investigating', content: '检查支付网关连接' },
      { id: 'pr-h6-3', action: '转派告警', operator: 'zhangsan', operatorName: '张三', time: fmtDateOffset(-3, 19, 30), content: '第三方支付渠道问题，转商务团队协调', transferTo: 'zhaoliu', transferToName: '赵六', fromStatus: 'investigating', toStatus: 'investigating' },
      { id: 'pr-h6-4', action: '等待外部支持', operator: 'zhaoliu', operatorName: '赵六', time: fmtDateOffset(-3, 19, 35), fromStatus: 'investigating', toStatus: 'waiting_external', content: '正在联系支付渠道技术支持' },
      { id: 'pr-h6-5', action: '彻底解决', operator: 'zhaoliu', operatorName: '赵六', time: fmtDateOffset(-3, 20, 30), fromStatus: 'waiting_external', toStatus: 'resolved', content: '支付渠道已恢复，超时率降至0.1%' }
    ]
  },
  {
    id: 'alert-h7',
    title: '证书即将过期',
    level: 'P3',
    status: 'resolved',
    hostName: 'api-gateway-01',
    serviceName: '网关服务',
    idc: '华北机房',
    idcKey: 'hb',
    biz: '基础架构',
    bizKey: 'infra',
    content: 'API网关SSL证书还有7天过期',
    createTime: fmtDateOffset(-4, 10, 0),
    confirmTime: fmtDateOffset(-4, 10, 30),
    resolveTime: fmtDateOffset(-4, 14, 0),
    handler: 'lisi',
    handlerName: '李四',
    transferCount: 0,
    processRecords: [
      { id: 'pr-h7-1', action: '创建告警', operator: 'system', operatorName: '系统', time: fmtDateOffset(-4, 10, 0), toStatus: 'pending' },
      { id: 'pr-h7-2', action: '确认告警', operator: 'lisi', operatorName: '李四', time: fmtDateOffset(-4, 10, 30), fromStatus: 'pending', toStatus: 'investigating', content: '准备申请新证书' },
      { id: 'pr-h7-3', action: '彻底解决', operator: 'lisi', operatorName: '李四', time: fmtDateOffset(-4, 14, 0), fromStatus: 'investigating', toStatus: 'resolved', content: '已更新证书，有效期延长1年' }
    ]
  },
  {
    id: 'alert-h8',
    title: '磁盘IO过高',
    level: 'P2',
    status: 'resolved',
    hostName: 'db-slave-03',
    serviceName: '数据库服务',
    idc: '华东机房',
    idcKey: 'hd',
    biz: '订单业务',
    bizKey: 'order',
    content: '数据库从库磁盘IO使用率持续超过90%',
    createTime: fmtDateOffset(-5, 8, 30),
    confirmTime: fmtDateOffset(-5, 8, 40),
    resolveTime: fmtDateOffset(-5, 10, 15),
    handler: 'lisi',
    handlerName: '李四',
    transferCount: 0,
    processRecords: [
      { id: 'pr-h8-1', action: '创建告警', operator: 'system', operatorName: '系统', time: fmtDateOffset(-5, 8, 30), toStatus: 'pending' },
      { id: 'pr-h8-2', action: '确认告警', operator: 'lisi', operatorName: '李四', time: fmtDateOffset(-5, 8, 40), fromStatus: 'pending', toStatus: 'investigating', content: '报表查询占用大量IO' },
      { id: 'pr-h8-3', action: '临时恢复', operator: 'lisi', operatorName: '李四', time: fmtDateOffset(-5, 9, 10), fromStatus: 'investigating', toStatus: 'temp_restored', content: '停掉了几个大查询，IO下降' },
      { id: 'pr-h8-4', action: '彻底解决', operator: 'lisi', operatorName: '李四', time: fmtDateOffset(-5, 10, 15), fromStatus: 'temp_restored', toStatus: 'resolved', content: '优化了报表查询SQL，并增加只读实例' }
    ]
  },
  {
    id: 'alert-h9',
    title: '服务不可用',
    level: 'P0',
    status: 'resolved',
    hostName: 'auth-service-02',
    serviceName: '认证服务',
    idc: '华南机房',
    idcKey: 'hn',
    biz: '用户业务',
    bizKey: 'user',
    content: '认证服务健康检查失败，服务不可用',
    createTime: fmtDateOffset(-5, 15, 20),
    confirmTime: fmtDateOffset(-5, 15, 22),
    resolveTime: fmtDateOffset(-5, 15, 35),
    handler: 'wangwu',
    handlerName: '王五',
    transferCount: 0,
    processRecords: [
      { id: 'pr-h9-1', action: '创建告警', operator: 'system', operatorName: '系统', time: fmtDateOffset(-5, 15, 20), toStatus: 'pending' },
      { id: 'pr-h9-2', action: '确认告警', operator: 'wangwu', operatorName: '王五', time: fmtDateOffset(-5, 15, 22), fromStatus: 'pending', toStatus: 'investigating', content: '服务进程挂了，正在重启' },
      { id: 'pr-h9-3', action: '彻底解决', operator: 'wangwu', operatorName: '王五', time: fmtDateOffset(-5, 15, 35), fromStatus: 'investigating', toStatus: 'resolved', content: '服务已重启，恢复正常，OOM导致，已调整内存配置' }
    ]
  },
  {
    id: 'alert-h10',
    title: '日志采集异常',
    level: 'P3',
    status: 'resolved',
    hostName: 'log-collector-01',
    serviceName: '日志服务',
    idc: '华北机房',
    idcKey: 'hb',
    biz: '基础架构',
    bizKey: 'infra',
    content: '日志采集器延迟超过30分钟',
    createTime: fmtDateOffset(-6, 13, 0),
    confirmTime: fmtDateOffset(-6, 13, 20),
    resolveTime: fmtDateOffset(-6, 14, 10),
    handler: 'zhangsan',
    handlerName: '张三',
    transferCount: 0,
    processRecords: [
      { id: 'pr-h10-1', action: '创建告警', operator: 'system', operatorName: '系统', time: fmtDateOffset(-6, 13, 0), toStatus: 'pending' },
      { id: 'pr-h10-2', action: '确认告警', operator: 'zhangsan', operatorName: '张三', time: fmtDateOffset(-6, 13, 20), fromStatus: 'pending', toStatus: 'investigating', content: '采集队列堵塞' },
      { id: 'pr-h10-3', action: '彻底解决', operator: 'zhangsan', operatorName: '张三', time: fmtDateOffset(-6, 14, 10), fromStatus: 'investigating', toStatus: 'resolved', content: '扩容采集节点，延迟恢复正常' }
    ]
  },
  {
    id: 'alert-h11',
    title: '网络延迟增高',
    level: 'P2',
    status: 'investigating',
    hostName: 'switch-core-01',
    serviceName: '网络设备',
    idc: '华东机房',
    idcKey: 'hd',
    biz: '基础架构',
    bizKey: 'infra',
    content: '核心交换机到存储网络延迟超过100ms',
    createTime: fmtDateOffset(-6, 20, 0),
    confirmTime: fmtDateOffset(-6, 20, 10),
    handler: 'lisi',
    handlerName: '李四',
    transferCount: 0,
    processRecords: [
      { id: 'pr-h11-1', action: '创建告警', operator: 'system', operatorName: '系统', time: fmtDateOffset(-6, 20, 0), toStatus: 'pending' },
      { id: 'pr-h11-2', action: '确认告警', operator: 'lisi', operatorName: '李四', time: fmtDateOffset(-6, 20, 10), fromStatus: 'pending', toStatus: 'investigating', content: '正在排查网络设备' }
    ]
  },
  {
    id: 'alert-h12',
    title: '定时任务执行失败',
    level: 'P4',
    status: 'resolved',
    hostName: 'scheduler-01',
    serviceName: '调度服务',
    idc: '华南机房',
    idcKey: 'hn',
    biz: '基础架构',
    bizKey: 'infra',
    content: '每日数据对账任务执行失败',
    createTime: fmtDateOffset(-7, 2, 30),
    confirmTime: fmtDateOffset(-7, 9, 0),
    resolveTime: fmtDateOffset(-7, 10, 20),
    handler: 'wangwu',
    handlerName: '王五',
    transferCount: 0,
    processRecords: [
      { id: 'pr-h12-1', action: '创建告警', operator: 'system', operatorName: '系统', time: fmtDateOffset(-7, 2, 30), toStatus: 'pending' },
      { id: 'pr-h12-2', action: '确认告警', operator: 'wangwu', operatorName: '王五', time: fmtDateOffset(-7, 9, 0), fromStatus: 'pending', toStatus: 'investigating', content: '上班后处理，数据量不大' },
      { id: 'pr-h12-3', action: '彻底解决', operator: 'wangwu', operatorName: '王五', time: fmtDateOffset(-7, 10, 20), fromStatus: 'investigating', toStatus: 'resolved', content: '源数据格式变更，已调整解析逻辑，任务重跑成功' }
    ]
  }
];

export const alertLevelOptions: { value: AlertLevel | 'all'; label: string }[] = [
  { value: 'all', label: '全部级别' },
  { value: 'P0', label: 'P0 紧急' },
  { value: 'P1', label: 'P1 严重' },
  { value: 'P2', label: 'P2 警告' },
  { value: 'P3', label: 'P3 提示' },
  { value: 'P4', label: 'P4 通知' }
];

export const alertStatusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待处理' },
  { value: 'investigating', label: '排查中' },
  { value: 'waiting_external', label: '等待外部支持' },
  { value: 'temp_restored', label: '临时恢复' },
  { value: 'resolved', label: '已解决' },
  { value: 'closed', label: '已关闭' }
];

export const statusLabelMap: Record<AlertStatus, string> = {
  pending: '待处理',
  investigating: '排查中',
  waiting_external: '等待外部支持',
  temp_restored: '临时恢复',
  resolved: '已解决',
  closed: '已关闭'
};
