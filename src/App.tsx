import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Bus, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  User, 
  MapPin, 
  CreditCard, 
  ShoppingCart,
  Printer, 
  Menu, 
  History, 
  Settings, 
  Wifi, 
  Signal,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Thermometer,
  Sun,
  Moon,
  Power,
  Lock,
  ArrowRight,
  Trash2,
  X,
  Volume2,
  Lightbulb,
  Megaphone,
  FileText,
  LogOut,
  Coffee,
  Wind,
  Snowflake,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES, TICKET_TYPES, BASE_PRICE, PRICE_PER_ZONE, DRIVERS, SERVICE_ANNOUNCEMENTS, SYSTEM_ERRORS, DISPATCHER_MESSAGES, PASSENGER_FEEDBACK } from './constants';
import { Stop, TicketType, Transaction, Route, Driver } from './types';
import { cn } from '@/lib/utils';
import { MessageSquare, Camera, Bell, ShieldAlert, Gauge, RefreshCw, Maximize, Minimize, Search, Users, UserMinus, Phone, Info, AlertOctagon, HelpCircle, Activity, Zap } from 'lucide-react';

export default function App() {
  // Authentication & Session
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);
  const [pin, setPin] = useState('');
  
  // App State
  const [routes, setRoutes] = useState<Route[]>(ROUTES);
  const [currentRoute, setCurrentRoute] = useState<Route>(ROUTES[0]);
  const [isEditJrOpen, setIsEditJrOpen] = useState(false);
  const [editingStops, setEditingStops] = useState<Stop[]>([]);
  const [editingRouteName, setEditingRouteName] = useState("");
  const [editingRouteNumber, setEditingRouteNumber] = useState("");
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [selectedDestinationIndex, setSelectedDestinationIndex] = useState(1);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType>(TICKET_TYPES[0]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPrinting, setIsPrinting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cart, setCart] = useState<{type: TicketType, count: number}[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile' | 'qr'>('cash');
  const [systemError, setSystemError] = useState<string | null>(null);
  
  // Detailed Realistic Payment System & Fault States
  const [paymentProgressState, setPaymentProgressState] = useState<'idle' | 'processing_payment' | 'printing_ticket' | 'payment_error'>('idle');
  const [paymentStatusText, setPaymentStatusText] = useState("");
  const [paymentProgress, setPaymentProgress] = useState(0);
  const [isCriticalError, setIsCriticalError] = useState(false);
  const [criticalErrorMessage, setCriticalErrorMessage] = useState<string | null>(null);
  const [rebootingState, setRebootingState] = useState<{ step: number; log: string[]; progress: number } | null>(null);
  const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false);
  const [serviceDestination, setServiceDestination] = useState<string | null>(null);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<string | null>(null);
  const [isGongEnabled, setIsGongEnabled] = useState(true);
  const [messages, setMessages] = useState<{id: string, text: string, time: Date, read: boolean}[]>([]);
  const [passengerCount, setPassengerCount] = useState(0);
  const [totalBoarded, setTotalBoarded] = useState(0);
  const [passengersByStop, setPassengersByStop] = useState<Record<string, number>>({});
  const [stopRequest, setStopRequest] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [activeCamera, setActiveCamera] = useState<'interior' | 'door1' | 'door2' | 'rear'>('interior');
  
  const [isDriving, setIsDriving] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [feedbacks, setFeedbacks] = useState<{id: string, text: string, time: Date}[]>([]);

  // Features
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSaverActive, setIsSaverActive] = useState(false);
  const [deviation, setDeviation] = useState(0); // in seconds
  const [tripStartTime, setTripStartTime] = useState<Date | null>(null);
  const [manualStartTime, setManualStartTime] = useState("08:00");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("home"); // Changed default tab to home
  const [saverCountdown, setSaverCountdown] = useState(30);
  const [showCountdown, setShowCountdown] = useState(false);
  const [routeSearchQuery, setRouteSearchQuery] = useState("");
  const [vehicleType, setVehicleType] = useState<'sor' | 'crossway'>('sor');
  const [selectedVoiceType, setSelectedVoiceType] = useState<'male' | 'female'>('male');
  const [activeHvacZone, setActiveHvacZone] = useState<'passenger' | 'driver'>('passenger');
  const speechQueueRef = useRef<{ text: string; withGong: boolean }[]>([]);
  const isSpeakingRef = useRef<boolean>(false);
  
  // Bus Stats
  const [busStats, setBusStats] = useState({
    fuel: 65,
    mileage: 124580,
    volume: 50,
    interiorLights: false
  });
  
  // Iveco Crossway LE Heating State
  const [hvac, setHvac] = useState({
    driverTemp: 18,
    passengerTemp: 18,
    targetPassengerTemp: 22,
    targetDriverTemp: 22,
    fanSpeed: 2,
    auto: true,
    ac: false,
    webasto: false,
    frontDefrost: false,
    recirculation: false,
    rearHeating: true,
    floorHeating: false,
    externalTemp: 5,
    mode: 'auto' as 'auto' | 'manual' | 'eco',
    fanMode: 'face' as 'face' | 'feet' | 'both' | 'defrost',
    heatingIntensity: 0, // 0-100%
    coolingIntensity: 0  // 0-100%
  });

  // Fetch real weather for Horní Slavkov
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=50.138&longitude=12.809&current_weather=true');
        const data = await response.json();
        if (data.current_weather && data.current_weather.temperature !== undefined) {
          const temp = Math.round(data.current_weather.temperature * 10) / 10;
          setHvac(prev => ({ ...prev, externalTemp: temp }));
        }
      } catch (error) {
        console.error("Weather fetch failed:", error);
      }
    };
    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 300000); // Update every 5 minutes
    return () => clearInterval(weatherInterval);
  }, []);
  
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [isHvacOpen, setIsHvacOpen] = useState(false);
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);
  
  const saverTimeout = 30000; // 30 seconds for demo
  const activityRef = useRef<number>(Date.now());

  // HVAC Simulation Logic
  useEffect(() => {
    const hvacTimer = setInterval(() => {
      setHvac(prev => {
        // Temperature physics
        const insulation = 0.002;
        const passengerDrift = (prev.externalTemp - prev.passengerTemp) * insulation;
        const driverDrift = (prev.externalTemp - prev.driverTemp) * insulation;

        let heatingIntensity = 0;
        let coolingIntensity = 0;
        let fanSpeed = prev.fanSpeed;

        // Auto mode logic
        if (prev.auto) {
          const pDiff = prev.targetPassengerTemp - prev.passengerTemp;
          // Auto fan speed adjustment
          if (Math.abs(pDiff) > 5) fanSpeed = 4;
          else if (Math.abs(pDiff) > 2) fanSpeed = 3;
          else if (Math.abs(pDiff) > 0.5) fanSpeed = 2;
          else fanSpeed = 1;

          if (pDiff > 0) heatingIntensity = Math.min(100, pDiff * 20);
          else if (prev.ac) coolingIntensity = Math.min(100, Math.abs(pDiff) * 30);
        } else {
          // Manual mode logic
          if (prev.webasto) heatingIntensity = 100;
          else if (prev.targetPassengerTemp > prev.passengerTemp && prev.fanSpeed > 0) heatingIntensity = prev.fanSpeed * 20;
          
          if (prev.ac) coolingIntensity = prev.fanSpeed * 25;
        }

        // Apply temperature changes
        const heatingEffect = (heatingIntensity / 100) * 0.08 * (fanSpeed + 1);
        const coolingEffect = (coolingIntensity / 100) * 0.12 * (fanSpeed + 1);

        const passengerChange = heatingEffect - coolingEffect;
        const driverChange = (heatingEffect - coolingEffect) * 1.1; // Driver area is smaller, heats faster

        return {
          ...prev,
          fanSpeed,
          heatingIntensity,
          coolingIntensity,
          passengerTemp: Math.min(30, Math.max(14, prev.passengerTemp + passengerDrift + passengerChange)),
          driverTemp: Math.min(30, Math.max(14, prev.driverTemp + driverDrift + driverChange))
        };
      });
    }, 2000);
    return () => clearInterval(hvacTimer);
  }, []);

  // Update clock and automatic deviation
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Auto-saver check removed - now manual only per user request
      
      // Random Passenger Feedback
      if (isLoggedIn && Math.random() < 0.0003) {
        const newFeedback = {
          id: Math.random().toString(36).substr(2, 9),
          text: PASSENGER_FEEDBACK[Math.floor(Math.random() * PASSENGER_FEEDBACK.length)],
          time: new Date()
        };
        setFeedbacks(prev => [newFeedback, ...prev].slice(0, 50));
      }

      // Random dynamic bus stats
      setBusStats(prev => ({
        ...prev,
        fuel: Math.max(0, prev.fuel - (isDriving ? 0.0001 : 0.00001)),
        mileage: prev.mileage + (isDriving ? 0.005 : 0)
      }));

      // Random system errors
      if (isLoggedIn && !systemError && Math.random() < 0.001) {
        setSystemError(SYSTEM_ERRORS[Math.floor(Math.random() * SYSTEM_ERRORS.length)]);
      }

      // Random Dispatcher Messages
      if (isLoggedIn && Math.random() < 0.0005) {
        const newMessage = {
          id: Math.random().toString(36).substr(2, 9),
          text: DISPATCHER_MESSAGES[Math.floor(Math.random() * DISPATCHER_MESSAGES.length)],
          time: new Date(),
          read: false
        };
        setMessages(prev => [newMessage, ...prev]);
        // Optional: play a notification sound or gong
        if (isGongEnabled) playGong();
      }

      // Random Stop Requests
      if (isLoggedIn && !stopRequest && Math.random() < 0.002) {
        setStopRequest(true);
        // Play stop request sound (short beep)
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      }

      // Automatic deviation calculation
      if (tripStartTime) {
        const scheduledMinutes = currentRoute.stops[currentStopIndex].minutesFromStart;
        const scheduledTime = new Date(tripStartTime.getTime() + scheduledMinutes * 60000);
        const diffSeconds = Math.floor((now.getTime() - scheduledTime.getTime()) / 1000);
        setDeviation(diffSeconds);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoggedIn, isSaverActive, tripStartTime, currentRoute, currentStopIndex]);

  // Reset activity on any interaction
  const handleActivity = () => {
    // We can still keep activityRef updated for other potential features
    activityRef.current = Date.now();
    if (isSaverActive) setIsSaverActive(false);
  };

  const currentStop = currentRoute.stops[currentStopIndex];
  const nextStop = currentRoute.stops[currentStopIndex + 1] || null;

  const scheduledDeparture = useMemo(() => {
    if (!tripStartTime) return "00:00:00";
    const date = new Date(tripStartTime.getTime() + currentStop.minutesFromStart * 60000);
    return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, [tripStartTime, currentStop]);

  const handleStartTrip = () => {
    const [hours, minutes] = manualStartTime.split(':').map(Number);
    const start = new Date();
    start.setHours(hours, minutes, 0, 0);
    setTripStartTime(start);
    setDeviation(0);
    handleActivity();
    
    // START OF TRIP ANNOUNCEMENT:
    // 1. Announce the first stop where we are currently starting
    playAnnouncement(currentRoute.stops[0].name, true); 
    
    // 2. Announce detour info if it's a diversion route
    if (currentRoute.name.includes("Výluka") || currentRoute.id.includes("VYL")) {
      const isDetourC = currentRoute.id === "120C1_VYL" || currentRoute.id === "120C2_VYL";
      if (isDetourC) {
        const isForward = currentRoute.stops[0]?.name.toLowerCase().includes("sídliště");
        if (!isForward) {
          // Play the long announcement at the start of the reversed trip
          const text = "Vážení cestující, od dvacátého července dva tisíce dvacet šest do prvního prosince dva tisíce dvacet šest platí mimořádná výluka na linkách sto dvacet lomeno cé jedna a sto dvacet lomeno cé dva. Z důvodu uzavírky Kostelní ulice a fary jedou spoje po odklonové trase přes zastávky: u Garáží, na mostě, u nádraží, u mostu, Halda pod mostem, Halda u mostu, Halda za mostem, na Haldě a Kounice u hřiště. Tyto linky zcela vynechávají zastávky: u školního hřiště, Nádražní škola, staré náměstí, Točná u kostela, Točná v Kostelní ulici, v zatáčce, Točná u fary, u Hřbitova a Kounice internát. Náhradní přepravu v neobsluhovaném úseku mezi zastávkami Horní Slavkov staré náměstí a Horní Slavkov Kounice zajišťuje kyvadlová linka sto dvacet lomeno á bé iks. Upozorňujeme také, že běžné linky sto dvacet lomeno á a sto dvacet lomeno bé jsou po dobu výluky v pracovních dnech zrušeny. Děkujeme za pochopení.";
          playAnnouncement(text, false);
        } else {
          // Play a simple note that this route contains a detour later
          playAnnouncement("Upozornění pro cestující. Z důvodu výluky jede tento spoj po odklonové trase.", false);
        }
      } else {
        const lineNo = currentRoute.number.replace('/', ' lomeno ');
        let detourStops = '';
        if (currentRoute.id === '120A_VYL') {
          detourStops = 'Horní Slavkov u přejezdu, Horní Slavkov Kounice náhradní a Horní Slavkov u Hřiště Kounice';
        } else if (currentRoute.id === '120B_VYL') {
          detourStops = 'Horní Slavkov u přejezdu, Horní Slavkov Kounice náhradní a Horní Slavkov u Hřiště';
        } else {
          detourStops = currentRoute.stops.slice(-3).map(s => s.name.replace('(Náhradní)', 'náhradní')).join(', ');
        }
        const detourText = `Upozornění pro cestující. Z důvodu výluky je linka ${lineNo} od prvního března 2026 do prvního září 2026 odkloněna přes zastávky ${detourStops}.`;
        playAnnouncement(detourText, false);
      }
    }
    
    // 3. Announce the next stop
    if (currentRoute.stops[1]) {
      const isNextLast = currentRoute.stops.length === 2;
      let nextText = `Příští zastávka: ${currentRoute.stops[1].name}`;
      if (currentRoute.stops[1].isOnDemand) {
        nextText += `. Příští zastávka je na znamení.`;
      }
      if (isNextLast) {
        nextText += `. Konečná zastávka. Prosíme, všichni cestující vystupte.`;
      }
      playAnnouncement(nextText, true);
    }
    
    // At the start of the trip, we are departing the first stop (0) towards the second (1)
    setCurrentStopIndex(1);
    setIsDriving(true);
  };

  // Available destinations
  const availableDestinations = useMemo(() => {
    return currentRoute.stops.slice(currentStopIndex + 1);
  }, [currentRoute, currentStopIndex]);

  // Reset destination when route or stop changes
  useEffect(() => {
    if (currentStopIndex >= selectedDestinationIndex || selectedDestinationIndex >= currentRoute.stops.length) {
      setSelectedDestinationIndex(Math.min(currentStopIndex + 1, currentRoute.stops.length - 1));
    }
  }, [currentRoute, currentStopIndex, selectedDestinationIndex]);

  // Synchronize editing variables when opening the Edit JŘ dialog
  useEffect(() => {
    if (isEditJrOpen) {
      setEditingStops(JSON.parse(JSON.stringify(currentRoute.stops)));
      setEditingRouteName(currentRoute.name);
      setEditingRouteNumber(currentRoute.number);
    }
  }, [isEditJrOpen, currentRoute]);

  const destinationStop = currentRoute.stops[selectedDestinationIndex] || currentStop;

  const calculatePrice = (from: Stop, to: Stop, type: TicketType) => {
    const zones = Math.abs(to.zone - from.zone);
    const rawPrice = BASE_PRICE + (zones * PRICE_PER_ZONE);
    return Math.round(rawPrice * type.multiplier);
  };

  const getComputedDepartureTime = (minutesOffset: number) => {
    const [hours, minutes] = manualStartTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    const computedDate = new Date(date.getTime() + minutesOffset * 60000);
    return computedDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
  };

  const handleAddStop = () => {
    const lastStop = editingStops[editingStops.length - 1];
    const newStop: Stop = {
      id: `custom_stop_${Date.now()}`,
      name: lastStop ? lastStop.name + " (Kopírováno)" : "Nová Zastávka",
      zone: lastStop ? lastStop.zone : 1,
      kmFromStart: lastStop ? parseFloat((lastStop.kmFromStart + 1.2).toFixed(1)) : 0.0,
      minutesFromStart: lastStop ? lastStop.minutesFromStart + 3 : 0,
      isOnDemand: false
    };
    setEditingStops([...editingStops, newStop]);
  };

  const handleRemoveStop = (index: number) => {
    if (editingStops.length <= 1) return;
    setEditingStops(editingStops.filter((_, i) => i !== index));
  };

  const handleSaveJr = () => {
    setRoutes(prev => prev.map(r => r.id === currentRoute.id ? { 
      ...r, 
      name: editingRouteName,
      number: editingRouteNumber,
      stops: editingStops 
    } : r));
    
    setCurrentRoute(prev => ({
      ...prev,
      name: editingRouteName,
      number: editingRouteNumber,
      stops: editingStops
    }));
    
    // Adjust index if out of bounds (such as when stops list got truncated)
    if (currentStopIndex >= editingStops.length) {
      setCurrentStopIndex(Math.max(0, editingStops.length - 1));
    }
    if (selectedDestinationIndex >= editingStops.length) {
      setSelectedDestinationIndex(Math.max(0, editingStops.length - 1));
    }
    
    setIsEditJrOpen(false);
  };

  const addToCart = (type: TicketType) => {
    setCart(prev => {
      const existing = prev.find(item => item.type.id === type.id);
      if (existing) {
        return prev.map(item => item.type.id === type.id ? { ...item, count: item.count + 1 } : item);
      }
      return [...prev, { type, count: 1 }];
    });
    handleActivity();
  };

  const removeFromCart = (typeId: string) => {
    setCart(prev => prev.filter(item => item.type.id !== typeId));
    handleActivity();
  };

  const stornoTicket = (id: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, storno: true } : t));
    handleActivity();
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      return total + (calculatePrice(currentStop, destinationStop, item.type) * item.count);
    }, 0);
  }, [cart, currentStop, destinationStop]);

  const currentPrice = calculatePrice(currentStop, destinationStop, selectedTicketType);

  const playGong = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playTone = (freq: number, startTime: number, duration: number) => {
        // Multi-harmonic synthesis for an incredibly rich, metallic chime (like real public transport speakers!)
        const harmonics = [1, 1.2, 1.5, 2.0];
        const harmonicGains = [0.15, 0.05, 0.03, 0.02];
        const harmonicTypes: OscillatorType[] = ['sine', 'triangle', 'sine', 'sine'];

        harmonics.forEach((h, idx) => {
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          osc.type = harmonicTypes[idx];
          osc.frequency.setValueAtTime(freq * h, startTime);
          
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(harmonicGains[idx], startTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          
          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          osc.start(startTime);
          osc.stop(startTime + duration);
        });
      };

      // PMDP style: Two tones (F5, C5) - sounds extremely professional and deep
      playTone(698.46, audioCtx.currentTime, 0.7); // F5
      playTone(523.25, audioCtx.currentTime + 0.35, 0.8); // C5

      return 1300; // wait longer for rich tones
    } catch (e) {
      console.error("AudioContext not supported", e);
      return 0;
    }
  };

  const playPaymentBeep = (success: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (success) {
        // Double sweet high pitched beep
        const playSweetBeep = (time: number) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.frequency.setValueAtTime(1400, time);
          gain.gain.setValueAtTime(0.08, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(time);
          osc.stop(time + 0.1);
        };
        playSweetBeep(audioCtx.currentTime);
        playSweetBeep(audioCtx.currentTime + 0.15);
      } else {
        // Lower dramatic error double-buzz tone
        const playBuzz = (time: number) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(120, time);
          gain.gain.setValueAtTime(0.12, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(time);
          osc.stop(time + 0.35);
        };
        playBuzz(audioCtx.currentTime);
        playBuzz(audioCtx.currentTime + 0.2);
      }
    } catch (e) {
      console.error("Audio beep failed:", e);
    }
  };

  const speakNext = () => {
    if (speechQueueRef.current.length === 0) {
      isSpeakingRef.current = false;
      setTimeout(() => setCurrentAnnouncement(null), 3000);
      return;
    }
    
    isSpeakingRef.current = true;
    const nextItem = speechQueueRef.current.shift()!;
    setCurrentAnnouncement(nextItem.text);
    
    const speakAction = () => {
      const utterance = new SpeechSynthesisUtterance(nextItem.text);
      utterance.lang = 'cs-CZ';
      utterance.volume = busStats.volume / 100;
      
      const isMale = selectedVoiceType === 'male';
      utterance.rate = isMale ? 0.90 : 0.88;
      utterance.pitch = isMale ? 0.98 : 1.02;
      
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const voicesList = window.speechSynthesis.getVoices();
        let selectedVoice = null;
        
        if (isMale) {
          selectedVoice = voicesList.find(v => {
            const l = v.lang.replace('_', '-').toLowerCase();
            return l === 'cs-cz' && (
              v.name.includes('Antonin') || 
              v.name.includes('Filip') || 
              v.name.includes('Jakub') || 
              v.name.includes('Jan') || 
              v.name.includes('Male')
            );
          });
        } else {
          selectedVoice = voicesList.find(v => {
            const l = v.lang.replace('_', '-').toLowerCase();
            return l === 'cs-cz' && (
              v.name.includes('Zuzana') || 
              v.name.includes('Iveta') || 
              v.name.includes('Natural') || 
              v.name.includes('Premium') ||
              v.name.includes('Google') ||
              v.name.includes('Microsoft')
            );
          });
        }
        
        if (!selectedVoice) {
          selectedVoice = voicesList.find(v => v.lang.replace('_', '-').toLowerCase() === 'cs-cz');
        }
        if (!selectedVoice) {
          selectedVoice = voicesList.find(v => v.lang.toLowerCase().startsWith('cs'));
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
      
      utterance.onend = () => {
        setTimeout(() => {
          speakNext();
        }, 500);
      };
      
      utterance.onerror = () => {
        speakNext();
      };
      
      window.speechSynthesis.speak(utterance);
    };

    if (nextItem.withGong && isGongEnabled) {
      const wait = playGong();
      setTimeout(() => {
        speakAction();
      }, wait);
    } else {
      speakAction();
    }
  };

  const playAnnouncement = (text: string, withGong = true, interrupt = false) => {
    if (!window.speechSynthesis) return;
    
    if (interrupt) {
      window.speechSynthesis.cancel();
      speechQueueRef.current = [{ text, withGong }];
      isSpeakingRef.current = false;
    } else {
      speechQueueRef.current.push({ text, withGong });
    }
    
    if (!isSpeakingRef.current) {
      isSpeakingRef.current = true;
      speakNext();
    }
  };

  const checkForDetourAnnouncement = (route: any, stopIndex: number) => {
    const isDetourC = route.id === "120C1_VYL" || route.id === "120C2_VYL";
    if (isDetourC) {
      const isForward = route.stops[0]?.name.toLowerCase().includes("sídliště");
      if ((isForward && stopIndex === 2) || (!isForward && stopIndex === 0)) {
        const text = "Vážení cestující, od dvacátého července dva tisíce dvacet šest do prvního prosince dva tisíce dvacet šest platí mimořádná výluka na linkách sto dvacet lomeno cé jedna a sto dvacet lomeno cé dva. Z důvodu uzavírky Kostelní ulice a fary jedou spoje po odklonové trase přes zastávky: u Garáží, na mostě, u nádraží, u mostu, Halda pod mostem, Halda u mostu, Halda za mostem, na Haldě a Kounice u hřiště. Tyto linky zcela vynechávají zastávky: u školního hřiště, Nádražní škola, staré náměstí, Točná u kostela, Točná v Kostelní ulici, v zatáčce, Točná u fary, u Hřbitova a Kounice internát. Náhradní přepravu v neobsluhovaném úseku mezi zastávkami Horní Slavkov staré náměstí a Horní Slavkov Kounice zajišťuje kyvadlová linka sto dvacet lomeno á bé iks. Upozorňujeme také, že běžné linky sto dvacet lomeno á a sto dvacet lomeno bé jsou po dobu výluky v pracovních dnech zrušeny. Děkujeme za pochopení.";
        playAnnouncement(text, false);
      }
    }
  };

  const handleAnnounceStop = () => {
    if (nextStop) {
      const isNextStopLast = (currentStopIndex + 1) === (currentRoute.stops.length - 1);
      let text = `Příští zastávka: ${nextStop.name}`;
      if (nextStop.isOnDemand) {
        text += `. Příští zastávka je na znamení.`;
      }
      if (isNextStopLast) {
        text += `. Konečná zastávka. Prosíme, všichni cestující vystupte.`;
      }
      playAnnouncement(text);
    } else {
      playAnnouncement("Příští zastávka: Konečná zastávka. Prosíme vystupte.");
    }
    handleActivity();
  };

  const handleAnnounceCurrentStop = () => {
    let text = currentStop.name;
    const isCurrentLast = currentStopIndex === (currentRoute.stops.length - 1);
    if (isCurrentLast) {
      text += `. Konečná zastávka, prosíme vystupte.`;
    }
    playAnnouncement(text);
    handleActivity();
  };

  const handleReverseRoute = () => {
    const originalStops = [...currentRoute.stops];
    const totalKm = originalStops[originalStops.length - 1].kmFromStart;
    const totalMin = originalStops[originalStops.length - 1].minutesFromStart;

    const reversedStops = [...originalStops].reverse().map((stop) => {
      return {
        ...stop,
        kmFromStart: Math.round((totalKm - stop.kmFromStart) * 10) / 10,
        minutesFromStart: totalMin - stop.minutesFromStart
      };
    });

    const isAlreadyReversed = currentRoute.name.includes("(Zpět)");
    const newName = isAlreadyReversed 
      ? currentRoute.name.replace(" (Zpět)", "") 
      : `${currentRoute.name} (Zpět)`;

    setCurrentRoute({
      ...currentRoute,
      id: `${currentRoute.id}_${isAlreadyReversed ? 'fwd' : 'rev'}_${Date.now()}`,
      name: newName,
      stops: reversedStops
    });
    setCurrentStopIndex(0);
    handleActivity();
    
    // Announcement for direction change
    playAnnouncement(`Změna směru jízdy. Linka ${currentRoute.number}, směr ${reversedStops[reversedStops.length - 1].name}.`);
  };

  const handleLogin = () => {
    const driver = DRIVERS.find(d => d.pin === pin);
    if (driver) {
      setCurrentDriver(driver);
      setIsLoggedIn(true);
      setPin('');
      handleActivity();
    } else {
      alert('Nesprávný PIN');
      setPin('');
    }
  };

  const handleReset = () => {
    setIsLoggedIn(false);
    setCurrentDriver(null);
    setPin('');
    setCurrentRoute(routes[0]);
    setCurrentStopIndex(0);
    setSelectedDestinationIndex(1);
    setTransactions([]);
    setCart([]);
    setPassengerCount(0);
    setTotalBoarded(0);
    setPassengersByStop({});
    setSystemError(null);
    setTripStartTime(null);
    setServiceDestination(null);
    setMessages([]);
    setStopRequest(false);
    setHvac({
      driverTemp: 18,
      passengerTemp: 18,
      targetPassengerTemp: 22,
      targetDriverTemp: 22,
      fanSpeed: 2,
      auto: true,
      ac: false,
      webasto: false,
      frontDefrost: false,
      rearHeating: true,
      floorHeating: false,
      externalTemp: 5,
      mode: 'auto',
      fanMode: 'face',
      heatingIntensity: 0,
      coolingIntensity: 0
    });
    setBusStats({
      fuel: 65,
      mileage: 124580,
      volume: 50,
      interiorLights: false
    });
    setActiveTab("home");
    setIsSaverActive(false);
    handleActivity();
  };

  const handleSellTicket = () => {
    if (cart.length === 0 || systemError || isPrinting || isCriticalError) return;
    handleActivity();
    setIsPrinting(true);
    setPaymentProgress(0);
    setPaymentProgressState('processing_payment');

    const ticketsCount = cart.reduce((acc, item) => acc + item.count, 0);
    const method = paymentMethod;

    if (method === 'cash') {
      // CASH FLOW (Approx 2 seconds total)
      setPaymentStatusText("HOTOVOST: PŘIJÍMÁNÍ MINCÍ A BANKOVEK...");
      setPaymentProgress(10);
      
      // Simulate progress
      const pInterval = setInterval(() => {
        setPaymentProgress(p => Math.min(60, p + 15));
      }, 250);

      setTimeout(() => {
        clearInterval(pInterval);
        setPaymentProgress(60);
        setPaymentProgressState('printing_ticket');
        setPaymentStatusText("TISK JÍZDENKY...");
        
        const printInterval = setInterval(() => {
          setPaymentProgress(p => Math.min(100, p + 10));
        }, 120);

        setTimeout(() => {
          clearInterval(printInterval);
          // Actually create transactions
          executeFinalTicketSale(ticketsCount);
        }, 1200);

      }, 1000);

    } else {
      // CARD or MOBILE OR QR FLOW (Longer and more realistic with failures)
      const isMobile = method === 'mobile';
      setPaymentStatusText(isMobile ? "ČEKÁNÍ NA PŘILOŽENÍ TELEFONU..." : "ČEKÁNÍ NA PŘILOŽENÍ KARTY...");
      setPaymentProgress(5);

      const pInterval = setInterval(() => {
        setPaymentProgress(p => Math.min(40, p + 5));
      }, 200);

      setTimeout(() => {
        clearInterval(pInterval);
        
        // Simulating Card Tap Sound
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.frequency.setValueAtTime(2000, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.05);
        } catch(e){}

        // Randomly decide failure type
        const rand = Math.random();
        
        if (rand < 0.04) {
          // 1. CRITICAL POS ERROR (Needs reboot!)
          playPaymentBeep(false);
          setIsCriticalError(true);
          const posErrors = [
            "KRITICKÁ CHYBA POKLADNY #E412 (Zaseknutý papír v tiskové hlavě)",
            "KRITICKÁ CHYBA FISKÁLNÍ JEDNOTKY #E503 (Chyba komunikace s šifrovacím čipem)",
            "CHYBA SOFTWARE KO-POS v5 (Nedostatek systémové paměti RAM)",
            "PORUCHA hardware TERM-NET #E201 (Přehřátí tiskového procesoru)"
          ];
          setCriticalErrorMessage(posErrors[Math.floor(Math.random() * posErrors.length)]);
          setIsPrinting(false);
          setPaymentProgressState('idle');
          setCart([]); // Clear cart as crash occurred
        } else if (rand < 0.18) {
          // 2. TEMPORARY BANK DECLINE
          setPaymentStatusText("AUTORIZACE PLATBY (Spojení s bankou...)");
          setPaymentProgress(60);
          
          setTimeout(() => {
            playPaymentBeep(false);
            setPaymentProgressState('payment_error');
            const bankDeclineReasons = [
              "KARTA ODMÍTNUTA - NEDOSTATEČNÝ ZŮSTATEK",
              "NEÚSPĚCH - NESPRÁVNÝ PIN KARTY",
              "CHYBA SPOJENÍ - ČASOVÝ LIMIT TERMINÁLU VYPRŠEL",
              "LIMIT TRANSAKCÍ NA KARTĚ PŘEKROČEN"
            ];
            setPaymentStatusText(bankDeclineReasons[Math.floor(Math.random() * bankDeclineReasons.length)]);
            setPaymentProgress(100);
          }, 1500);
        } else {
          // 3. SUCCESS CARD PAYMENT
          setPaymentStatusText("AUTORIZACE PLATBY (Spojení s bankou...)");
          setPaymentProgress(65);

          const authorizeInterval = setInterval(() => {
            setPaymentProgress(p => Math.min(85, p + 5));
          }, 300);

          setTimeout(() => {
            clearInterval(authorizeInterval);
            setPaymentProgress(90);
            setPaymentStatusText("PLATBA SCHVÁLENA!");
            playPaymentBeep(true);

            setTimeout(() => {
              setPaymentProgressState('printing_ticket');
              setPaymentStatusText("TISK JÍZDENKY...");
              
              const printInterval = setInterval(() => {
                setPaymentProgress(p => Math.min(100, p + 5));
              }, 100);

              setTimeout(() => {
                clearInterval(printInterval);
                executeFinalTicketSale(ticketsCount);
              }, 1100);
            }, 800);

          }, 1600);
        }

      }, 1500);
    }
  };

  const executeFinalTicketSale = (ticketsCount: number) => {
    try {
      const newTransactions: Transaction[] = cart.map((item, index) => ({
        id: Math.random().toString(36).substring(2, 11) + index,
        timestamp: new Date(),
        fromStop: currentStop.name,
        toStop: destinationStop.name,
        ticketType: `${item.count}x ${item.type.name}`,
        price: calculatePrice(currentStop, destinationStop, item.type) * item.count,
      }));

      // Update statistics
      setPassengerCount(prev => prev + ticketsCount);
      setTotalBoarded(prev => prev + ticketsCount);
      
      const destStopId = currentRoute.stops[selectedDestinationIndex]?.id;
      if (destStopId) {
        setPassengersByStop(prev => ({
          ...prev,
          [destStopId]: (prev[destStopId] || 0) + ticketsCount
        }));
      }

      setTransactions(prev => [...newTransactions, ...prev].slice(0, 300));
      setCart([]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    } catch (err) {
      console.error("Critical Ticket sale failed:", err);
    } finally {
      setIsPrinting(false);
      setPaymentProgressState('idle');
    }
  };

  const handleRebootCashRegister = () => {
    handleActivity();
    setRebootingState({
      step: 0,
      log: ["[ INFO ] Inicializace horkého restartu terminálu...", "[ CORE ] Zastavování všech běžících subsystémů..."],
      progress: 5
    });

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch(e){}

    const logs = [
      "[ OK ] Vypínání grafického serveru PosApp X11 [PID: 2049]",
      "[ OK ] Uvolnění sdílené paměti CAN-BUS rozhraní",
      "[ OK ] Restartování čtečky karet a platebního terminálu TERM-B",
      "[ OK ] Odpojení tiskového driveru Host-Direct USB",
      "[ OK ] BIOS Telmax Bootloader OIB v5.0.42 (BUILD 9811)",
      "[ OK ] Kontrola operační paměti RAM 1024KB... OK",
      "[ OK ] Detekce vnitřního úložiště SPI-Flash 256MB... OK",
      "[ OK ] Připojování systémové sběrnice Iveco CAN-BUS... OK",
      "[ OK ] Načítání souborového systému /dev/sda1... OK",
      "[ OK ] Spouštění zabezpečeného jádra tiskárny (FiscSecureOS)... OK",
      "[ OK ] Spojení se satelity GNSS (GPS/Glonass) navázáno [5/5 SB]",
      "[ OK ] Spuštěno prostředí řidiče Telmax OIB v5.0.42_IVC_XWAY",
      "[ OK ] Systém připraven k prodeji jízdenek."
    ];

    let currentLogIndex = 0;
    const logInterval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setRebootingState(prev => {
          if (!prev) return null;
          return {
            step: prev.step + 1,
            log: [...prev.log, logs[currentLogIndex]],
            progress: Math.min(100, Math.floor((currentLogIndex / logs.length) * 100) + 10)
          };
        });
        currentLogIndex++;
      } else {
        clearInterval(logInterval);
        setRebootingState(null);
        setIsCriticalError(false);
        setCriticalErrorMessage(null);
        setSystemError(null); // Clear normal system errors on reboot!
        
        // Happy startup chime
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const playShortChime = (freq: number, time: number) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(0.08, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(time);
            osc.stop(time + 0.15);
          };
          playShortChime(880, audioCtx.currentTime);
          playShortChime(1100, audioCtx.currentTime + 0.12);
          playShortChime(1320, audioCtx.currentTime + 0.24);
        } catch(e){}
      }
    }, 300);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDeviation = (seconds: number) => {
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    const sign = seconds >= 0 ? "+" : "-";
    return `${sign}${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable full-screen mode: ${e.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center p-4 font-sans focus:outline-none">
        <Card className="w-full max-w-md bg-[#222] border-[#333] p-8 flex flex-col gap-6 shadow-2xl">
          <div className="text-center">
            <div className="bg-[#ffcc00] text-[#003366] font-black px-4 py-2 rounded-sm text-3xl italic inline-block mb-4">
              TELMAX
            </div>
            <h1 className="text-white text-xl font-bold uppercase tracking-widest">Přihlášení řidiče</h1>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="bg-[#111] p-4 rounded-lg border border-[#444] text-center">
              <span className="text-4xl font-mono text-[#ffcc00] tracking-[1rem]">
                {pin.padEnd(4, '•')}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK'].map((key) => (
                <Button
                  key={key}
                  variant="outline"
                  className={cn(
                    "h-16 text-2xl font-bold border-2",
                    key === 'OK' ? "bg-[#00aa00] border-[#008800] text-white" : "bg-[#333] border-[#444] text-white",
                    key === 'C' && "bg-[#aa0000] border-[#880000]"
                  )}
                  onClick={() => {
                    if (key === 'OK') handleLogin();
                    else if (key === 'C') setPin('');
                    else if (pin.length < 4) setPin(prev => prev + key);
                  }}
                >
                  {key}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Screen Saver
  if (isSaverActive) {
    return (
      <div 
        className={cn(
          "fixed inset-0 z-[200] flex flex-col items-center justify-between py-12 px-6 transition-colors duration-700 cursor-pointer select-none overflow-hidden touch-none",
          isDarkMode 
            ? "bg-black bg-radial-[at_50%_50%,_var(--tw-gradient-stops)] from-zinc-900 to-black" 
            : "bg-slate-50 bg-radial-[at_50%_50%,_var(--tw-gradient-stops)] from-white to-slate-200"
        )}
        onClick={() => setIsSaverActive(false)}
      >
        {/* Top Status Info */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full max-w-5xl justify-center z-10 px-4">
          <div className={cn(
            "px-4 py-2 rounded-xl border flex flex-col items-center min-w-[100px] shadow-lg backdrop-blur-md",
            isDarkMode ? "bg-black/40 border-white/10" : "bg-white/60 border-slate-200"
          )}>
            <span className={cn(
              "text-[8px] font-black uppercase tracking-[0.3em] mb-0.5",
              isDarkMode ? "text-white/40" : "text-slate-400"
            )}>Nástup</span>
            <span className={cn(
              "text-xl font-mono font-black",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>{scheduledDeparture}</span>
          </div>
          
          <div className={cn(
            "px-4 py-2 rounded-xl border flex flex-col items-center min-w-[100px] shadow-lg backdrop-blur-md",
            isDarkMode ? "bg-black/40 border-white/10" : "bg-white/60 border-slate-200"
          )}>
            <span className={cn(
              "text-[8px] font-black uppercase tracking-[0.3em] mb-0.5",
              isDarkMode ? "text-white/40" : "text-slate-400"
            )}>Zpoždění</span>
            <span className={cn(
              "text-xl font-mono font-black",
              deviation >= 0 ? "text-orange-500" : "text-green-500"
            )}>
              {formatDeviation(deviation)}
            </span>
          </div>

          <div className={cn(
            "px-4 py-2 rounded-xl border flex flex-col items-center min-w-[100px] shadow-lg backdrop-blur-md",
            isDarkMode ? "bg-black/40 border-white/10" : "bg-white/60 border-slate-200"
          )}>
            <span className={cn(
              "text-[8px] font-black uppercase tracking-[0.3em] mb-0.5",
              isDarkMode ? "text-white/40" : "text-slate-400"
            )}>Ve voze</span>
            <div className="flex items-center gap-1">
              <Users size={12} className={isDarkMode ? "text-white/60" : "text-slate-400"} />
              <span className={cn(
                "text-xl font-mono font-black",
                isDarkMode ? "text-white" : "text-slate-900"
              )}>{passengerCount}</span>
            </div>
          </div>

          <div className={cn(
            "px-4 py-2 rounded-xl border flex flex-col items-center min-w-[100px] shadow-lg backdrop-blur-md",
            isDarkMode ? "bg-black/40 border-white/10" : "bg-white/60 border-slate-200"
          )}>
            <span className={cn(
              "text-[8px] font-black uppercase tracking-[0.3em] mb-0.5",
              isDarkMode ? "text-white/40" : "text-slate-400"
            )}>{isDriving ? "Právě odjeto" : "Aktuální"}</span>
            <span className={cn(
              "text-lg font-black tracking-tight line-clamp-1",
              isDarkMode ? "text-white/60" : "text-slate-500"
            )}>
              {(isDriving && currentStopIndex > 0) 
                ? currentRoute.stops[currentStopIndex - 1].name.replace('Horní Slavkov ', '') 
                : currentStop.name.replace('Horní Slavkov ', '')}
            </span>
          </div>

          {currentStop && (
            <div className={cn(
              "px-4 py-2 rounded-xl border flex flex-col items-center min-w-[100px] shadow-lg backdrop-blur-md",
              isDarkMode ? "bg-black/40 border-white/10" : "bg-white/60 border-slate-200"
            )}>
              <span className={cn(
                "text-[8px] font-black uppercase tracking-[0.3em] mb-0.5",
                isDarkMode ? "text-white/40" : "text-slate-400"
              )}>Výstup</span>
              <div className="flex items-center gap-1">
                <UserMinus size={12} className="text-red-500" />
                <span className={cn(
                  "text-xl font-mono font-black",
                  isDarkMode ? "text-white" : "text-slate-900"
                )}>{passengersByStop[currentStop.id] || 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* Giant Clock Centerpiece */}
        <div className="flex flex-col items-center gap-4 z-10 w-full max-w-3xl px-4">
          <div className={cn(
            "w-full px-6 py-6 rounded-3xl border-4 shadow-xl transition-all duration-700 flex flex-col items-center",
            isDarkMode 
              ? "bg-black/60 border-[#ffcc00]/20 shadow-[#ffcc00]/5" 
              : "bg-white/80 border-[#004a99]/20 shadow-[#004a99]/10"
          )}>
            <span className={cn(
              "text-xs uppercase font-black tracking-[0.6em] mb-4 block text-center animate-pulse",
              isDarkMode ? "text-[#ffcc00] opacity-80" : "text-[#004a99] opacity-70"
            )}>AKTUÁLNÍ ČAS</span>
            
            <div className={cn(
              "text-7xl sm:text-8xl md:text-9xl font-mono font-bold tracking-tighter tabular-nums flex items-baseline justify-center leading-none drop-shadow-2xl transition-colors duration-700",
              isDarkMode ? "text-white" : "text-[#004a99]"
            )}>
              {currentTime.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
              <span className={cn(
                "text-2xl sm:text-4xl ml-2 opacity-30",
                isDarkMode ? "text-white" : "text-slate-400"
              )}>
                {currentTime.toLocaleTimeString('cs-CZ', { second: '2-digit' })}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <div className={cn(
              "text-[10px] font-black uppercase tracking-[0.3em] opacity-50",
              isDarkMode ? "text-white" : "text-slate-500"
            )}>
              {isDriving ? (currentStopIndex === currentRoute.stops.length - 1 ? "Konečná zastávka" : "Příští zastávka") : "Tato zastávka"}
            </div>
            <div className={cn(
              "text-2xl sm:text-4xl font-black uppercase text-center",
              isDarkMode ? "text-white" : "text-[#004a99]"
            )}>
              {currentStop.name}
            </div>
            <div className={cn(
              "text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] opacity-40 mt-1",
              isDarkMode ? "text-white" : "text-slate-500"
            )}>
              {serviceDestination ? "SLUŽEBNÍ JÍZDA" : `Linka ${currentRoute.number} • Směr ${destinationStop.name}`}
            </div>
          </div>
        </div>

        {/* Bottom Interaction Guide */}
        <motion.div 
          animate={{ 
            opacity: [0.4, 0.8, 0.4],
            y: [0, -3, 0] 
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 z-10"
        >
           <div className={cn(
             "h-1 w-16 rounded-full",
             isDarkMode ? "bg-[#ffcc00]/30" : "bg-[#004a99]/20"
           )} />
           <span className={cn(
             "text-[10px] font-black uppercase tracking-[0.4em]",
             isDarkMode ? "text-[#ffcc00]/60" : "text-[#004a99]/60"
           )}>
             Dotykem pokračujte
           </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "min-h-screen h-[100dvh] flex flex-col transition-colors duration-500 overflow-hidden",
        isDarkMode ? "bg-[#1a1a1a] text-white" : "bg-[#f0f0f0] text-black"
      )}
      onMouseMove={handleActivity}
      onClick={handleActivity}
    >
      {/* Top Status Bar */}
      <header className={cn(
        "h-7 px-2 flex items-center justify-between border-b shadow-md z-10 relative transition-colors",
        isDarkMode ? "bg-[#004a99] border-[#005bb3]" : "bg-slate-100 border-slate-300"
      )}>
        <AnimatePresence>
          {currentAnnouncement && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="absolute inset-0 bg-[#ffcc00] flex items-center justify-center z-20"
            >
              <div className="flex items-center gap-4 text-[#003366]">
                <Megaphone className="animate-bounce" size={24} />
                <span className="text-xl font-black uppercase tracking-tighter italic">{currentAnnouncement}</span>
                <Megaphone className="animate-bounce scale-x-[-1]" size={24} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-3">
          <div className="bg-[#ffcc00] text-[#003366] font-black px-2 py-0.5 rounded-sm text-lg italic shadow-md shrink-0">
            TELMAX
          </div>
          <div className={cn(
            "flex flex-col min-w-0 pr-4",
            isDarkMode ? "text-white" : "text-slate-900"
          )}>
            <span className="text-[8px] opacity-60 uppercase font-black leading-none truncate">
              {currentRoute.number} • {currentRoute.name}
            </span>
            <span className={cn(
              "text-base font-black leading-none truncate",
              isDarkMode ? "text-[#ffcc00]" : "text-[#004a99]"
            )}>
              {currentStop.name}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 lg:gap-6 shrink-0">
          <div 
            className={cn(
              "flex flex-col items-center px-3 py-1 rounded-sm border shadow-inner shrink-0 cursor-pointer transition-colors",
              isDarkMode ? "bg-black/40 border-white/10 hover:bg-black/60 text-white" : "bg-white border-black/10 hover:bg-slate-50 text-slate-900"
            )}
            onClick={() => {
              setActiveTab("hvac");
              handleActivity();
            }}
            title="Nastavení klimatizace"
          >
            <span className={cn(
              "text-[8px] uppercase font-black tracking-widest mb-0.5",
              isDarkMode ? "text-[#ffcc00]" : "text-[#004a99]"
            )}>Klima salón</span>
            <div className="flex items-center gap-1 font-mono text-base font-black leading-none">
              {hvac.ac ? (
                <Snowflake size={12} className="text-cyan-400 animate-pulse" />
              ) : hvac.webasto ? (
                <Flame size={12} className="text-red-500 animate-pulse" />
              ) : (
                <Wind size={12} className="text-emerald-500" />
              )}
              <span>{hvac.passengerTemp.toFixed(1)}°C</span>
              <span className="text-[10px] opacity-40 font-normal">({hvac.targetPassengerTemp}°)</span>
            </div>
          </div>

          <div className={cn(
            "hidden md:flex flex-col items-center px-4 py-1 rounded-sm border shadow-inner shrink-0",
            isDarkMode ? "bg-black/40 border-white/10" : "bg-white border-black/10"
          )}>
            <span className={cn(
              "text-[8px] uppercase font-black tracking-widest mb-0.5",
              isDarkMode ? "text-[#ffcc00]" : "text-[#004a99]"
            )}>Odchylka</span>
            <div className={cn(
              "text-2xl font-mono font-black tabular-nums",
              deviation === 0 ? "text-green-500" : 
              deviation > 0 ? "text-red-500" : "text-blue-500"
            )}>
              {formatDeviation(deviation)}
            </div>
          </div>

          <div className={cn(
            "flex flex-col items-center shrink-0",
            isDarkMode ? "text-white" : "text-slate-900"
          )}>
             <span className="text-[8px] opacity-60 uppercase font-black leading-none mb-1">Čas</span>
             <span className={cn(
               "text-xl font-mono font-black leading-none",
               isDarkMode ? "text-[#ffcc00]" : "text-[#004a99]"
             )}>{currentTime.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSaverActive(true)}
              className={cn(
                "h-12 w-12 border-2 transition-all flex items-center justify-center shadow-lg",
                isDarkMode 
                  ? "text-[#ffcc00] border-[#ffcc00]/60 bg-[#003366] hover:bg-[#ffcc00] hover:text-[#003366]" 
                  : "text-red-500 border-red-500/40 bg-white hover:bg-red-500 hover:text-white"
              )}
              title="Vypnout obrazovku"
            >
              <Power size={24} strokeWidth={3} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsPhoneOpen(true)}
              className={cn(
                "h-12 w-12 border-2 transition-all flex items-center justify-center shadow-lg",
                isDarkMode 
                  ? "text-green-500 border-green-500/40 bg-[#004a99] hover:bg-green-500 hover:text-white" 
                  : "text-green-600 border-green-600/40 bg-white hover:bg-green-600 hover:text-white"
              )}
              title="Volat dispečink"
            >
              <Phone size={24} strokeWidth={3} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleFullscreen}
              className={cn(
                "h-12 w-12 border-2 transition-all flex items-center justify-center shadow-lg",
                isDarkMode 
                  ? "text-white border-white/40 bg-[#004a99] hover:bg-white hover:text-[#004a99]" 
                  : "text-blue-600 border-blue-600/40 bg-white hover:bg-blue-600 hover:text-white"
              )}
              title="Celá obrazovka"
            >
              {isFullscreen ? <Minimize size={24} strokeWidth={3} /> : <Maximize size={24} strokeWidth={3} />}
            </Button>
          </div>
        </div>
      </header>



        

                


      <main className="flex-1 flex flex-col lg:flex-row gap-0.5 p-0.5 overflow-hidden">
        {/* Left Column: Route Progress - Hidden on mobile, shown on desktop */}
        <div className={cn(
          "hidden lg:flex lg:w-1/4 flex-col shrink-0 transition-colors",
          isDarkMode ? "bg-[#001a33] border-r border-[#002b55]" : "bg-white border-r border-slate-200"
        )}>
          <div className="flex-1 flex flex-col min-h-0">
             {/* Current Station Large Display */}
             <div className={cn(
               "p-4 border-b",
               isDarkMode ? "bg-[#003366] border-white/10" : "bg-slate-100 border-slate-300"
             )}>
                <span className={cn("text-[10px] font-black uppercase tracking-widest mb-1 block", isDarkMode ? "text-[#ffcc00]" : "text-[#004a99]")}>Aktuální stanice</span>
                <div className="flex items-center justify-between">
                   <h2 className={cn(
                     "text-2xl font-black uppercase italic tracking-tighter truncate leading-tight",
                     isDarkMode ? "text-white" : "text-slate-900"
                   )}>
                     {currentStop.name}
                   </h2>
                   <Badge className={cn("font-black h-5 px-2 border-none", isDarkMode ? "bg-[#ffcc00] text-[#003366]" : "bg-[#003366] text-[#ffcc00]")}>Z {currentStop.zone}</Badge>
                </div>
             </div>

             {/* Passengers Stats */}
             <div className={cn(
               "p-4 border-b flex items-center justify-between transition-colors",
               isDarkMode ? "bg-black/40 border-white/10" : "bg-slate-50 border-slate-200"
             )}>
                <div className="flex items-center gap-3">
                   <User className={isDarkMode ? "text-[#ffcc00]" : "text-[#004a99]"} size={24} />
                   <div className="flex flex-col">
                      <span className={cn("text-[10px] font-black uppercase leading-none mb-1", isDarkMode ? "text-zinc-500" : "text-slate-550")}>Cestující ve voze</span>
                      <span className={cn(
                        "text-2xl font-black leading-none",
                        isDarkMode ? "text-white" : "text-slate-900"
                      )}>{passengerCount}</span>
                   </div>
                </div>
                {passengersByStop[currentStop.id] > 0 && (
                  <div className="bg-red-500/20 px-2 py-1 rounded border border-red-500/30 flex flex-col items-end">
                     <span className="text-[8px] font-black text-red-500 uppercase leading-none">Vystoupí</span>
                     <span className="text-sm font-black text-red-500">-{passengersByStop[currentStop.id]}</span>
                  </div>
                )}
             </div>

             {/* Next Stops List */}
             <div className="flex-1 overflow-y-auto p-1 space-y-0.5 scrollbar-thin">
                {currentRoute.stops.map((stop, idx) => (
                  <div 
                    key={stop.id} 
                    className={cn(
                      "p-3 rounded-sm flex items-center justify-between transition-colors",
                      idx === currentStopIndex 
                        ? (isDarkMode ? "bg-[#ffcc00]/20 border border-[#ffcc00]/40" : "bg-[#002b55]/10 border border-[#002b55]/30") 
                        : idx < currentStopIndex 
                          ? "opacity-35" 
                          : (isDarkMode ? "bg-black/20 border border-white/5" : "bg-slate-50 border border-slate-200")
                    )}
                  >
                    <div className="flex items-center gap-3">
                       <div className={cn(
                         "w-2 h-2 rounded-full",
                         idx === currentStopIndex ? "bg-[#ffcc00] animate-pulse shadow-[0_0_10px_#ffcc00]" : 
                         idx < currentStopIndex ? "bg-zinc-500" : "bg-blue-500"
                       )} />
                       <span className={cn(
                         "text-sm font-bold uppercase truncate max-w-[160px]",
                         idx === currentStopIndex 
                           ? (isDarkMode ? "text-[#ffcc00]" : "text-[#004a99]") 
                           : (isDarkMode ? "text-white" : "text-slate-800")
                       )}>
                         {stop.name}
                       </span>
                    </div>
                    {idx > currentStopIndex && (
                      <span className={cn("text-[10px] font-mono", isDarkMode ? "text-zinc-400" : "text-slate-500")}>+{stop.minutesFromStart - currentStop.minutesFromStart}m</span>
                    )}
                  </div>
                ))}
             </div>

              {/* Route Navigation Controls */}
              <div className="p-2 bg-[#002b55] border-t border-white/10 grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  className="h-14 font-black border-2 bg-black/40 border-white/10 text-white hover:bg-black/60 shadow-lg"
                  onClick={() => {
                    setCurrentStopIndex(prev => Math.max(0, prev - 1));
                    setIsDriving(false);
                    handleActivity();
                  }}
                  disabled={currentStopIndex === 0}
                >
                  ZPĚT
                </Button>
                <Button 
                  variant="outline" 
                  className="h-14 font-black border-2 bg-black/40 border-white/10 text-[#ffcc00] hover:bg-black/60 shadow-lg flex flex-col items-center justify-center gap-1"
                  onClick={handleAnnounceStop}
                  disabled={!nextStop}
                >
                  <Megaphone size={16} />
                  <span className="text-[10px]">HLÁSIT</span>
                </Button>
                <Button 
                  onClick={() => {
                    if (isDriving) {
                      // ARRIVAL LOGIC
                      // We stay at the SAME index, but set isDriving to false
                      const offCount = passengersByStop[currentStop.id] || 0;
                      setPassengerCount(prev => Math.max(0, prev - offCount));
                      // We do NOT clear passengersByStop here, so it remains visible while standing!
                      
                      setIsDriving(false); // We are now AT the stop
                    } else {
                      // DEPARTURE LOGIC
                      // We leave current stop and head to the NEXT
                      if (nextStop) {
                        playAnnouncement(currentStop.name, true); 
                        
                        // Clear the departed stop exit count as we leave it!
                        setPassengersByStop(prev => ({ ...prev, [currentStop.id]: 0 }));
                        
                        const isNextLast = (currentStopIndex + 1) === (currentRoute.stops.length - 1);
                        
                        if ((currentRoute.name.includes("Výluka") || currentRoute.id.includes("VYL")) && currentStopIndex === 0) {
                          const isDetourC = currentRoute.id === "120C1_VYL" || currentRoute.id === "120C2_VYL";
                          if (!isDetourC) {
                            const lineNo = currentRoute.number.replace('/', ' lomeno ');
                            let detourStops = '';
                            if (currentRoute.id === '120A_VYL') {
                              detourStops = 'Horní Slavkov u přejezdu, Horní Slavkov Kounice náhradní a Horní Slavkov u Hřiště Kounice';
                            } else if (currentRoute.id === '120B_VYL') {
                              detourStops = 'Horní Slavkov u přejezdu, Horní Slavkov Kounice náhradní a Horní Slavkov u Hřiště';
                            } else {
                              detourStops = currentRoute.stops.slice(-3).map(s => s.name.replace('(Náhradní)', 'náhradní')).join(', ');
                            }
                            const detourText = `Upozornění pro cestující. Z důvodu výluky je linka ${lineNo} od prvního března 2026 do prvního září 2026 odkloněna přes zastávky ${detourStops}.`;
                            playAnnouncement(detourText, false);
                          }
                        }
                        
                        checkForDetourAnnouncement(currentRoute, currentStopIndex);
                        
                        let nextText = `Příští zastávka: ${nextStop.name}`;
                        if (nextStop.isOnDemand) {
                          nextText += `. Příští zastávka je na znamení.`;
                        }
                        if (isNextLast) {
                          nextText += `. Konečná zastávka. Prosíme, všichni cestující vystupte.`;
                        }
                        playAnnouncement(nextText, true);
                        
                        setCurrentStopIndex(prev => prev + 1);
                        setIsDriving(true); // We are now driving to the next stop
                      }
                    }
                    setStopRequest(false);
                    handleActivity();
                  }}
                  disabled={!nextStop && !isDriving}
                  className={cn(
                    "h-14 font-black leading-none border-b-4 transition-all shadow-lg text-sm",
                    isDriving 
                      ? "bg-[#ffcc00] hover:bg-[#ffdd33] text-[#003366] border-[#ccaa00]" 
                      : (nextStop ? "bg-[#003366] hover:bg-[#004a99] text-white border-[#002b55]" : "bg-red-600 hover:bg-red-700 text-white border-red-800")
                  )}
                >
                  {isDriving ? "PŘÍJEZD" : (nextStop ? "ODJEZD" : "KONEC")}
                </Button>
             </div>
          </div>
        </div>

        {/* Right Column: Main Interface */}
        <div className={cn(
          "flex-1 flex flex-col gap-0.5 min-h-0 transition-colors",
          isDarkMode ? "bg-[#001a33]" : "bg-white"
        )}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
             <TabsList className={cn(
               "grid grid-cols-7 h-6 shrink-0 rounded-none p-0 gap-0 border-b",
               isDarkMode ? "bg-[#002b55] border-white/10" : "bg-slate-200 border-black/10"
             )}>
                {[
                  { value: 'home', label: 'Prodej' },
                  { value: 'route', label: 'Linka' },
                  { value: 'messages', label: 'Dispečink' },
                  { value: 'hvac', label: 'HVAC' },
                  { value: 'vehicle', label: 'Vůz' },
                  { value: 'settings', label: 'Systém' },
                  { value: 'history', label: 'Tržba' }
                ].map(tab => (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value} 
                    className={cn(
                      "rounded-none border-r font-black uppercase text-xs h-full transition-all",
                      isDarkMode 
                        ? "border-white/5 data-[state=active]:bg-[#004a99] data-[state=active]:text-[#ffcc00] text-white/60" 
                        : "border-black/5 data-[state=active]:bg-white data-[state=active]:text-[#004a99] text-black/60"
                    )}
                  >
                    {tab.label}
                    {tab.value === 'messages' && messages.some(m => !m.read) && (
                      <span className="ml-1 w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                    )}
                  </TabsTrigger>
                ))}
             </TabsList>

             <div className="flex-1 p-0.5 overflow-hidden min-h-0 flex flex-col">
               <TabsContent value="home" className="flex-1 flex flex-col gap-0 mt-0 pr-0.5 min-h-0 h-full pb-0 scrollbar-none">
                  {/* TOP CONTROL BAR (Departure/Arrival) */}
                  <div className="flex items-stretch gap-1 shrink-0 h-6 mb-0.5">
                    <div className={cn(
                      "flex-1 flex items-center justify-between px-2 py-0 rounded-sm border",
                      isDarkMode ? "bg-[#002b55] border-white/10" : "bg-[#002b55] border-slate-300 shadow-md"
                    )}>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-[6px] font-black text-[#ffcc00] uppercase tracking-wider leading-none">Cestující:</span>
                          <span className="text-lg font-black text-white leading-none">{passengerCount}</span>
                        </div>
                        <Button 
                          onClick={() => {
                            setCurrentStopIndex(prev => Math.max(0, prev - 1));
                            setIsDriving(false);
                            handleActivity();
                          }}
                          disabled={currentStopIndex === 0}
                          className="h-5 font-black px-3 rounded-sm text-[9px] bg-white/5 text-white border border-white/10 hover:bg-white/20 uppercase"
                        >
                          ZPĚT
                        </Button>
                      </div>
                    </div>

                    <Button 
                      onClick={() => {
                        if (isDriving) {
                          const offCount = passengersByStop[currentStop.id] || 0;
                          setPassengerCount(prev => Math.max(0, prev - offCount));
                          // We do NOT clear passengersByStop here, so it remains visible while standing!
                          setIsDriving(false);
                        } else {
                          if (nextStop) {
                            playAnnouncement(currentStop.name); 
                            
                            // Clear the departed stop exit count as we leave it!
                            setPassengersByStop(prev => ({ ...prev, [currentStop.id]: 0 }));
                            
                            if (currentRoute.name.includes("Výluka") && currentStopIndex === 0) {
                              const isDetourC = currentRoute.id === "120C1_VYL" || currentRoute.id === "120C2_VYL";
                              if (!isDetourC) {
                                playAnnouncement("Upozornění pro cestující. Z důvodu výluky jede tento spoj po odklonové trase a vynechává pravidelné zastávky.", false);
                              }
                            }
                            
                            checkForDetourAnnouncement(currentRoute, currentStopIndex);
                            
                            let nextText = `Příští zastávka: ${nextStop.name}`;
                            if (nextStop.isOnDemand) {
                              nextText += `. Příští zastávka je na znamení.`;
                            }
                            playAnnouncement(nextText, false);
                            
                            setCurrentStopIndex(prev => prev + 1);
                            setIsDriving(true);
                          }
                        }
                        setStopRequest(false);
                        handleActivity();
                      }}
                      disabled={!nextStop && !isDriving}
                      className={cn(
                        "w-40 font-black text-lg rounded-sm shadow-xl border-b transition-all active:border-b-0 active:translate-y-0.5 h-full",
                        isDriving ? "bg-[#ffcc00] text-[#003366] border-[#cca300]" : "bg-[#004a99] text-white border-[#003366]"
                      )}
                    >
                      {isDriving ? "PŘÍJEZD" : (nextStop ? "ODJEZD" : "KONEC")}
                    </Button>
                  </div>

                  {/* STOP INFO ROW (Current + Destination) */}
                  <div className="grid grid-cols-2 gap-1 shrink-0 h-6 mb-0.5">
                    <div className={cn(
                      "px-2 py-0 rounded-sm border flex items-center justify-between shadow-sm",
                      isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                    )}>
                      <div className="flex flex-col">
                        <span className="text-[5px] font-black uppercase text-[#004a99] tracking-widest leading-none">Aktuální</span>
                        <div className="text-xs font-black text-[#002b55] uppercase leading-none truncate max-w-[200px]">
                          {currentStop.name}
                        </div>
                      </div>
                      <div className="bg-slate-50 px-1 py-0 rounded border border-slate-200 flex flex-col items-center">
                        <span className="text-[5px] font-bold text-slate-400 uppercase leading-none">Zóna</span>
                        <span className="text-xs font-black text-[#002b55] leading-none">{currentStop.zone}</span>
                      </div>
                    </div>

                    <Dialog open={isDestinationOpen} onOpenChange={setIsDestinationOpen}>
                      <DialogTrigger asChild>
                        <button 
                          className={cn(
                            "px-2 py-0 rounded-sm border flex items-center justify-between shadow-sm hover:bg-slate-50 text-left transition-colors",
                            isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                          )}
                          onClick={() => handleActivity()}
                        >
                          <div className="flex flex-col">
                            <span className="text-[5px] font-black uppercase text-[#004a99] tracking-widest leading-none">Cíl</span>
                            <div className="text-xs font-black text-[#002b55] uppercase leading-none flex items-center truncate max-w-[200px]">
                              {destinationStop.name}
                              <ChevronRight size={8} className="ml-0.5 text-blue-500 opacity-50" />
                            </div>
                          </div>
                          <div className="bg-slate-50 px-1 py-0 rounded border border-slate-200 flex flex-col items-center">
                            <span className="text-[5px] font-bold text-slate-400 uppercase leading-none">Zóna</span>
                            <span className="text-xs font-black text-[#002b55] leading-none">{destinationStop.zone}</span>
                          </div>
                        </button>
                      </DialogTrigger>
                      <DialogContent className={isDarkMode ? "bg-[#001a33] text-white border-white/10" : "bg-white"}>
                          <DialogHeader><DialogTitle className="uppercase font-black text-[#004a99]">Vyberte cíl</DialogTitle></DialogHeader>
                          <div className="p-2 space-y-1 overflow-y-auto max-h-[60vh]">
                             {availableDestinations.map((stop) => (
                               <Button
                                 key={stop.id}
                                 variant="outline"
                                 className="w-full justify-start h-12 text-lg font-black uppercase"
                                 onClick={() => {
                                   setSelectedDestinationIndex(currentRoute.stops.indexOf(stop));
                                   setIsDestinationOpen(false);
                                   handleActivity();
                                 }}
                               >
                                 <MapPin size={16} className="mr-2" />
                                 {stop.name}
                               </Button>
                             ))}
                          </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* MAIN CONTENT AREA: TICKETS (Left) + CART (Right) */}
                  <div className="flex-1 flex gap-1 min-h-0 overflow-hidden">
                    {/* TICKETS AREA */}
                    <div className="flex-1 flex flex-col gap-1 overflow-y-auto pr-0.5 scrollbar-thin">
                       {/* Large Tickets (2xCols) */}
                       <div className="grid grid-cols-2 gap-1">
                          {TICKET_TYPES.filter(t => ['adult', 'child', 'student', 'senior'].includes(t.id)).map(type => (
                            <Button
                              key={type.id}
                              className={cn(
                                "h-11 flex flex-col items-center justify-center border-2 rounded-sm shadow-sm transition-all active:scale-95",
                                type.id === 'adult' ? "bg-[#004a99] border-[#003366] text-white" :
                                type.id === 'child' ? "bg-[#006633] border-[#004d26] text-white" :
                                type.id === 'student' ? "bg-[#994d00] border-[#804000] text-white" :
                                "bg-[#666666] border-[#4d4d4d] text-white"
                              )}
                              onClick={() => { addToCart(type); handleActivity(); }}
                            >
                              <span className="text-[9px] font-black uppercase text-center leading-tight tracking-tight">{type.name}</span>
                              <span className="text-lg font-black leading-none">
                                {calculatePrice(currentStop, destinationStop, type)} <span className="text-[10px]">Kč</span>
                              </span>
                            </Button>
                          ))}
                       </div>

                       {/* Small Tickets (4xCols) */}
                       <div className="grid grid-cols-4 gap-0.5">
                          {TICKET_TYPES.filter(t => !['adult', 'child', 'student', 'senior'].includes(t.id)).map(type => (
                            <Button
                              key={type.id}
                              variant="outline"
                              className={cn(
                                "h-6 flex flex-col items-center justify-center p-0.5 border border-slate-300 rounded-sm shadow-sm transition-all active:scale-95",
                                (type.id === 'delay' || type.id === 'receipt') ? "bg-amber-50 border-amber-200" : "bg-white hover:bg-slate-50 text-slate-800"
                              )}
                              onClick={() => { addToCart(type); handleActivity(); }}
                            >
                              <span className="text-[5.2px] font-black uppercase text-center leading-none mb-0.5 line-clamp-2 shrink-0">{type.name}</span>
                              <span className="text-[9px] font-black leading-none flex items-center gap-0.5">
                                {calculatePrice(currentStop, destinationStop, type) === 0 ? (
                                  <span className="text-amber-600">ZDARMA</span>
                                ) : (
                                  <>
                                    {calculatePrice(currentStop, destinationStop, type)}<span className="text-[6.5px] opacity-70">Kč</span>
                                  </>
                                )}
                              </span>
                            </Button>
                          ))}
                       </div>
                    </div>

                    {/* CART & CHECKOUT AREA */}
                    <div className="w-80 flex flex-col h-full shrink-0">
                       <div className="flex-1 flex flex-col bg-slate-50 border border-slate-300 rounded-sm overflow-hidden shadow-inner min-h-0">
                          <div className="p-1 bg-[#004a99] text-white flex justify-between items-center shrink-0">
                             <span className="text-[9px] font-black uppercase tracking-widest flex items-center">
                               <ShoppingCart size={11} className="mr-1" />
                               KOŠÍK
                             </span>
                             <span className="text-[9px] font-mono">{cart.reduce((a,b) => a+b.count, 0)} ks</span>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto p-0.5 space-y-0.5 min-h-0 scrollbar-thin">
                             {cart.length === 0 ? (
                               <div className="h-full flex items-center justify-center text-slate-400 italic text-[8px] uppercase font-black">Prázdný</div>
                             ) : (
                               cart.map(item => (
                                 <div key={item.type.id} className="flex items-center justify-between bg-white p-1 border border-slate-200 rounded-sm shadow-sm">
                                    <div className="flex flex-col">
                                       <span className="text-[8px] font-black uppercase text-slate-700 leading-none">{item.type.name}</span>
                                       <span className="text-[10px] text-[#004a99] font-black mt-0.5">
                                         {item.count}x {calculatePrice(currentStop, destinationStop, item.type)} Kč
                                       </span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-5 w-5 text-red-500" onClick={() => removeFromCart(item.type.id)}>
                                       <Trash2 size={11} />
                                    </Button>
                                 </div>
                               ))
                             )}
                          </div>

                          <div className="p-1.5 bg-white border-t border-slate-200 shrink-0">
                             <div className="flex justify-between items-baseline mb-1">
                                <span className="text-[8px] font-black uppercase text-slate-500">K úhradě</span>
                                <span className="text-xl font-black text-[#004a99] leading-none">
                                  {cartTotal} <span className="text-xs">Kč</span>
                                </span>
                             </div>

                             <div className="grid grid-cols-3 gap-0.5 mb-1.5">
                                {[
                                  { id: 'cash', icon: Printer, label: 'HOTOVĚ' },
                                  { id: 'card', icon: CreditCard, label: 'KARTOU' },
                                  { id: 'mobile', icon: Wifi, label: 'MOBIL' }
                                ].map(p => (
                                  <button 
                                    key={p.id}
                                    className={cn(
                                      "h-6 flex flex-col items-center justify-center rounded-sm border text-[7px] font-black",
                                      paymentMethod === p.id 
                                        ? "bg-blue-600 border-blue-700 text-white shadow-inner" 
                                        : "bg-slate-100 border-slate-200 text-slate-500"
                                    )}
                                    onClick={() => setPaymentMethod(p.id as any)}
                                  >
                                    <p.icon size={9} />
                                    {p.label}
                                  </button>
                                ))}
                             </div>

                             <Button 
                               className={cn(
                                 "w-full h-8 font-black text-xl uppercase rounded-none border-b-2 active:border-b-0 active:translate-y-1 transition-all",
                                 isPrinting ? "bg-slate-400" : "bg-[#ffcc00] text-[#003366] border-[#cca300]"
                               )}
                               onClick={handleSellTicket}
                               disabled={isPrinting || cart.length === 0}
                             >
                               {isPrinting ? "TISK..." : "VÝDEJ"}
                             </Button>
                          </div>
                       </div>
                    </div>
                  </div>
               </TabsContent>

              <TabsContent value="route" className="flex-1 flex flex-col gap-4 mt-0 overflow-y-auto min-h-0 pb-40 lg:pb-0 scrollbar-none">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4 min-h-0"
                >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shrink-0">
                    <div className="flex flex-col">
                      <h3 className={cn("font-bold uppercase tracking-widest", isDarkMode ? "text-[#ffcc00]" : "text-[#004a99]")}>Výběr linky a trasy</h3>
                      <span className="text-[10px] opacity-50 font-bold uppercase">Aktuálně: {currentRoute.name}</span>
                    </div>
                    <div className={cn("flex flex-wrap items-center gap-2 p-2 rounded-lg border w-full lg:w-auto", isDarkMode ? "bg-black/20 border-white/5" : "bg-slate-100 border-slate-200 shadow-sm")}>
                      <div className="relative flex-1 lg:w-64">
                        <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2", isDarkMode ? "text-white/40" : "text-slate-400")} size={16} />
                        <input 
                          type="text"
                          placeholder="Hledat zastávku..."
                          value={routeSearchQuery}
                          onChange={(e) => setRouteSearchQuery(e.target.value)}
                          className={cn(
                            "w-full border rounded px-9 py-2 text-sm focus:outline-none transition-colors",
                            isDarkMode ? "bg-zinc-900/50 border-white/10 text-white focus:border-[#ffcc00]/50" : "bg-white border-slate-300 text-slate-800 focus:border-[#004a99]/50"
                          )}
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={cn(
                          "h-10 px-3 font-bold border-2 transition-colors",
                          isDarkMode ? "border-blue-500/50 hover:bg-blue-500/10 text-blue-400" : "border-blue-600/50 bg-white text-blue-600 hover:bg-blue-50"
                        )}
                        onClick={handleReverseRoute}
                      >
                        <RefreshCw size={16} className="mr-2" /> OTOČIT SMĚR
                      </Button>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={cn(
                          "h-10 px-3 font-bold border-2 transition-colors",
                          isDarkMode ? "border-orange-500/50 hover:bg-orange-500/10 text-orange-400" : "border-orange-600/50 bg-white text-orange-600 hover:bg-orange-50"
                        )}
                        onClick={() => setIsEditJrOpen(true)}
                      >
                        <Settings size={16} className="mr-2" /> UPRAVIT JŘ
                      </Button>

                      <Dialog open={isEditJrOpen} onOpenChange={setIsEditJrOpen}>
                        <DialogContent className={cn(
                          "max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-6 gap-4 border",
                          isDarkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-white border-slate-200 text-slate-900"
                        )}>
                          <DialogHeader>
                            <DialogTitle className={cn(
                              "font-black tracking-tight text-xl flex items-center gap-2",
                              isDarkMode ? "text-[#ffcc00]" : "text-[#004a99]"
                            )}>
                              <Settings size={22} />
                              UPRAVIT JÍZDNÍ ŘÁD (JŘ) - LINKA {currentRoute.number}
                            </DialogTitle>
                          </DialogHeader>
                          
                          {/* Route Info Cards */}
                          <div className="grid grid-cols-2 gap-4 shrink-0">
                            <div className="flex flex-col gap-1 text-left">
                              <span className="text-[10px] font-bold opacity-65 uppercase">Název Linky / Trasy</span>
                              <input 
                                type="text" 
                                value={editingRouteName} 
                                onChange={(e) => setEditingRouteName(e.target.value)}
                                className={cn(
                                  "border rounded px-3 py-1.5 text-sm font-bold focus:outline-none",
                                  isDarkMode ? "bg-zinc-900 border-zinc-800 text-white focus:border-[#ffcc00]/50" : "bg-white border-slate-300 text-slate-800 focus:border-[#004a99]/50"
                                )}
                              />
                            </div>
                            <div className="flex flex-col gap-1 text-left">
                              <span className="text-[10px] font-bold opacity-65 uppercase">Číslo Linky</span>
                              <input 
                                type="text" 
                                value={editingRouteNumber} 
                                onChange={(e) => setEditingRouteNumber(e.target.value)}
                                className={cn(
                                  "border rounded px-3 py-1.5 text-sm font-bold focus:outline-none",
                                  isDarkMode ? "bg-zinc-900 border-zinc-800 text-white focus:border-[#ffcc00]/50" : "bg-white border-slate-300 text-slate-800 focus:border-[#004a99]/50"
                                )}
                              />
                            </div>
                          </div>

                          {/* Stops List Editor */}
                          <div className={cn(
                            "flex-1 overflow-y-auto pr-1 border rounded-lg overflow-hidden flex flex-col min-h-0",
                            isDarkMode ? "border-zinc-800" : "border-slate-200"
                          )}>
                            <div className={cn(
                              "grid grid-cols-12 gap-2 p-2 text-[10px] font-black uppercase tracking-wider sticky top-0",
                              isDarkMode ? "bg-zinc-900 text-zinc-400 border-b border-zinc-800" : "bg-slate-100 text-slate-500 border-b border-slate-200"
                            )}>
                              <div className="col-span-1 text-center font-bold">#</div>
                              <div className="col-span-4 text-left font-bold">Název Zastávky</div>
                              <div className="col-span-1 text-center font-bold">Zóna</div>
                              <div className="col-span-1 text-center font-bold">Km</div>
                              <div className="col-span-2 text-center font-bold">Min (Od startu)</div>
                              <div className="col-span-1 text-center font-bold">Náhled Odjezdu</div>
                              <div className="col-span-1 text-center font-bold">Znamení</div>
                              <div className="col-span-1 text-center font-bold">Smazat</div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/10 max-h-[45vh] p-1 space-y-1">
                              {editingStops.map((stop, sIdx) => (
                                <div key={stop.id} className="grid grid-cols-12 gap-2 items-center py-1 text-xs">
                                  <div className="col-span-1 text-center font-bold font-mono text-zinc-400">{sIdx + 1}</div>
                                  <div className="col-span-4 text-left font-semibold">
                                    <input 
                                      type="text" 
                                      value={stop.name} 
                                      onChange={(e) => {
                                        const newStops = [...editingStops];
                                        newStops[sIdx].name = e.target.value;
                                        setEditingStops(newStops);
                                      }}
                                      className={cn(
                                        "w-full border rounded px-2 py-1 text-xs font-semibold focus:outline-none",
                                        isDarkMode ? "bg-zinc-900/50 border-zinc-800 text-zinc-100" : "bg-white border-slate-200 text-slate-800 focus:border-[#004a99]/40"
                                      )}
                                    />
                                  </div>
                                  <div className="col-span-1">
                                    <input 
                                      type="number" 
                                      value={stop.zone} 
                                      min={1}
                                      onChange={(e) => {
                                        const newStops = [...editingStops];
                                        newStops[sIdx].zone = Number(e.target.value);
                                        setEditingStops(newStops);
                                      }}
                                      className={cn(
                                        "w-full border rounded px-2 py-1 text-xs text-center font-mono focus:outline-none",
                                        isDarkMode ? "bg-zinc-900/50 border-zinc-800 text-zinc-100" : "bg-white border-slate-200 text-slate-800 focus:border-[#004a99]/40"
                                      )}
                                    />
                                  </div>
                                  <div className="col-span-1">
                                    <input 
                                      type="number" 
                                      value={stop.kmFromStart} 
                                      min={0}
                                      step={0.1}
                                      onChange={(e) => {
                                        const newStops = [...editingStops];
                                        newStops[sIdx].kmFromStart = parseFloat(e.target.value) || 0;
                                        setEditingStops(newStops);
                                      }}
                                      className={cn(
                                        "w-full border rounded px-2 py-1 text-xs text-center font-mono focus:outline-none",
                                        isDarkMode ? "bg-zinc-900/50 border-zinc-800 text-zinc-100" : "bg-white border-slate-200 text-slate-800"
                                      )}
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <input 
                                      type="number" 
                                      value={stop.minutesFromStart} 
                                      min={0}
                                      onChange={(e) => {
                                        const newStops = [...editingStops];
                                        newStops[sIdx].minutesFromStart = parseInt(e.target.value, 10) || 0;
                                        setEditingStops(newStops);
                                      }}
                                      className={cn(
                                        "w-full border rounded px-2 py-1 text-xs text-center font-mono focus:outline-none",
                                        isDarkMode ? "bg-zinc-900/50 border-zinc-800 text-zinc-100" : "bg-white border-slate-200 text-slate-800"
                                      )}
                                    />
                                  </div>
                                  <div className="col-span-1 text-center">
                                    <span className={cn(
                                      "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0",
                                      isDarkMode ? "bg-orange-950/40 text-orange-400 border border-orange-900" : "bg-blue-50 text-blue-700 border border-blue-200"
                                    )}>
                                      {getComputedDepartureTime(stop.minutesFromStart)}
                                    </span>
                                  </div>
                                  <div className="col-span-1 text-center">
                                    <input 
                                      type="checkbox" 
                                      checked={!!stop.isOnDemand}
                                      onChange={(e) => {
                                        const newStops = [...editingStops];
                                        newStops[sIdx].isOnDemand = e.target.checked;
                                        setEditingStops(newStops);
                                      }}
                                      className="h-3.5 w-3.5 rounded border-zinc-300 bg-zinc-900"
                                    />
                                  </div>
                                  <div className="col-span-1 text-center">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      disabled={editingStops.length <= 1}
                                      className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-500/10"
                                      onClick={() => handleRemoveStop(sIdx)}
                                    >
                                      <Trash2 size={14} />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Dialog actions */}
                          <div className={cn(
                            "flex items-center justify-between shrink-0 p-2 border-t",
                            isDarkMode ? "border-zinc-850" : "border-slate-100"
                          )}>
                            <Button 
                              variant="outline" 
                              className={cn(
                                "font-black uppercase text-xs border border-dashed",
                                isDarkMode ? "border-zinc-700 text-zinc-200 hover:bg-zinc-900" : "border-slate-300 text-slate-700 hover:bg-slate-100"
                              )}
                              onClick={handleAddStop}
                            >
                              + PŘIDAT ZASTÁVKU
                            </Button>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                onClick={() => setIsEditJrOpen(false)}
                                className={cn("font-bold text-xs uppercase", isDarkMode ? "text-zinc-400 hover:text-white" : "text-slate-500 hover:text-slate-800")}
                              >
                                ZAVŘÍT
                              </Button>
                              <Button 
                                className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase"
                                onClick={handleSaveJr}
                              >
                                ULOŽIT ZMĚNY
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Separator orientation="vertical" className={cn("h-8 hidden lg:block", isDarkMode ? "bg-white/10" : "bg-slate-300")} />
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[10px] font-bold", isDarkMode ? "text-zinc-400" : "text-slate-600")}>START JŘ:</span>
                        <input 
                          type="time" 
                          value={manualStartTime} 
                          onChange={(e) => setManualStartTime(e.target.value)}
                          className={cn("border rounded px-2 py-1 text-sm font-mono text-orange-500 font-bold focus:outline-none", isDarkMode ? "bg-zinc-900 border-zinc-700 block" : "bg-white border-slate-300 block shadow-sm")}
                        />
                      </div>
                      <Button 
                        className={cn(
                          "h-10 px-4 font-bold border-2 transition-all",
                          tripStartTime ? "bg-red-600 hover:bg-red-700 border-red-400" : "bg-green-600 hover:bg-green-700 border-green-400"
                        )}
                        onClick={handleStartTrip}
                      >
                        {tripStartTime ? "RESTARTOVAT" : "ZAHÁJIT"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                    {/* Mimořádná výluka Alert Banner */}
                    <div className={cn(
                      "mb-3 border-2 rounded-xl p-4 flex gap-3.5 items-start text-left shadow-md transition-all",
                      isDarkMode 
                        ? "bg-amber-950/20 border-amber-500/30 text-amber-200" 
                        : "bg-amber-50 border-amber-500/50 text-amber-900"
                    )}>
                      <AlertOctagon className="text-amber-500 shrink-0 mt-0.5" size={24} />
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-sm font-black uppercase tracking-wider text-amber-500">Mimořádná výluka linek 120/C1 a 120/C2</h4>
                          <span className={cn(
                            "text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase shrink-0",
                            isDarkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-500/10 text-amber-800"
                          )}>Aktivní do 1.12.2026</span>
                        </div>
                        <p className="text-xs font-semibold leading-relaxed opacity-95">
                          Z důvodu rozsáhlé uzavírky jedou spoje 120/C1 a 120/C2 odklonem přes <span className="underline font-black text-amber-500">Haldu</span> a <span className="underline font-black text-amber-500">Kounice u hřiště</span>.
                        </p>
                        <div className="text-[10px] font-mono opacity-90 mt-2 p-2 bg-black/5 rounded space-y-1 border border-black/5">
                          <div>• <span className="text-red-500 font-bold">Zcela vynechány zastávky:</span> u školního hřiště, Nádražní škola, staré náměstí, Točná u kostela, Točná v Kostelní ulici, v zatáčce, Točná u fary, u Hřbitova, Kounice internát.</div>
                          <div>• <span className="text-green-600 font-bold">Nové náhradní zastávky:</span> u Garáží, na mostě, u nádraží, u mostu, Halda pod/u/za mostem, na Haldě, Kounice u hřiště.</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pb-10">
                      {routes.filter(route => 
                        routeSearchQuery === "" || 
                        route.stops.some(stop => stop.name.toLowerCase().includes(routeSearchQuery.toLowerCase()))
                      ).map((route) => (
                        <Button
                          key={route.id}
                          variant="outline"
                          className={cn(
                            "h-auto py-4 justify-start px-6 border-2 transition-all text-left",
                            currentRoute.id === route.id 
                              ? "bg-[#003366] border-[#004080] text-white" 
                              : isDarkMode 
                                ? "bg-zinc-800/50 border-white/5 hover:border-white/20 text-white" 
                                : "bg-white border-zinc-200 text-slate-800 hover:bg-slate-50 shadow-sm"
                          )}
                          onClick={() => {
                            setCurrentRoute(route);
                            setCurrentStopIndex(0);
                            setRouteSearchQuery("");
                          }}
                        >
                          <div className="flex flex-col items-start w-full">
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className={cn("text-xl lg:text-2xl font-black uppercase", currentRoute.id === route.id ? "text-white" : (isDarkMode ? "text-white" : "text-slate-900"))}>{route.name}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                {(route.number === '120/A' || route.number === '120/B') && (
                                  <Badge className="bg-red-600 hover:bg-red-700 text-white font-black animate-pulse text-[10px]">VE VŠEDNÍ DNY ZRUŠENO</Badge>
                                )}
                                {route.number === '120/ABx' && (
                                  <Badge className="bg-green-600 hover:bg-green-700 text-white font-black text-[10px]">KYVADLOVÝ SPOJ</Badge>
                                )}
                                <Badge className="bg-[#ffcc00] text-[#003366] font-black">{route.number}</Badge>
                              </div>
                            </div>
                            <div className={cn("flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold", currentRoute.id === route.id ? "text-white/80" : (isDarkMode ? "text-zinc-400" : "text-slate-500"))}>
                              <span>{route.stops.length} zastávek</span>
                              <span>•</span>
                              <span>{route.stops[route.stops.length-1].kmFromStart} km</span>
                              <span>•</span>
                              <span className={cn(currentRoute.id === route.id ? "text-[#ffcc00]" : (isDarkMode ? "text-[#ffcc00]/80" : "text-[#004a99]"))}>
                                Přenese: {route.stops[0].name} → {route.stops[route.stops.length-1].name}
                              </span>
                            </div>
                          </div>
                        </Button>
                      ))}
                      {routes.filter(route => 
                        routeSearchQuery === "" || 
                        route.stops.some(stop => stop.name.toLowerCase().includes(routeSearchQuery.toLowerCase()))
                      ).length === 0 && (
                        <div className={cn(
                          "flex flex-col items-center justify-center p-12 border border-dashed rounded-lg",
                          isDarkMode ? "text-zinc-500 bg-black/20 border-white/5" : "text-slate-400 bg-slate-50 border-slate-200"
                        )}>
                          <Search size={48} className="mb-4 opacity-20" />
                          <p className="font-bold">Nenalezena žádná linka se zastávkou "{routeSearchQuery}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="messages" className="flex-1 flex flex-col gap-4 mt-0 overflow-y-auto min-h-0 pb-40 lg:pb-0 scrollbar-none">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4 min-h-0"
                >
                <div className="flex items-center justify-between shrink-0">
                  <h3 className="text-[#ffcc00] font-bold uppercase tracking-widest">Zprávy z dispečinku</h3>
                  <Button variant="ghost" size="sm" onClick={() => setMessages(prev => prev.map(m => ({ ...m, read: true })))}>Přečíst vše</Button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                  <div className="flex flex-col gap-2">
                    {messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-500 italic py-20">Žádné zprávy</div>
                    ) : (
                      messages.map((m) => (
                        <div 
                          key={m.id} 
                          className={cn(
                            "p-4 rounded-lg border flex flex-col gap-1 transition-colors",
                            m.read ? (isDarkMode ? "bg-black/20 border-zinc-800" : "bg-gray-50 border-gray-200") : "bg-blue-500/10 border-blue-500/30"
                          )}
                          onClick={() => setMessages(prev => prev.map(msg => msg.id === m.id ? { ...msg, read: true } : msg))}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-blue-400 uppercase">Centrální dispečink</span>
                            <span className="text-[10px] opacity-50 font-mono">{m.time.toLocaleTimeString()}</span>
                          </div>
                          <p className="text-sm font-bold">{m.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="vehicle" className="flex-1 flex flex-col gap-4 mt-0 overflow-y-auto min-h-0 pb-40 lg:pb-0 scrollbar-none">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4 min-h-0 h-full"
                >
                <div className="grid grid-cols-2 gap-4 h-full">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[#ffcc00] font-bold uppercase tracking-widest">Kamerový systém</h3>
                      {isCameraActive && (
                        <div className="flex gap-1">
                          {[
                            { id: 'interior', label: 'INT' },
                            { id: 'door1', label: 'D1' },
                            { id: 'door2', label: 'D2' },
                            { id: 'rear', label: 'ZAD' }
                          ].map(cam => (
                            <Button 
                              key={cam.id}
                              variant={activeCamera === cam.id ? "default" : "outline"}
                              size="sm"
                              className={cn("h-7 px-2 text-[10px] font-black", activeCamera === cam.id && "bg-blue-600 border-blue-400")}
                              onClick={() => setActiveCamera(cam.id as any)}
                            >
                              {cam.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 bg-black rounded-xl border border-zinc-800 overflow-hidden relative group">
                      {isCameraActive ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className={cn(
                            "absolute inset-0 bg-cover bg-center opacity-40 grayscale transition-all duration-500",
                            activeCamera === 'interior' && "bg-[url('https://picsum.photos/seed/bus-interior-1/800/600')]",
                            activeCamera === 'door1' && "bg-[url('https://picsum.photos/seed/bus-door-1/800/600')]",
                            activeCamera === 'door2' && "bg-[url('https://picsum.photos/seed/bus-door-2/800/600')]",
                            activeCamera === 'rear' && "bg-[url('https://picsum.photos/seed/bus-rear/800/600')]"
                          )} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                          <div className="z-10 flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2 bg-red-600 px-2 py-1 rounded text-[10px] font-black animate-pulse">
                              <div className="w-2 h-2 bg-white rounded-full" />
                              REC - CAM {activeCamera === 'interior' ? '01' : activeCamera === 'door1' ? '02' : activeCamera === 'door2' ? '03' : '04'} ({
                                activeCamera === 'interior' ? 'INTERIÉR' : 
                                activeCamera === 'door1' ? 'DVEŘE 1' : 
                                activeCamera === 'door2' ? 'DVEŘE 2' : 'ZADNÍ'
                              })
                            </div>
                            <span className="text-xs font-mono opacity-50">{formatTime(currentTime)}</span>
                          </div>
                          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-zinc-700">
                          <Camera size={48} />
                          <span className="text-xs font-bold uppercase">Kamera vypnuta</span>
                          <Button variant="outline" size="sm" onClick={() => setIsCameraActive(true)}>AKTIVOVAT</Button>
                        </div>
                      )}
                      {isCameraActive && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2 text-white/50 hover:text-white"
                          onClick={() => setIsCameraActive(false)}
                        >
                          <X size={20} />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h3 className="text-[#ffcc00] font-bold uppercase tracking-widest">Telemetrie</h3>
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <div className="bg-black/20 p-4 rounded-xl border border-zinc-800 flex flex-col justify-between">
                        <Gauge className="text-blue-400" size={20} />
                        <div className="flex flex-col">
                          <span className="text-[10px] opacity-50 uppercase font-bold">Rychlost</span>
                          <span className="text-3xl font-black font-mono">0 <span className="text-sm font-normal opacity-50">km/h</span></span>
                        </div>
                      </div>
                      <div className="bg-black/20 p-4 rounded-xl border border-zinc-800 flex flex-col justify-between">
                        <Thermometer className="text-orange-400" size={20} />
                        <div className="flex flex-col">
                          <span className="text-[10px] opacity-50 uppercase font-bold">Teplota motoru</span>
                          <span className="text-3xl font-black font-mono">82 <span className="text-sm font-normal opacity-50">°C</span></span>
                        </div>
                      </div>
                      <div className="bg-black/20 p-4 rounded-xl border border-zinc-800 flex flex-col justify-between">
                        <History className="text-green-400" size={20} />
                        <div className="flex flex-col">
                          <span className="text-[10px] opacity-50 uppercase font-bold">Doba jízdy</span>
                          <span className="text-3xl font-black font-mono">02:14</span>
                        </div>
                      </div>
                      <div className="bg-black/20 p-4 rounded-xl border border-zinc-800 flex flex-col justify-between">
                        <ShieldAlert className="text-red-400" size={20} />
                        <div className="flex flex-col">
                          <span className="text-[10px] opacity-50 uppercase font-bold">Brzdy</span>
                          <span className="text-xl font-black text-green-500 uppercase">V POŘÁDKU</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="history" className="flex-1 flex flex-col gap-4 mt-0 overflow-y-auto min-h-0 pb-40 lg:pb-0 scrollbar-none">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4 min-h-0"
                >
                <div className="flex items-center justify-between shrink-0">
                  <h3 className="text-[#ffcc00] font-bold uppercase tracking-widest">Historie prodeje</h3>
                  <Button variant="destructive" size="sm" onClick={() => setTransactions([])}><Trash2 size={16} className="mr-2" /> SMAZAT</Button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                  {transactions.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500 italic py-20">Žádné transakce</div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {transactions.map((t) => (
                        <div key={t.id} className={cn(
                          "p-3 rounded border flex justify-between items-center", 
                          isDarkMode ? "bg-[#333] border-[#444]" : "bg-gray-50 border-gray-200",
                          t.storno && "opacity-40 grayscale"
                        )}>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{t.fromStop} → {t.toStop}</span>
                              {t.storno && <span className="bg-red-500 text-white text-[8px] font-black px-1 rounded uppercase">Storno</span>}
                            </div>
                            <span className="text-xs opacity-50">{t.ticketType} • {t.timestamp.toLocaleTimeString()}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xl font-black text-[#ffcc00]">{t.storno ? 0 : t.price} Kč</span>
                            {!t.storno && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 bg-red-50 border-red-200 text-red-600 font-bold hover:bg-red-600 hover:text-white"
                                onClick={() => stornoTicket(t.id)}
                              >
                                STORNO
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="hvac" className="flex-1 flex flex-col gap-4 mt-0 overflow-y-auto min-h-0 pb-40 lg:pb-0 scrollbar-none w-full h-full">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col gap-4 w-full h-full p-2"
              >
                <div className="bg-[#050505] rounded-xl border-[6px] border-zinc-900 shadow-2xl p-6 relative flex-1 flex flex-col min-h-0">
                  {/* Industrial Aesthetic Plate */}
                  <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-zinc-800 shadow-inner border border-black" />
                  <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-zinc-800 shadow-inner border border-black" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-zinc-800 shadow-inner border border-black" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-zinc-800 shadow-inner border border-black" />

                  <div className="flex flex-col gap-6 flex-1 justify-between">
                    {/* Top Status Bar */}
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-4 shrink-0">
                      <div className="flex flex-col">
                        <h3 className="text-orange-500 font-bold uppercase tracking-[0.2em] leading-none mb-2 text-lg md:text-xl">Crossway HVAC Controller</h3>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", hvac.auto ? "bg-green-500 animate-pulse" : "bg-zinc-700")} />
                          <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase">{hvac.auto ? "Automatika aktivní" : "Manuální režim"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-[8px] text-zinc-600 font-black uppercase mb-1">Vnější teplota</span>
                         <span className="text-[#ffcc00] font-mono text-xl font-black shadow-inner px-3 py-1 bg-black rounded border border-zinc-800">{hvac.externalTemp.toFixed(1)}°C</span>
                      </div>
                    </div>

                    {/* Main HVAC Control Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0 overflow-y-auto pr-1">
                      {/* Left: Driver Controls */}
                      <div className="md:col-span-3 flex flex-col gap-4 justify-between">
                         <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50 flex flex-col gap-3 shadow-inner">
                            <span className="text-[10px] text-orange-500 font-black uppercase text-center tracking-widest">Zóna Řidič</span>
                            <div className="flex flex-col gap-3">
                               {/* Horizontal slider control */}
                               <div className="flex items-center gap-3">
                                  <Button 
                                    variant="ghost" 
                                    className="h-10 w-10 shrink-0 bg-zinc-950 border border-zinc-800 font-mono font-black text-xl hover:text-blue-500 rounded-lg active:scale-95 transition-transform" 
                                    onClick={() => setHvac(prev => ({ ...prev, targetDriverTemp: Math.max(16, prev.targetDriverTemp - 1) }))}
                                  >
                                    -
                                  </Button>
                                  
                                  {/* Slider Track with Dot Handle */}
                                  <div className="flex-1 py-4 relative">
                                     <div className="h-2 w-full bg-black border border-zinc-800 rounded-full relative overflow-visible">
                                        {/* Active/Filled Track */}
                                        <div 
                                           className="absolute left-0 top-0 h-full bg-orange-500 rounded-full" 
                                           style={{ width: `${((hvac.targetDriverTemp - 16) / (28 - 16)) * 100}%` }}
                                        />
                                        {/* Centered/Adjustable Thumb Dot Indicator */}
                                        <div 
                                           className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-orange-500 border-2 border-black shadow-[0_0_10px_rgba(249,115,22,0.8)] cursor-pointer hover:scale-110 transition-transform"
                                           style={{ left: `${((hvac.targetDriverTemp - 16) / (28 - 16)) * 100}%` }}
                                        />
                                        {/* Hidden click-capturer on top of the track */}
                                        <input 
                                           type="range"
                                           min="16"
                                           max="28"
                                           step="1"
                                           value={hvac.targetDriverTemp}
                                           onChange={(e) => {
                                              const val = parseInt(e.target.value);
                                              setHvac(prev => ({ ...prev, targetDriverTemp: val }));
                                           }}
                                           className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                     </div>
                                  </div>

                                  <Button 
                                    variant="ghost" 
                                    className="h-10 w-10 shrink-0 bg-zinc-950 border border-zinc-800 font-mono font-black text-xl hover:text-orange-500 rounded-lg active:scale-95 transition-transform" 
                                    onClick={() => setHvac(prev => ({ ...prev, targetDriverTemp: Math.min(28, prev.targetDriverTemp + 1) }))}
                                  >
                                    +
                                  </Button>
                               </div>
                               
                               {/* Display/Value */}
                               <div className="text-center bg-black/40 py-2 rounded border border-zinc-800/20 shadow-inner block">
                                  <span className="text-3xl font-mono font-black text-white">{hvac.targetDriverTemp}.0°C</span>
                               </div>
                            </div>
                         </div>
                         <Button 
                          variant="ghost" 
                          className={cn("h-16 border-2 flex flex-col gap-1 transition-all shadow-md mt-auto", hvac.frontDefrost ? "border-orange-500 text-orange-500 bg-orange-500/5" : "border-zinc-800 text-zinc-600")}
                          onClick={() => setHvac(prev => ({ ...prev, frontDefrost: !prev.frontDefrost }))}
                         >
                            <Wind size={24} />
                            <span className="text-[10px] font-black uppercase">Odmrazování skla</span>
                         </Button>
                      </div>

                      {/* Middle: LCD & System Monitor */}
                      <div className="md:col-span-6 bg-[#020202] border-2 border-zinc-800 rounded-xl relative overflow-hidden flex flex-col p-6 shadow-[inset_0_0_40px_rgba(0,0,0,1)] justify-between min-h-[300px]">
                         <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(0,100,255,0.05),transparent)] z-10" />
                         
                         <div className="flex justify-between items-center mb-6 shrink-0">
                            <span className="text-[8px] text-zinc-600 font-mono tracking-[0.4em]">OIB_HVAC_INTERFACE_OS</span>
                            <div className="flex gap-4">
                               {hvac.ac && <Snowflake size={20} className="text-cyan-400 animate-spin-slow drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />}
                               {hvac.webasto && <Flame size={20} className="text-orange-500 animate-pulse" />}
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-4 flex-1 items-center min-h-0">
                            <div className="flex flex-col items-center justify-center border-r border-zinc-800/30">
                               <span className="text-[10px] text-zinc-600 font-black uppercase mb-4 tracking-widest">Teplota Salón</span>
                               <span className="text-6xl md:text-7xl font-mono font-black text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{hvac.passengerTemp.toFixed(1)}°</span>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                               <span className="text-[10px] text-zinc-600 font-black uppercase mb-4 tracking-widest">Ventilace</span>
                               <div className="flex gap-2 items-end h-24">
                                  {[1,2,3,4,5,6,7].map(i => (
                                    <div key={i} className={cn("w-2 rounded-t transition-all duration-500", i <= hvac.fanSpeed ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-zinc-800")} style={{ height: `${20 + (i * 12)}%` }} />
                                  ))}
                                </div>
                            </div>
                         </div>

                         <div className="mt-8 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50 flex flex-col gap-4 shrink-0">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-600">
                               <span>Hlasitost Hlášení ve Voze</span>
                               <span className="text-[#ffcc00] font-mono">{busStats.volume}%</span>
                            </div>
                            <div className="flex items-center gap-4">
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white" onClick={() => setBusStats(prev => ({ ...prev, volume: Math.max(0, prev.volume - 5) }))}>-</Button>
                               <div className="flex-1 h-2 bg-black rounded-full overflow-hidden border border-zinc-800">
                                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${busStats.volume}%` }} />
                               </div>
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white" onClick={() => setBusStats(prev => ({ ...prev, volume: Math.min(100, prev.volume + 5) }))}>+</Button>
                            </div>
                         </div>
                      </div>

                      {/* Right: Passenger Controls */}
                      <div className="md:col-span-3 flex flex-col gap-4 justify-between">
                         <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50 flex flex-col gap-3 shadow-inner">
                            <span className="text-[10px] text-blue-500 font-black uppercase text-center tracking-widest">Zóna Salón</span>
                            <div className="flex flex-col gap-3">
                               {/* Horizontal slider control */}
                               <div className="flex items-center gap-3">
                                  <Button 
                                    variant="ghost" 
                                    className="h-10 w-10 shrink-0 bg-zinc-950 border border-zinc-800 font-mono font-black text-xl hover:text-blue-500 rounded-lg active:scale-95 transition-transform" 
                                    onClick={() => setHvac(prev => ({ ...prev, targetPassengerTemp: Math.max(16, prev.targetPassengerTemp - 1) }))}
                                  >
                                    -
                                  </Button>
                                  
                                  {/* Slider Track with Dot Handle */}
                                  <div className="flex-1 py-4 relative">
                                     <div className="h-2 w-full bg-black border border-zinc-800 rounded-full relative overflow-visible">
                                        {/* Active/Filled Track */}
                                        <div 
                                           className="absolute left-0 top-0 h-full bg-blue-500 rounded-full" 
                                           style={{ width: `${((hvac.targetPassengerTemp - 16) / (28 - 16)) * 100}%` }}
                                        />
                                        {/* Centered/Adjustable Thumb Dot Indicator */}
                                        <div 
                                           className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500 border-2 border-black shadow-[0_0_10px_rgba(59,130,246,0.8)] cursor-pointer hover:scale-110 transition-transform"
                                           style={{ left: `${((hvac.targetPassengerTemp - 16) / (28 - 16)) * 100}%` }}
                                        />
                                        {/* Hidden click-capturer on top of the track */}
                                        <input 
                                           type="range"
                                           min="16"
                                           max="28"
                                           step="1"
                                           value={hvac.targetPassengerTemp}
                                           onChange={(e) => {
                                              const val = parseInt(e.target.value);
                                              setHvac(prev => ({ ...prev, targetPassengerTemp: val }));
                                           }}
                                           className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                     </div>
                                  </div>

                                  <Button 
                                    variant="ghost" 
                                    className="h-10 w-10 shrink-0 bg-zinc-950 border border-zinc-800 font-mono font-black text-xl hover:text-orange-500 rounded-lg active:scale-95 transition-transform" 
                                    onClick={() => setHvac(prev => ({ ...prev, targetPassengerTemp: Math.min(28, prev.targetPassengerTemp + 1) }))}
                                  >
                                    +
                                  </Button>
                               </div>
                               
                               {/* Display/Value */}
                               <div className="text-center bg-black/40 py-2 rounded border border-zinc-800/20 shadow-inner block">
                                  <span className="text-3xl font-mono font-black text-white">{hvac.targetPassengerTemp}.0°C</span>
                               </div>
                            </div>
                         </div>
                         <Button 
                          variant="ghost" 
                          className={cn("h-16 border-2 flex flex-col gap-1 transition-all shadow-md mt-auto", hvac.recirculation ? "border-yellow-600 text-yellow-500 bg-yellow-500/5" : "border-zinc-800 text-zinc-600")}
                          onClick={() => setHvac(prev => ({ ...prev, recirculation: !prev.recirculation }))}
                         >
                            <RefreshCw size={24} />
                            <span className="text-[10px] font-black uppercase">Vnitřní recirkulace</span>
                         </Button>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0 pt-4 border-t border-zinc-900/60">
                        <Button 
                          className={cn("h-16 font-black uppercase text-xs border-2 transition-all active:scale-95", hvac.ac ? "bg-cyan-900/40 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]" : "bg-black border-zinc-800 text-zinc-600")}
                          onClick={() => setHvac(prev => ({ ...prev, ac: !prev.ac }))}
                        >Klimatizace</Button>
                        <Button 
                          className={cn("h-16 font-black uppercase text-xs border-2 transition-all active:scale-95", hvac.webasto ? "bg-orange-900/40 border-orange-500 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.2)]" : "bg-black border-zinc-800 text-zinc-600")}
                          onClick={() => setHvac(prev => ({ ...prev, webasto: !prev.webasto }))}
                        >Webasto</Button>
                        <Button 
                          className={cn("h-16 font-black uppercase text-xs border-2 transition-all active:scale-95", hvac.auto ? "bg-green-900/40 border-green-500 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]" : "bg-black border-zinc-800 text-zinc-600")}
                          onClick={() => setHvac(prev => ({ ...prev, auto: !prev.auto }))}
                        >Automatika</Button>
                        <Button 
                          variant="outline"
                          className={cn("h-16 font-black uppercase text-xs border-2 transition-all active:scale-95", isDarkMode ? "bg-zinc-900 border-zinc-700 text-white" : "bg-zinc-100 border-zinc-300 text-black")}
                          onClick={() => setIsDarkMode(!isDarkMode)}
                        >{isDarkMode ? 'Světlý Vzhled' : 'Tmavý Vzhled'}</Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 flex flex-col gap-4 mt-0 overflow-y-auto min-h-0 pb-40 lg:pb-0 scrollbar-none w-full h-full">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6 min-h-0 p-2"
                >
                  <div className="bg-[#050505] rounded-xl border-[6px] border-zinc-900 shadow-2xl p-6 relative overflow-visible">
                    {/* Industrial Aesthetic Plate */}
                    <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-zinc-800 shadow-inner border border-black" />
                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-zinc-800 shadow-inner border border-black" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-zinc-800 shadow-inner border border-black" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-zinc-800 shadow-inner border border-black" />

                    <div className="flex flex-col gap-6">
                      {/* Top Status Bar */}
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                        <div className="flex flex-col">
                          <h3 className="text-orange-500 font-bold uppercase tracking-[0.2em] leading-none mb-2">Crossway OIB System Settings</h3>
                          <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase text-left">Systémová konfigurace a diagnostika vozidla</span>
                        </div>
                        <Button 
                          variant="destructive" 
                          className="bg-red-900/50 hover:bg-red-600 text-red-500 hover:text-white border border-red-700 font-black uppercase"
                          onClick={() => setIsLoggedIn(false)}
                        >
                          ODHLÁSIT ŘIDIČE
                        </Button>
                      </div>

                      {/* Settings Details Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2 text-left">
                        {/* Left: General Settings */}
                        <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50 flex flex-col gap-6 shadow-inner">
                          <span className="text-[11px] text-orange-500 font-black uppercase tracking-widest">ZVUKY A DISPLEJ</span>
                          
                          <div className="bg-zinc-950/60 p-4 rounded border border-zinc-900/60 flex flex-col gap-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-400">
                               <span>Celková Hlasitost Hlášení</span>
                               <span className="text-[#ffcc00] font-mono">{busStats.volume}%</span>
                            </div>
                            <div className="flex items-center gap-4">
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white border border-zinc-800 bg-black" onClick={() => setBusStats(prev => ({ ...prev, volume: Math.max(0, prev.volume - 5) }))}>-</Button>
                               <div className="flex-1 h-2 bg-black rounded-full overflow-hidden border border-zinc-800">
                                  <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${busStats.volume}%` }} />
                               </div>
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white border border-zinc-800 bg-black" onClick={() => setBusStats(prev => ({ ...prev, volume: Math.min(100, prev.volume + 5) }))}>+</Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-2">
                            <span className="text-xs font-bold text-zinc-300 uppercase">Hlas hlasatele</span>
                            <div className="flex gap-2 bg-black p-1 rounded border border-zinc-800">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn("px-4 uppercase font-black text-[10px] h-8", selectedVoiceType === 'male' ? "bg-orange-500 text-black" : "text-zinc-500 hover:text-white")}
                                onClick={() => setSelectedVoiceType('male')}
                              >Muž</Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn("px-4 uppercase font-black text-[10px] h-8", selectedVoiceType === 'female' ? "bg-orange-500 text-black" : "text-zinc-500 hover:text-white")}
                                onClick={() => setSelectedVoiceType('female')}
                              >Žena</Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-2 pb-0">
                            <span className="text-xs font-bold text-zinc-300 uppercase">Vzhled rozhraní</span>
                            <Button 
                              variant="outline"
                              className={cn("h-10 px-4 font-black uppercase text-[10px] border", isDarkMode ? "bg-zinc-950 border-zinc-800 text-white hover:bg-zinc-900" : "bg-zinc-100 border-zinc-300 text-black hover:bg-zinc-200")}
                              onClick={() => setIsDarkMode(!isDarkMode)}
                            >{isDarkMode ? 'Tmavý vzhled' : 'Světlý vzhled'}</Button>
                          </div>
                        </div>

                        {/* Right: Deviation Calibration */}
                        <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50 flex flex-col gap-4 shadow-inner justify-between">
                          <span className="text-[11px] text-blue-500 font-black uppercase tracking-widest">KALIBRACE JÍZDNÍHO ŘÁDU</span>
                          
                          <div className="bg-zinc-950/60 p-4 rounded border border-zinc-900/60 flex items-center justify-between gap-6">
                            <div className="flex flex-col items-start">
                              <span className="text-[9px] text-zinc-500 font-black uppercase mb-1">Odchylka od JŘ</span>
                              <div className={cn("text-4xl font-mono font-black tabular-nums", deviation === 0 ? "text-green-500" : deviation > 0 ? "text-red-500" : "text-blue-400")}>
                                 {formatDeviation(deviation)}
                              </div>
                            </div>
                            <div className="flex gap-2">
                               <Button variant="outline" className="h-14 px-6 border-zinc-800 font-black text-sm bg-black hover:bg-zinc-900" onClick={() => setDeviation(prev => prev - 15)}>-15s</Button>
                               <Button variant="outline" className="h-14 px-6 border-zinc-800 font-black text-sm bg-black hover:bg-zinc-900" onClick={() => setDeviation(prev => prev + 15)}>+15s</Button>
                            </div>
                          </div>

                          <span className="text-[9px] text-zinc-500 mt-2 text-left">Doporučení: Odchylka se kalibruje automaticky na neregistrovaných zastávkách. V případě potřeby proveďte manuální korekci.</span>
                        </div>
                      </div>

                      <div className="bg-zinc-900/20 p-6 rounded-xl border border-zinc-800/40 flex flex-col md:flex-row items-center justify-between gap-6">
                         <div className="flex flex-col items-start">
                            <span className="text-[10px] text-zinc-600 font-black uppercase mb-1">STAV PALUBNÍHO INFORMAČNÍHO SYSTÉMU (OIB)</span>
                            <span className="text-sm font-bold text-zinc-400 font-mono text-left">BOSCH TRANS_NET_OIB_v5_OK</span>
                         </div>
                         <div className="flex flex-col items-center md:items-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" className="text-red-500/50 hover:text-red-500 text-xs font-black uppercase">Totální reset OIB</Button>
                              </DialogTrigger>
                              <DialogContent className={isDarkMode ? "bg-[#1a1a1a] border-zinc-800 text-white" : "bg-white text-black"}>
                                <DialogHeader><DialogTitle className="text-red-500 uppercase font-black font-sans">Potvrdit restart?</DialogTitle></DialogHeader>
                                <p className="text-sm opacity-70">Varování: Tato akce vymaže veškeré tržby a aktuální směnu z paměti terminálu.</p>
                                <div className="flex gap-4 mt-6">
                                  <Button variant="outline" className="flex-1 h-14 font-bold" onClick={() => handleActivity()}>Zrušit</Button>
                                  <Button variant="destructive" className="flex-1 h-14 font-black" onClick={handleReset}>SMAZAT VŠE</Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <span className="text-[8px] text-zinc-700 font-mono font-bold">FW: v5.0.42_IVC_XWAY • BUILD_OIB_JUNE_2026</span>
                         </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </main>

      {/* Bottom Navigation Bar */}
      <footer className={cn(
        "h-8 flex items-stretch gap-0.5 border-t border-black bg-zinc-900 z-10 shrink-0",
        !isDarkMode && "bg-gray-100"
      )}>
        {/* Modular Status Blocks */}
        <div className="flex-1 grid grid-cols-6 gap-0.5">
          {/* Time & Temp */}
          <div className="bg-[#002b5c] flex flex-col items-center justify-center border-r border-[#003366] px-1">
            <span className="text-[7px] font-black text-[#ffcc00] uppercase leading-none mb-0.5">Venku / Salón / Čas</span>
            <div className="flex items-baseline gap-1 select-none">
              <span className="text-xs font-mono font-black text-zinc-400" title="Venkovní teplota">{hvac.externalTemp}°</span>
              <span className="text-sm font-mono font-black text-cyan-400" title="Vnitřní teplota salónu">{hvac.passengerTemp.toFixed(1)}°</span>
              <span className="text-sm font-mono font-black text-[#ffcc00]">{currentTime.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Signals */}
          <div className="bg-[#002b5c] flex items-center justify-around px-2 border-r border-[#003366]">
            <div className="flex flex-col items-center">
              <div className="flex gap-0.5 mb-0.5">
                {[1,2,3,4].map(i => <div key={i} className={cn("w-1 h-3 rounded-full", i <= 3 ? "bg-blue-400" : "bg-white/10")} />)}
              </div>
              <span className="text-[6px] font-black text-blue-400">GSM</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full border border-blue-400 flex items-center justify-center mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              </div>
              <span className="text-[6px] font-black text-blue-400">GPS</span>
            </div>
          </div>

          {/* Revenue */}
          <div className="col-span-2 bg-[#002b5c] flex flex-col items-center justify-center border-r border-[#003366]">
             <span className="text-[7px] font-black text-gray-400 uppercase leading-none mb-1">Tržba Celkem</span>
             <span className="text-2xl font-black text-green-500 font-mono leading-none">
               {transactions.filter(t => !t.storno).reduce((acc, t) => acc + t.price, 0)} <span className="text-xs">Kč</span>
             </span>
          </div>

          {/* System Info */}
          <div className="bg-[#002b5c] flex flex-col items-center justify-center border-r border-[#003366]">
            <span className="text-[7px] font-black text-[#ffcc00] uppercase italic mb-0.5">Telmax OIB</span>
            <span className="text-[6px] font-mono opacity-50 uppercase">v5.0.42-STABLE</span>
          </div>

          {/* Service Buttons Trigger */}
          <Button 
            variant="ghost" 
            className="h-full bg-[#ffcc00] hover:bg-[#ffdd33] text-[#003366] rounded-none flex flex-col items-center justify-center gap-0.5 border-l border-black"
            onClick={() => setIsServiceMenuOpen(true)}
          >
            <Settings size={20} />
            <span className="text-[9px] font-black uppercase">Menu</span>
          </Button>
        </div>
      </footer>

      {/* Printing Overlay */}
      <AnimatePresence>
        {showCountdown && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center p-2"
          >
            <div className="bg-[#003366] text-[#ffcc00] px-10 py-8 rounded-[1rem] shadow-[0_0_80px_rgba(0,51,102,0.6)] flex flex-col items-center justify-center gap-4 border-[8px] border-zinc-800 relative min-w-[300px]">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-4">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <div className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <div className="text-center mt-4">
                <span className="text-[10px] uppercase font-black tracking-[0.3em] opacity-60 mb-2 block">System Diagnostic</span>
                <span className="text-8xl font-mono font-black block leading-none">{saverCountdown}</span>
                <div className="mt-4 flex flex-col items-center">
                   <div className="h-1 w-48 bg-[#ffcc00]/20 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-[#ffcc00]"
                        animate={{ width: [`${(saverCountdown/10)*100}%`, '0%'] }}
                        transition={{ duration: 10, ease: "linear" }}
                      />
                   </div>
                   <span className="text-[12px] uppercase font-black tracking-widest mt-3 animate-pulse">ÚSPORNÝ REŽIM AKTIVNÍ</span>
                </div>
              </div>
              <div className="w-full h-px bg-[#ffcc00]/20 my-2" />
              <div className="flex justify-between w-full text-[8px] font-mono opacity-50 uppercase font-bold">
                 <span>Batt: 26.4V</span>
                 <span>Air: 8.2 Bar</span>
                 <span>OIB: OK</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Printing & Payments Overlay */}
      <AnimatePresence>
        {isPrinting && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <div className={cn(
              "w-full max-w-md p-6 rounded-2xl border flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden transition-all duration-300",
              paymentProgressState === 'payment_error' 
                ? "bg-[#251010] border-red-900/50" 
                : "bg-[#18181b] border-zinc-800"
            )}>
              {/* Top Accent Ring / LED simulation */}
              <div className="absolute top-0 left-0 right-0 h-1.5 flex gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex-1 h-full transition-all duration-300",
                      paymentProgressState === 'payment_error' 
                        ? "bg-red-500 animate-pulse" 
                        : paymentProgressState === 'printing_ticket'
                        ? "bg-green-500 animate-pulse"
                        : "bg-blue-500 animate-pulse"
                    )} 
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>

              {/* Dynamic Animated Icon */}
              {paymentProgressState === 'processing_payment' && (
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-24 h-24 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                    {paymentMethod === 'card' ? (
                      <CreditCard size={32} className="text-blue-400 animate-bounce" />
                    ) : paymentMethod === 'mobile' ? (
                      <Wifi size={32} className="text-blue-400 animate-pulse" style={{ transform: 'rotate(45deg)' }} />
                    ) : (
                      <Printer size={32} className="text-blue-400" />
                    )}
                  </div>
                </div>
              )}

              {paymentProgressState === 'payment_error' && (
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500 animate-bounce">
                  <AlertOctagon size={36} className="text-red-500" />
                </div>
              )}

              {paymentProgressState === 'printing_ticket' && (
                <div className="relative flex items-center justify-center">
                  <div className="absolute -top-1 w-20 h-1 bg-zinc-700 rounded" />
                  <motion.div 
                    initial={{ y: -10, opacity: 0.5 }} 
                    animate={{ y: 5, opacity: 1 }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="flex flex-col items-center"
                  >
                    <Printer size={48} className="text-green-400" />
                  </motion.div>
                </div>
              )}

              {/* Status Header & Description */}
              <div className="text-center w-full flex flex-col gap-1">
                <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase opacity-40">
                  {paymentProgressState === 'processing_payment' ? "AUTORIZACE TRANSAKCE" : 
                   paymentProgressState === 'payment_error' ? "NEÚSPĚŠNÁ PLATBA" : "TISK JÍZDNÍHO DOKLADU"}
                </span>
                <h2 className={cn(
                  "text-xl font-black uppercase tracking-wide",
                  paymentProgressState === 'payment_error' ? "text-red-400" : "text-white"
                )}>
                  {paymentProgressState === 'processing_payment' ? "Spojování s terminálem..." : 
                   paymentProgressState === 'payment_error' ? "Transakce zamítnuta" : "Generování jízdenky"}
                </h2>
                
                {/* Simulated POS LCD terminal readout */}
                <div className={cn(
                  "mt-4 p-4 rounded-lg border font-mono text-xs font-bold uppercase tracking-wider text-center leading-relaxed",
                  paymentProgressState === 'payment_error' 
                    ? "bg-red-950/40 border-red-900/50 text-red-300 shadow-inner" 
                    : "bg-black border-zinc-800 text-yellow-500 shadow-inner"
                )}>
                  {paymentStatusText}
                </div>
              </div>

              {/* Progress bar (except on error) */}
              {paymentProgressState !== 'payment_error' && (
                <div className="w-full flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>PROGRESS STATE</span>
                    <span>{paymentProgress}%</span>
                  </div>
                  <div className="w-full h-3 bg-black rounded-full overflow-hidden border border-zinc-800 p-0.5">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        paymentProgressState === 'printing_ticket' ? "bg-green-500" : "bg-blue-500"
                      )}
                      style={{ width: `${paymentProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Actions Button */}
              {paymentProgressState === 'payment_error' && (
                <Button 
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-sm border-b-4 border-red-800 rounded-none active:border-b-0 active:translate-y-1 transition-all mt-2"
                  onClick={() => {
                    setIsPrinting(false);
                    setPaymentProgressState('idle');
                  }}
                >
                  ZPĚT K PRODEJI
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Critical System Crash Screen */}
      <AnimatePresence>
        {isCriticalError && !rebootingState && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-[#3a0606] z-50 flex items-center justify-center p-4 border-[20px] border-red-700/40 font-sans"
          >
            <div className="max-w-xl w-full bg-black p-8 rounded-2xl border-4 border-red-600 shadow-2xl flex flex-col gap-6 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl -z-10" />
              
              <div className="flex items-center gap-4 border-b border-red-900 pb-4">
                <AlertOctagon size={48} className="text-red-500 animate-pulse shrink-0" />
                <div className="flex flex-col">
                  <h1 className="text-red-500 font-mono text-2xl font-black uppercase tracking-wider">SYSTEM MALFUNCTION</h1>
                  <span className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase text-left">TELMAX HARDWARE DIAGNOSTICS</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-zinc-300 font-mono text-sm leading-relaxed">
                  Systém řidiče detekoval závažné selhání periferního rozhraní. Veškeré prodejní, tiskové i odbavovací funkce byly z bezpečnostních důvodů preventivně zablokovány.
                </p>

                <div className="bg-red-950/40 p-4 rounded border border-red-900/50 font-mono text-red-400 text-xs font-bold whitespace-pre-wrap break-all leading-relaxed shadow-inner">
                  {criticalErrorMessage || "KRITICKÁ CHYBA SYSTÉMU #E000 (ZÁPADKA CHYBÍ NEBO CHYBA CAN-BUS)"}
                </div>

                <div className="bg-zinc-950 p-4 rounded border border-zinc-900 text-zinc-500 font-mono text-[9px] list-none leading-normal">
                  <li>* TISKÁRNA JÍZDENEK: ODPOJENA / NEDOSTUPNÁ</li>
                  <li>* PLATBA CARDS: ROZHRANÍ NEKOMUNIKUJE</li>
                  <li>* CAN-BUS STATUS: ERROR FRAME TRANSMISSION</li>
                </div>
              </div>

              <Button 
                className="w-full h-16 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-base border-b-4 border-red-800 rounded-lg active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                onClick={handleRebootCashRegister}
              >
                <RefreshCw size={20} className="animate-spin-slow animate-spin" />
                RESTARTOVAT PALUBNÍ POČÍTAČ
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Linux Bootloader / System Recovery Screen */}
      <AnimatePresence>
        {rebootingState && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4 font-mono select-none"
          >
            <div className="max-w-xl w-full flex flex-col gap-6 text-left">
              {/* ASCII Header */}
              <div className="text-green-500 space-y-1 leading-none text-xs">
                <div>╔═════════════════════════════════════════════════════╗</div>
                <div className="font-extrabold text-center uppercase tracking-widest text-[#ffcc00]">TELMAX OIB - BOOTLOADER v5.0.42</div>
                <div>╚═════════════════════════════════════════════════════╝</div>
              </div>

              {/* Scrolling Terminal Log logs */}
              <div className="flex-1 bg-zinc-950 border border-zinc-800 p-4 rounded-lg h-80 overflow-y-auto text-[9px] text-green-400 font-mono space-y-1 scrollbar-thin scrollbar-thumb-zinc-800 flex flex-col justify-end">
                {rebootingState.log.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap break-all leading-normal text-left">
                    {line}
                  </div>
                ))}
                <div className="flex items-center gap-1">
                  <span className="animate-pulse">_</span>
                </div>
              </div>

              {/* Terminal Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-green-500 select-none">
                  <span>SPOUŠTĚNÍ SUBSYSTÉMŮ</span>
                  <span>{rebootingState.progress}%</span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full bg-zinc-950 border border-zinc-800 h-6 rounded-none font-mono text-[10px] text-green-400 overflow-hidden flex items-center relative px-2">
                  <div 
                    className="h-full bg-green-950 absolute left-0 top-0 opacity-60 transition-all duration-300"
                    style={{ width: `${rebootingState.progress}%` }}
                  />
                  <span className="z-10 relative font-black select-none">
                    [{'#'.repeat(Math.round(rebootingState.progress / 5)).padEnd(20, ' ')}]
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-[#00aa00] text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 border-2 border-[#00cc00]">
              <CheckCircle2 size={24} />
              <span className="text-xl font-black uppercase tracking-wider">Jízdenka prodána</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Service Menu Dialog (Global) */}
      <Dialog open={isServiceMenuOpen} onOpenChange={setIsServiceMenuOpen}>
        <DialogContent className={cn("max-w-md max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0", isDarkMode ? "bg-[#1a1a1a] border-[#3a3a3a] text-white" : "bg-white text-black")}>
          <div className="bg-[#ffcc00] p-4 flex justify-between items-center shrink-0">
            <h2 className="text-[#003366] font-black uppercase tracking-tight text-xl flex items-center gap-2">
              <Settings size={24} /> SLUŽEBNÍ MENU
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setIsServiceMenuOpen(false)} className="text-[#003366] hover:bg-black/10">
              <LogOut size={24} />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3">
             <div className="grid grid-cols-2 gap-2 pb-10">
              <Button variant="outline" className="h-24 flex flex-col gap-2 border-2 bg-zinc-900 border-zinc-800" onClick={() => { handleStartTrip(); setIsServiceMenuOpen(false); }}>
                <Clock size={32} className="text-green-500" />
                <span className="text-[10px] font-black uppercase">Zahájit jízdu</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2 border-2 bg-zinc-900 border-zinc-800" onClick={() => { setTripStartTime(null); setIsServiceMenuOpen(false); }}>
                <Clock size={32} className="text-red-500" />
                <span className="text-[10px] font-black uppercase">Zrušit jízdu</span>
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-24 flex flex-col gap-2 border-2 bg-zinc-900 border-zinc-800">
                    <MapPin size={32} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase">Služební cíle</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className={cn("max-w-md", isDarkMode ? "bg-[#1a1a1a] border-[#3a3a3a] text-white" : "bg-white text-black")}>
                  <DialogHeader><DialogTitle className="text-sm font-bold uppercase">Vyberte služební cíl</DialogTitle></DialogHeader>
                  <div className="flex flex-col gap-2">
                    {["SLUŽEBNÍ JÍZDA", "PŘESTÁVKA", "MANIPULAČNÍ JÍZDA", "ZÁLOHA", "PORUCHA"].map(goal => (
                      <Button key={goal} variant="ghost" className="h-14 text-lg font-bold" onClick={() => { setServiceDestination(goal); setIsServiceMenuOpen(false); }}>{goal}</Button>
                    ))}
                    <Button variant="destructive" onClick={() => setServiceDestination(null)}>ZRUŠIT SLUŽEBNÍ CÍL</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAnnouncementsOpen} onOpenChange={setIsAnnouncementsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-24 flex flex-col gap-2 border-2 bg-zinc-900 border-zinc-800">
                    <Megaphone size={32} className="text-orange-500" />
                    <span className="text-[10px] font-black uppercase">Doplňkové hlášení</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className={cn("max-w-md max-h-[95vh] overflow-hidden flex flex-col", isDarkMode ? "bg-[#1a1a1a] border-[#3a3a3a] text-white" : "bg-white text-black")}>
                  <DialogHeader className="shrink-0"><DialogTitle className="text-sm font-bold uppercase">Přehrát hlášení</DialogTitle></DialogHeader>
                  <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-zinc-700">
                    <div className="flex flex-col gap-1">
                      {SERVICE_ANNOUNCEMENTS.map(msg => (
                        <Button 
                          key={msg.id} 
                          variant="ghost" 
                          className="h-14 text-lg font-bold justify-start" 
                          onClick={() => { playAnnouncement(msg.text); setIsAnnouncementsOpen(false); setIsServiceMenuOpen(false); }}
                        >
                          {msg.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-24 flex flex-col gap-2 border-2 bg-zinc-900 border-zinc-800">
                    <Bus size={32} className="text-cyan-500" />
                    <span className="text-[10px] font-black uppercase">Stav vozidla</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className={cn("max-w-md", isDarkMode ? "bg-[#1a1a1a] border-[#3a3a3a] text-white" : "bg-white text-black")}>
                  <DialogHeader><DialogTitle className="text-sm font-bold uppercase">Stav vozidla Iveco Crossway</DialogTitle></DialogHeader>
                  <div className="grid grid-cols-2 gap-4 p-2">
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5 flex flex-col">
                      <span className="text-[10px] opacity-50 uppercase font-bold">Motor</span>
                      <span className="text-xl font-mono text-green-500">85°C / OK</span>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5 flex flex-col">
                      <span className="text-[10px] opacity-50 uppercase font-bold">Tlak oleje</span>
                      <span className="text-xl font-mono text-green-500">5.2 bar</span>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5 flex flex-col">
                      <span className="text-[10px] opacity-50 uppercase font-bold">AdBlue</span>
                      <span className="text-xl font-mono text-blue-400">45%</span>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5 flex flex-col">
                      <span className="text-[10px] opacity-50 uppercase font-bold">Napětí</span>
                      <span className="text-xl font-mono text-yellow-500">27.4 V</span>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="h-24 flex flex-col gap-2 border-2 bg-zinc-900 border-zinc-800" onClick={() => { setActiveTab("vehicle"); setIsServiceMenuOpen(false); handleActivity(); }}>
                <Camera size={24} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase">Kamery</span>
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-24 flex flex-col gap-2 border-2 bg-zinc-900 border-zinc-800">
                    <RefreshCw size={32} className="text-zinc-500" />
                    <span className="text-[10px] font-black uppercase">Refresh Dat</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className={cn("max-w-md", isDarkMode ? "bg-[#1a1a1a] border-[#3a3a3a] text-white" : "bg-white text-black")}>
                   <DialogHeader>
                      <DialogTitle className="uppercase font-black text-orange-500">Synchronizace</DialogTitle>
                   </DialogHeader>
                   <div className="py-8 flex flex-col items-center gap-4">
                      <RefreshCw size={48} className="text-orange-500 animate-spin" />
                      <p className="text-sm font-bold">Probíhá aktualizace jízdních řádů a tarifů...</p>
                   </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-24 flex flex-col gap-2 border-2 bg-red-900/10 border-red-500/20 hover:bg-red-900/20">
                    <RefreshCw size={32} className="text-red-500" />
                    <span className="text-[10px] font-black uppercase text-red-500">Reset Systému</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className={cn("max-w-md", isDarkMode ? "bg-[#1a1a1a] border-[#3a3a3a] text-white" : "bg-white text-black")}>
                  <DialogHeader>
                    <DialogTitle className="text-red-500 uppercase tracking-widest text-lg font-black">Potvrdit Reset?</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 text-center">
                    <p className="text-sm opacity-70">Tato akce vymaže veškerá data a uvede OIB do výchozího stavu.</p>
                    <p className="text-xl font-black mt-4 text-red-500 tracking-tighter">SMAZAT VŠE?</p>
                  </div>
                  <div className="flex gap-2">
                     <Button variant="outline" className="flex-1 h-16 font-bold" onClick={() => setIsServiceMenuOpen(false)}>Zrušit</Button>
                     <Button variant="destructive" className="flex-1 h-16 font-black uppercase" onClick={() => { handleReset(); setIsServiceMenuOpen(false); }}>Potvrdit</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="p-4 border-t border-zinc-800 shrink-0 bg-zinc-900 flex gap-2">
            <Button variant="outline" className="flex-1 h-14 bg-zinc-800 border-zinc-700 font-bold" onClick={() => setIsLoggedIn(false)}>Konec Směny</Button>
            <Button variant="outline" className="h-14 w-14 bg-zinc-800 border-zinc-700" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
