import React from 'react';
import { motion } from 'motion/react';
import { Wind, ShieldCheck, Sun, ArrowUp, Check, X, RefreshCw, Compass } from 'lucide-react';
import { BusWindows } from '../types';

export const playWindowSound = (isOpen: boolean) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    if (isOpen) {
      // Opening latch and breeze sound
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    } else {
      // Closing firm latch sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.09);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    }

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  } catch {
    // Ignore audio context failures
  }
};

interface IvecoWindowLayoutProps {
  windows: BusWindows;
  setWindows: React.Dispatch<React.SetStateAction<BusWindows>>;
  externalTemp: number;
  passengerTemp: number;
  driverTemp: number;
  isDriving: boolean;
  isDarkMode: boolean;
  acActive: boolean;
}

export const IvecoWindowLayout: React.FC<IvecoWindowLayoutProps> = ({
  windows,
  setWindows,
  externalTemp,
  passengerTemp,
  driverTemp,
  isDriving,
  isDarkMode,
  acActive
}) => {
  const toggleWindow = (key: keyof BusWindows) => {
    const nextState = !windows[key];
    playWindowSound(nextState);
    setWindows(prev => ({
      ...prev,
      [key]: nextState
    }));
  };

  const openAll = () => {
    playWindowSound(true);
    setWindows({
      driverWindow: true,
      roofHatchFront: true,
      roofHatchRear: true,
      leftWindow1: true,
      leftWindow2: true,
      leftWindow3: true,
      rightWindow1: true,
      rightWindow2: true,
      rightWindow3: true
    });
  };

  const closeAll = () => {
    playWindowSound(false);
    setWindows({
      driverWindow: false,
      roofHatchFront: false,
      roofHatchRear: false,
      leftWindow1: false,
      leftWindow2: false,
      leftWindow3: false,
      rightWindow1: false,
      rightWindow2: false,
      rightWindow3: false
    });
  };

  const openRoofOnly = () => {
    playWindowSound(true);
    setWindows(prev => ({
      ...prev,
      roofHatchFront: true,
      roofHatchRear: true
    }));
  };

  const openSideWindowsOnly = () => {
    playWindowSound(true);
    setWindows(prev => ({
      ...prev,
      leftWindow1: true,
      leftWindow2: true,
      leftWindow3: true,
      rightWindow1: true,
      rightWindow2: true,
      rightWindow3: true
    }));
  };

  // Calculate total open count & ventilation factor
  const openCount = [
    windows.driverWindow,
    windows.roofHatchFront,
    windows.roofHatchRear,
    windows.leftWindow1,
    windows.leftWindow2,
    windows.leftWindow3,
    windows.rightWindow1,
    windows.rightWindow2,
    windows.rightWindow3
  ].filter(Boolean).length;

  const ventilationPercent = Math.round((openCount / 9) * 100);

  // Natural cooling assessment
  const isPleasantOutside = externalTemp >= 17 && externalTemp <= 26;
  const isWindowsCooled = openCount >= 3 && !acActive;

  return (
    <div className={`rounded-2xl border flex flex-col gap-3 p-3.5 sm:p-5 transition-all ${
      isDarkMode 
        ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl backdrop-blur-md' 
        : 'bg-white border-slate-200 text-slate-900 shadow-md'
    }`}>
      {/* Header bar */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-3 ${
        isDarkMode ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Wind size={20} className={openCount > 0 ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black uppercase tracking-wider text-emerald-500">
                Půdorys Iveco Crossway 12M
              </h4>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {openCount} / 9 otevřeno
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Přirozené větrání a chlazení vozu bez nutnosti zapínání klimatizace
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border ${
            isDriving 
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
              : 'bg-slate-800/50 text-slate-400 border-slate-700/50'
          }`}>
            <Compass size={13} className={isDriving ? 'animate-spin-slow' : ''} />
            <span>{isDriving ? 'JÍZDA: Náporový proud' : 'STÁNÍ: Termický vztlak'}</span>
          </div>

          <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border ${
            ventilationPercent > 0 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-slate-800/50 text-slate-500 border-slate-700/50'
          }`}>
            <Wind size={13} />
            <span>Průtok {ventilationPercent}%</span>
          </div>
        </div>
      </div>

      {/* Crossway Interactive Bus Diagram */}
      <div className={`relative w-full rounded-2xl border p-4 sm:p-5 overflow-x-auto select-none ${
        isDarkMode ? 'bg-[#090d16] border-slate-800 shadow-inner' : 'bg-slate-50/80 border-slate-200'
      }`}>
        {/* Min-width container to preserve bus proportions on mobile */}
        <div className="min-w-[620px] max-w-4xl mx-auto flex flex-col gap-2.5">
          
          {/* TOP SIDE (Levá strana vozu) */}
          <div className="flex items-center justify-between px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Levá strana vozu (Boční posuvná okna)
            </span>
            <span className="font-mono text-slate-500">IVECO BUS CROSSWAY LE 12M</span>
          </div>

          {/* BUS BODY CHASSIS */}
          <div className={`relative rounded-3xl border-2 p-3.5 transition-all ${
            isDarkMode 
              ? 'bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-900/90 border-slate-700/60 shadow-2xl' 
              : 'bg-gradient-to-b from-slate-100 via-slate-200/70 to-slate-100 border-slate-300 shadow-md'
          }`}>
            
            {/* Front windshield curvature / front bumper indicator */}
            <div className="absolute -left-1 top-3 bottom-3 w-3.5 rounded-l-2xl bg-slate-700 border-r border-slate-600 flex items-center justify-center">
              <span className="text-[7px] font-black text-white transform -rotate-90">ČELO</span>
            </div>

            {/* Rear bumper indicator */}
            <div className="absolute -right-1 top-3 bottom-3 w-3.5 rounded-r-2xl bg-slate-700 border-l border-slate-600 flex items-center justify-center">
              <span className="text-[7px] font-black text-white transform rotate-90">ZÁĎ</span>
            </div>

            {/* BUS INTERIOR GRID */}
            <div className="flex items-stretch gap-2.5 pl-4 pr-3 py-1">
              
              {/* SECTION 1: CABIN & FRONT ENTRANCE */}
              <div className={`w-40 rounded-xl border p-2.5 flex flex-col justify-between relative ${
                isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-500">
                    Kabina Řidiče
                  </span>
                  <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {driverTemp.toFixed(1)}°C
                  </span>
                </div>

                {/* Driver window button (posuvné okno řidiče) */}
                <button
                  type="button"
                  id="window-driver-toggle"
                  onClick={() => toggleWindow('driverWindow')}
                  className={`w-full py-2 px-2.5 rounded-lg border flex items-center justify-between gap-1.5 transition-all cursor-pointer active:scale-98 ${
                    windows.driverWindow
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold shadow-sm'
                      : isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                  title="Kliknutím otevřete / zavřete posuvné boční okno u řidiče"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${windows.driverWindow ? 'bg-emerald-400 ring-2 ring-emerald-500/30' : 'bg-slate-600'}`} />
                    <span className="text-[10px] font-black uppercase">Okno Řidiče</span>
                  </div>
                  {windows.driverWindow ? (
                    <span className="text-[9px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                      OTEVŘENO <Check size={12} />
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-500">Zavřeno</span>
                  )}
                </button>

                {/* Windshield & Steering wheel mini graphic */}
                <div className="my-2 flex items-center justify-between text-[8px] text-slate-400 font-mono px-1">
                  <span>Volant Iveco</span>
                  <span>Odbavení OIB</span>
                </div>

                {/* Front Door 1 */}
                <div className={`w-full py-1.5 rounded-lg text-center border text-[8px] font-bold uppercase tracking-wider ${
                  isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  Dveře 1 (Přední)
                </div>
              </div>

              {/* SECTION 2: FRONT & MID SALON (Low floor section) */}
              <div className={`flex-1 rounded-xl border p-2.5 flex flex-col justify-between gap-2 relative ${
                isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                {/* Left Side Windows: L1 and L2 */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="window-left-1"
                    onClick={() => toggleWindow('leftWindow1')}
                    className={`py-1.5 px-2.5 rounded-lg border flex items-center justify-between text-[9px] font-bold transition-all cursor-pointer active:scale-98 ${
                      windows.leftWindow1
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm'
                        : isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>Levé okno 1 (Vpředu)</span>
                    <span className="font-mono text-[8px] font-black">{windows.leftWindow1 ? 'OTEVŘENO' : 'ZAVŘENO'}</span>
                  </button>

                  <button
                    type="button"
                    id="window-left-2"
                    onClick={() => toggleWindow('leftWindow2')}
                    className={`py-1.5 px-2.5 rounded-lg border flex items-center justify-between text-[9px] font-bold transition-all cursor-pointer active:scale-98 ${
                      windows.leftWindow2
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm'
                        : isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>Levé okno 2 (Střed)</span>
                    <span className="font-mono text-[8px] font-black">{windows.leftWindow2 ? 'OTEVŘENO' : 'ZAVŘENO'}</span>
                  </button>
                </div>

                {/* CEILING / ROOF HATCH 1 (Stropní poklop přední) */}
                <div className="my-0.5 flex justify-center">
                  <button
                    type="button"
                    id="roof-hatch-front"
                    onClick={() => toggleWindow('roofHatchFront')}
                    className={`w-5/6 py-2 px-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer active:scale-98 ${
                      windows.roofHatchFront
                        ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-black shadow-sm'
                        : isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                    title="Kliknutím vyklopíte / zavřete přední střešní větrací poklop"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowUp size={14} className={windows.roofHatchFront ? 'text-sky-400 animate-bounce' : 'text-slate-600'} />
                      <span className="text-[10px] font-black uppercase">Stropní Větračka 1 (Přední poklop)</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold">
                      {windows.roofHatchFront ? 'VYKLOPENO' : 'ZAVŘENO'}
                    </span>
                  </button>
                </div>

                {/* Right Side Windows / Door 2: R1 and Door 2 */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="window-right-1"
                    onClick={() => toggleWindow('rightWindow1')}
                    className={`py-1.5 px-2.5 rounded-lg border flex items-center justify-between text-[9px] font-bold transition-all cursor-pointer active:scale-98 ${
                      windows.rightWindow1
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm'
                        : isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>Pravé okno 1 (Vpředu)</span>
                    <span className="font-mono text-[8px] font-black">{windows.rightWindow1 ? 'OTEVŘENO' : 'ZAVŘENO'}</span>
                  </button>

                  <div className={`py-1.5 px-2.5 rounded-lg border text-center text-[8px] font-bold uppercase tracking-wider flex items-center justify-center ${
                    isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}>
                    Dveře 2 (Střední dvoukřídlé)
                  </div>
                </div>
              </div>

              {/* SECTION 3: REAR SALON (Elevated section over engine) */}
              <div className={`w-72 rounded-xl border p-2.5 flex flex-col justify-between gap-2 relative ${
                isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                {/* Left Side Window L3 */}
                <button
                  type="button"
                  id="window-left-3"
                  onClick={() => toggleWindow('leftWindow3')}
                  className={`w-full py-1.5 px-2.5 rounded-lg border flex items-center justify-between text-[9px] font-bold transition-all cursor-pointer active:scale-98 ${
                    windows.leftWindow3
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm'
                      : isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span>Levé okno 3 (Zadní salón)</span>
                  <span className="font-mono text-[8px] font-black">{windows.leftWindow3 ? 'OTEVŘENO' : 'ZAVŘENO'}</span>
                </button>

                {/* CEILING / ROOF HATCH 2 (Stropní poklop zadní) */}
                <div className="my-0.5 flex justify-center">
                  <button
                    type="button"
                    id="roof-hatch-rear"
                    onClick={() => toggleWindow('roofHatchRear')}
                    className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer active:scale-98 ${
                      windows.roofHatchRear
                        ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-black shadow-sm'
                        : isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                    title="Kliknutím vyklopíte / zavřete zadní střešní větrací poklop"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowUp size={14} className={windows.roofHatchRear ? 'text-sky-400 animate-bounce' : 'text-slate-600'} />
                      <span className="text-[10px] font-black uppercase">Stropní Větračka 2 (Zadní poklop)</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold">
                      {windows.roofHatchRear ? 'VYKLOPENO' : 'ZAVŘENO'}
                    </span>
                  </button>
                </div>

                {/* Right Side Window R3 */}
                <button
                  type="button"
                  id="window-right-3"
                  onClick={() => toggleWindow('rightWindow3')}
                  className={`w-full py-1.5 px-2.5 rounded-lg border flex items-center justify-between text-[9px] font-bold transition-all cursor-pointer active:scale-98 ${
                    windows.rightWindow3
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm'
                      : isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span>Pravé okno 3 (Zadní salón)</span>
                  <span className="font-mono text-[8px] font-black">{windows.rightWindow3 ? 'OTEVŘENO' : 'ZAVŘENO'}</span>
                </button>
              </div>

            </div>
          </div>

          {/* BOTTOM SIDE (Pravá strana vozu) */}
          <div className="flex items-center justify-between px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Pravá strana vozu (Nástupní strana - Dveře 1 & 2)
            </span>
            <span className="font-mono text-sky-400">
              Salón: {passengerTemp.toFixed(1)}°C · Venku: {externalTemp.toFixed(1)}°C
            </span>
          </div>

        </div>
      </div>

      {/* Control Buttons & Physics Feedback */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 items-stretch">
        
        {/* Quick action buttons (col 7) */}
        <div className="sm:col-span-7 flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="btn-open-all-windows"
            onClick={openAll}
            className="flex-1 min-w-[130px] h-10 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
          >
            <Wind size={14} />
            Vyvětrat vše (Okna + Strop)
          </button>

          <button
            type="button"
            id="btn-close-all-windows"
            onClick={closeAll}
            className="flex-1 min-w-[110px] h-10 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
          >
            <X size={14} />
            Zavřít všechna okna
          </button>

          <button
            type="button"
            id="btn-open-roof-hatches"
            onClick={openRoofOnly}
            className="h-10 px-3 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 active:scale-98 text-sky-400 font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
            title="Otevře oba stropní poklopy pro odvod tepla bez průvanu"
          >
            <ArrowUp size={13} />
            Jen stropní poklopy
          </button>

          <button
            type="button"
            id="btn-open-side-windows"
            onClick={openSideWindowsOnly}
            className="h-10 px-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-98 text-emerald-400 font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
            title="Otevře boční větračky pro silnější příčný průvan"
          >
            <RefreshCw size={13} />
            Boční větračky
          </button>
        </div>

        {/* Real-time thermodynamic advice box (col 5) */}
        <div className={`sm:col-span-5 rounded-xl p-3 border text-left flex flex-col justify-center transition-colors ${
          isPleasantOutside && openCount >= 2
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : isPleasantOutside && acActive
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            {isPleasantOutside && openCount >= 2 ? (
              <>
                <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  Přirozené větrání aktivní · Eko režim
                </span>
              </>
            ) : isPleasantOutside && acActive ? (
              <>
                <Sun size={15} className="text-amber-400 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  Doporučení při {externalTemp.toFixed(1)}°C:
                </span>
              </>
            ) : (
              <>
                <Wind size={15} className="text-sky-400 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">
                  Výměna vzduchu Iveco:
                </span>
              </>
            )}
          </div>

          <p className="text-[11px] leading-relaxed text-slate-300">
            {isPleasantOutside && openCount >= 2 ? (
              <span>
                Při venkovních {externalTemp.toFixed(1)}°C proudí okny a stropem čerstvý vzduch. Interiér se chladí sám bez kompresoru klimatizace — úspora paliva!
              </span>
            ) : isPleasantOutside && acActive ? (
              <span>
                Venku je příjemných {externalTemp.toFixed(1)}°C! Místo zapínání AC otevřete střešní poklopy a větračky pro přirozený tah.
              </span>
            ) : openCount === 0 ? (
              <span>
                Všechna okna jsou zavřená. {externalTemp > 18 ? 'Interiér se na slunci ohřívá (skleníkový efekt).' : 'Teplo zůstává uvnitř vozu.'}
              </span>
            ) : (
              <span>
                Otevřeno {openCount} z 9 prvků. Výměna vzduchu cca {Math.round(ventilationPercent * (isDriving ? 1.5 : 0.8))}% za minutu.
              </span>
            )}
          </p>
        </div>

      </div>
    </div>
  );
};
