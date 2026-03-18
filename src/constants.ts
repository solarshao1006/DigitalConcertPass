export interface Concert {
  id: string;
  city: string;
  date: string;
  time: string;
  venue: string;
  tourName: string;
  season: number;
  type?: string;
}

export const CONCERTS: Concert[] = [
  // Grandline 5 (闹天宫)
  { id: 'bj-5-1', city: '北京', date: '2025-08-02', time: '19:30', venue: '华熙LIVE·五棵松', tourName: '闹天宫', season: 5 },
  { id: 'bj-5-2', city: '北京', date: '2025-08-03', time: '19:30', venue: '华熙LIVE·五棵松', tourName: '闹天宫', season: 5 },
  { id: 'cd-5-1', city: '成都', date: '2025-08-09', time: '19:30', venue: '五粮液文化体育中心综合体育馆', tourName: '闹天宫', season: 5 },
  { id: 'cd-5-2', city: '成都', date: '2025-08-10', time: '19:30', venue: '五粮液文化体育中心综合体育馆', tourName: '闹天宫', season: 5 },
  { id: 'hk-5-1', city: '海口', date: '2025-08-16', time: '19:30', venue: '海口五源河体育馆', tourName: '闹天宫', season: 5 },
  { id: 'sz-5-1', city: '深圳', date: '2025-08-30', time: '19:30', venue: '深圳大运中心体育馆', tourName: '闹天宫', season: 5 },
  { id: 'sz-5-2', city: '深圳', date: '2025-08-31', time: '19:30', venue: '深圳大运中心体育馆', tourName: '闹天宫', season: 5 },
  { id: 'sh-5-1', city: '上海', date: '2025-09-13', time: '19:30', venue: '梅赛德斯-奔驰文化中心', tourName: '闹天宫', season: 5 },
  { id: 'sh-5-2', city: '上海', date: '2025-09-14', time: '19:30', venue: '梅赛德斯-奔驰文化中心', tourName: '闹天宫', season: 5 },
  { id: 'nb-5-1', city: '宁波', date: '2025-09-26', time: '19:30', venue: '宁波奥体中心体育馆', tourName: '闹天宫', season: 5 },
  { id: 'nb-5-2', city: '宁波', date: '2025-09-27', time: '19:30', venue: '宁波奥体中心体育馆', tourName: '闹天宫', season: 5 },
  { id: 'bj-5-nc-1', city: '北京', date: '2025-10-06', time: '19:30', venue: '国家体育场（鸟巢）', tourName: '闹天宫', season: 5 },
  { id: 'bj-5-nc-2', city: '北京', date: '2025-10-07', time: '19:30', venue: '国家体育场（鸟巢）', tourName: '闹天宫', season: 5 },

  // Grandline 4 (STEP)
  { id: 'nj-4-1', city: '南京', date: '2024-06-15', time: '19:30', venue: '南京青奥体育公园体育馆', tourName: 'STEP', season: 4 },
  { id: 'nj-4-2', city: '南京', date: '2024-06-16', time: '19:30', venue: '南京青奥体育公园体育馆', tourName: 'STEP', season: 4 },
  { id: 'sel-4-1', city: '首尔', date: '2024-06-22', time: '18:00', venue: '奥林匹克公园奥林匹克Hall', tourName: 'STEP', season: 4 },
  { id: 'sel-4-2', city: '首尔', date: '2024-06-23', time: '16:00', venue: '奥林匹克公园奥林匹克Hall', tourName: 'STEP', season: 4 },
  { id: 'jk-4-1', city: '雅加达', date: '2024-06-29', time: '19:00', venue: 'ICE BSD City', tourName: 'STEP', season: 4 },
  { id: 'cd-4-1', city: '成都', date: '2024-07-06', time: '19:30', venue: '凤凰山体育公园综合体育馆', tourName: 'STEP', season: 4 },
  { id: 'kl-4-1', city: '吉隆坡', date: '2024-07-10', time: '20:00', venue: '吉隆坡Axiata Arena', tourName: 'STEP', season: 4 },
  { id: 'yok-4-1', city: '横滨', date: '2024-07-13', time: '18:00', venue: '横滨Arena', tourName: 'STEP', season: 4 },
  { id: 'xa-4-1', city: '西安', date: '2024-07-27', time: '19:30', venue: '西安奥体中心体育场', tourName: 'STEP', season: 4 },
  { id: 'xa-4-2', city: '西安', date: '2024-07-28', time: '19:30', venue: '西安奥体中心体育场', tourName: 'STEP', season: 4 },
  { id: 'gz-4-1', city: '广州', date: '2024-08-02', time: '19:30', venue: '广州宝能国际演艺中心', tourName: 'STEP', season: 4 },
  { id: 'gz-4-2', city: '广州', date: '2024-08-03', time: '19:30', venue: '广州宝能国际演艺中心', tourName: 'STEP', season: 4 },
  { id: 'sh-4-1', city: '上海', date: '2024-08-17', time: '19:30', venue: '浦发银行东方体育中心', tourName: 'STEP', season: 4 },
  { id: 'sh-4-2', city: '上海', date: '2024-08-18', time: '19:30', venue: '浦发银行东方体育中心', tourName: 'STEP', season: 4 },
  { id: 'xm-4-1', city: '厦门', date: '2024-11-02', time: '19:30', venue: '厦门奥林匹克中心凤凰体育馆', tourName: 'STEP', season: 4 },
  { id: 'zz-4-1', city: '郑州', date: '2025-02-28', time: '19:30', venue: '郑州奥体中心体育馆', tourName: 'STEP', season: 4 }
];

export const PRICE_TIERS = ['520', '1007', '1314', '1548', '1991'];

export const getPriceTiersForConcert = (concert: Concert): string[] => {
  // 鸟巢特殊价格
  if (concert.venue.includes('鸟巢')) {
    return ['380', '580', '780', '980', '1380'];
  }
  
  // 吉隆坡特殊价格
  if (concert.city === '吉隆坡') {
    return ['398', '598', '798', '998'];
  }
  
  // 雅加达特殊价格
  if (concert.city === '雅加达') {
    return ['1850000', '2350000', '2600000', '4600000'];
  }
  
  // 横滨特殊价格
  if (concert.city === '横滨') {
    return ['8800', '13000', '18000', '26000'];
  }
  
  // 首尔特殊价格
  if (concert.city === '首尔') {
    return ['154000'];
  }
  
  // 默认价格挡位
  return PRICE_TIERS;
};

export const getCurrencyForConcert = (concert: Concert): string => {
  if (concert.city === '吉隆坡') {
    return 'RM';
  }
  if (concert.city === '雅加达') {
    return 'Rp';
  }
  if (concert.city === '横滨') {
    return '円';
  }
  if (concert.city === '首尔') {
    return '₩';
  }
  return '¥';
};
