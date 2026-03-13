/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  MapPin, 
  Calendar, 
  Clock, 
  Ticket as TicketIcon, 
  ChevronLeft,
  Download,
  Share2,
  Info,
  Camera
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { CONCERTS, Concert, PRICE_TIERS } from './constants';

const LAY_ZHANG_IMAGE = "https://picsum.photos/seed/layzhang/800/1200"; // Placeholder for Lay Zhang's image
const LOGO_URL = "/imgs/logo.png"; // Local logo path
const POSTER_URL = "https://picsum.photos/seed/layposter/600/800"; // Placeholder for poster

const getConcertImage = (concert: Concert) => {
  const cityMap: Record<string, string> = {
    '北京': 'beijing',
    '成都': 'chengdu',
    '海口': 'haikou',
    '上海': 'shanghai',
    '宁波': 'ningbo',
    '南京': 'nanjing',
    '深圳': 'shenzhen',
    '广州': 'guangzhou',
    '西安': 'xian',
    '横滨': 'yokohama',
    '雅加达': 'jakarta',
    '首尔': 'seoul',
    '吉隆坡': 'kualalumpur',
    '厦门': 'xiamen',
    '郑州': 'zhengzhou'
  };

  const season = concert.season || 5;
  const pinyin = cityMap[concert.city] || 'beijing';

  if (season === 5) {
    if (concert.city === '北京' && concert.venue.includes('鸟巢')) {
      if (concert.date === '2025-10-06') return '/imgs/grandline5/beijing5_niaochao_day1.jpg';
      if (concert.date === '2025-10-07') return '/imgs/grandline5/beijing5_niaochao_day2.jpg';
      return '/imgs/grandline5/beijing5.jpg';
    }
    return `/imgs/grandline5/${pinyin}5.jpg`;
  }
  
  if (season === 4) {
    return `/imgs/grandline4/${pinyin}4.jpg`;
  }
  
  return `/imgs/grandline${season}/${pinyin}${season}.jpg`;
};

export default function App() {
  const [selectedConcert, setSelectedConcert] = useState<Concert | null>(CONCERTS[0]);
  const [showTicket, setShowTicket] = useState(false);
  const [userName, setUserName] = useState('');
  const [price, setPrice] = useState(PRICE_TIERS[PRICE_TIERS.length - 1]);
  const [area, setArea] = useState('');
  const [seat, setSeat] = useState('');
  const [location, setLocation] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const ticketRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedConcert) {
      setLocation(`${selectedConcert.city} · ${selectedConcert.venue}`);
    }
  }, [selectedConcert]);

  const handleSaveImage = async () => {
    if (!ticketRef.current || isSavingImage) return;
    setIsSavingImage(true);
    
    try {
      // Small delay to ensure any pending renders are complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
        pixelRatio: 2, // Higher quality
        backgroundColor: '#09090b', // zinc-950
      });
      
      const link = document.createElement('a');
      link.download = `lay_zhang_ticket_${selectedConcert?.city}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      setToastMessage('票根图片已保存至相册');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Failed to save image:', err);
      alert('保存图片失败，请重试');
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleDownloadPass = async () => {
    if (!selectedConcert || isDownloading) return;
    setIsDownloading(true);

    try {
      const response = await fetch('/api/generate-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concert: selectedConcert, userName, price, area, seat, location }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown server error' }));
        throw new Error(errorData.message || `Server returned ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `lay_zhang_${selectedConcert.city}_${Date.now()}.pkpass`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      setToastMessage('已成功生成并开始下载票根');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error: any) {
      console.error('Download error:', error);
      alert(`下载失败: ${error.message || '请检查网络连接或服务器状态。'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-purple-500/30 font-sans overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 bg-mesh" />

      <div className="relative z-10 max-w-lg mx-auto min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {!showTicket ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col px-6 py-12"
            >
              {/* Hero Section */}
              <header className="mb-12 pt-8 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h1 className="text-4xl font-black tracking-tighter text-white leading-none mb-2 uppercase font-display">
                    {selectedConcert?.tourName || '闹天宫'} <span className="text-purple-400">电子票生成器</span>
                  </h1>
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500">
                    2023-2025 大航海 · {selectedConcert?.tourName || '闹天宫'} 巡回演唱会
                  </p>
                </motion.div>
              </header>

              {/* Form Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="glass-panel rounded-[2rem] p-8 space-y-8"
              >
                <div className="space-y-6">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">持票人姓名</label>
                    <input
                      type="text"
                      placeholder="请输入您的姓名"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                  </div>

                  {/* Price, Area & Seat Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">票价档位</label>
                      <div className="relative">
                        <select
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none transition-all cursor-pointer text-sm"
                        >
                          {PRICE_TIERS.map(p => (
                            <option key={p} value={p} className="bg-zinc-900">¥{p}</option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                          <ChevronRight size={14} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">区域</label>
                      <input
                        type="text"
                        placeholder="例如：内场A区"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">座位</label>
                      <input
                        type="text"
                        placeholder="例如：05排04座"
                        value={seat}
                        onChange={(e) => setSeat(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Concert Selection */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">选择场次日期</label>
                      <div className="relative">
                        <select
                          value={selectedConcert?.id || ''}
                          onChange={(e) => {
                            const concert = CONCERTS.find(c => c.id === e.target.value);
                            if (concert) setSelectedConcert(concert);
                          }}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none transition-all cursor-pointer"
                        >
                          {CONCERTS.map(concert => (
                            <option key={concert.id} value={concert.id} className="bg-zinc-900">
                              {concert.date} ({concert.city})
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                          <ChevronRight size={18} className="rotate-90" />
                        </div>
                      </div>
                    </div>

                    {/* Location Display (Locked) */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">演出地点</label>
                      <div className="w-full bg-white/[0.01] border border-white/5 rounded-2xl px-6 py-4 text-zinc-400 text-sm flex items-center gap-3">
                        <MapPin size={14} className="text-purple-500" />
                        {selectedConcert ? `${selectedConcert.city} · ${selectedConcert.venue}` : '请先选择场次'}
                      </div>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectedConcert ? setShowTicket(true) : alert('请先选择一个场次')}
                  className="w-full bg-white text-black font-black py-5 rounded-2xl text-sm uppercase tracking-[0.2em] shadow-xl transition-all"
                >
                  生成电子票根
                </motion.button>
              </motion.div>

              <footer className="mt-auto pt-12 text-center">
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.3em]">
                  © 2025 Chromosome Entertainment Group
                </p>
              </footer>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-8 flex items-center justify-between">
                <button 
                  onClick={() => setShowTicket(false)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl glass-card text-white hover:bg-white/10 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">票根预览</h2>
                  <p className="text-xs font-bold text-white">{selectedConcert?.city}站</p>
                </div>
                <div className="w-12" />
              </div>

              {/* Ticket View */}
              <div className="flex-1 flex items-center justify-center px-6 py-4">
                <div ref={ticketRef} className="w-full flex justify-center">
                  <TicketView 
                    concert={selectedConcert!} 
                    userName={userName} 
                    price={price} 
                    area={area}
                    seat={seat} 
                    location={location}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="p-8 space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isDownloading}
                  onClick={handleDownloadPass}
                  className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all ${
                    isDownloading ? 'bg-zinc-800 text-zinc-500' : 'bg-white text-black shadow-2xl'
                  }`}
                >
                  {isDownloading ? (
                    <div className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Apple_Wallet_Icon.svg/1024px-Apple_Wallet_Icon.svg.png" 
                        alt="Wallet" 
                        className="w-6 h-6"
                      />
                      添加至 Apple 票夹
                    </>
                  )}
                </motion.button>

                <div className="grid grid-cols-2 gap-4">
                  <button className="glass-card py-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                    <Share2 size={16} /> 分享
                  </button>
                  <button 
                    onClick={handleSaveImage}
                    disabled={isSavingImage}
                    className="glass-card py-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
                  >
                    {isSavingImage ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><Camera size={16} /> 保存图片</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-50 bg-white text-black px-8 py-4 rounded-full font-bold shadow-2xl flex items-center gap-3"
          >
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <TicketIcon size={14} className="text-white" />
            </div>
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TicketView({ concert, userName, price, area, seat, location }: { concert: Concert, userName: string, price: string, area: string, seat: string, location: string }) {
  const fullDate = concert.date; // e.g. 2025-03-22
  const displayDate = fullDate.replace(/-/g, ' / ');

  return (
    <motion.div 
      layoutId="ticket-card"
      className="w-full max-w-[340px] sm:max-w-[360px] aspect-[1/1.6] rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative flex flex-col group animate-float origin-center"
    >
      {/* Full-bleed Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`/imgs/grandline${concert.season || 5}_bg.jpg`} 
          alt="Background" 
          className="w-full h-1/2 object-cover opacity-90"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = LAY_ZHANG_IMAGE;
          }}
        />
        {/* Gradient Overlays for readability and "晕染" effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#4c1d95]/80 to-[#4c1d95]" />
      </div>

      {/* Top Bar: Logo, Title, Info */}
      <div className="relative z-20 px-6 pt-6 flex items-start justify-between">
        {/* Left Section: Poster and Main Text */}
        <div className="flex flex-col gap-4">
          {/* Poster and Text Row */}
          <div className="flex items-end gap-3">
            {/* Poster Image */}
            <div className="w-16 aspect-[3/4] rounded-lg overflow-hidden border border-white/20 shadow-lg shrink-0">
              <img 
                src={getConcertImage(concert)} 
                alt="Poster" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Main Text Block */}
            <div className="flex flex-col items-start">
              <h3 className="text-2xl text-white font-artistic drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] leading-none">
                {concert.tourName}
              </h3>
              <div className="mt-1">
                <h3 className="text-lg font-black text-white leading-none tracking-tighter uppercase drop-shadow-md">
                  LAY ZHANG
                </h3>
                <p className="font-serif italic text-purple-200 text-[8px] mt-0.5 drop-shadow-sm leading-none">
                  GRANDLINE {concert.season}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Right Info: Venue */}
        <div className="text-right space-y-1.5 max-w-[120px]">
          <p className="text-[8px] font-black text-white leading-none whitespace-nowrap drop-shadow-md">{fullDate.replace(/-/g, '.')} {concert.time}</p>
          <p className="text-[7px] font-bold text-purple-100 uppercase tracking-tight leading-tight drop-shadow-md">{concert.city} · {concert.venue}</p>
        </div>
      </div>

      {/* Spacer to push content down */}
      <div className="mt-auto" />

      {/* Divider */}
      <div className="relative z-20 h-8 flex items-center">
        <div className="absolute left-0 w-4 h-8 bg-zinc-950 rounded-r-full -translate-x-1/2" />
        <div className="absolute right-0 w-4 h-8 bg-zinc-950 rounded-l-full translate-x-1/2" />
        <div className="w-full border-t border-dashed border-white/30 mx-8" />
      </div>

      {/* Content Section */}
      <div className="relative z-20 px-8 pb-8 flex flex-col justify-between bg-[#4c1d95]/60">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 pt-6">
          <div className="space-y-1">
            <p className="text-[8px] font-bold text-purple-200/70 uppercase tracking-widest">地点 / CITY</p>
            <p className="text-xl font-bold text-white tracking-tight leading-none">{concert.city}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[8px] font-bold text-purple-200/70 uppercase tracking-widest">日期 / DATE</p>
            <p className="text-xl font-bold text-white tracking-tight leading-none">{displayDate}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-[8px] font-bold text-purple-200/70 uppercase tracking-widest">开演时间 / TIME</p>
            <p className="text-lg font-bold text-white tracking-tight leading-none">{concert.time}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[8px] font-bold text-purple-200/70 uppercase tracking-widest">观演区域 / AREA</p>
            <p className="text-lg font-bold text-white tracking-tight leading-none">{area || 'GA'}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[8px] font-bold text-purple-200/70 uppercase tracking-widest">座位号 / SEAT</p>
            <p className="text-lg font-bold text-white tracking-tight leading-none">{seat || 'GA'}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[8px] font-bold text-purple-200/70 uppercase tracking-widest">票价 / PRICE</p>
            <p className="text-lg font-bold text-white tracking-tight leading-none">¥{price}</p>
          </div>
          
          {userName && (
            <div className="col-span-2 space-y-1">
              <p className="text-[8px] font-bold text-purple-200/70 uppercase tracking-widest">持票人 / HOLDER</p>
              <p className="text-sm font-bold text-white tracking-tight leading-none truncate">{userName}</p>
            </div>
          )}

          <div className="col-span-2 space-y-1 mt-2">
            <p className="text-[8px] font-bold text-purple-200/70 uppercase tracking-widest">场馆 / VENUE</p>
            <p className="text-[11px] font-semibold text-purple-50 leading-tight">{concert.venue}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/20 flex flex-col items-center">
          <p className="text-[8px] font-mono text-purple-200/60 tracking-[0.4em] uppercase">
            {userName ? userName.replace(/\s/g, '_') : 'GUEST'}_LZ2025_{concert.id}
          </p>
          <p className="text-[6px] text-purple-200/40 mt-2 tracking-widest uppercase italic">Chromosome Entertainment Group Official Ticket</p>
        </div>
      </div>
    </motion.div>
  );
}
