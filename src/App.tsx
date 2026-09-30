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
  LogIn,
  KeyRound,
  Coffee,
  Wind,
  Snowflake,
  Flame,
  Home,
  Users,
  RefreshCw,
  Sliders,
  ShieldAlert,
  Gauge,
  Maximize,
  Minimize,
  Compass,
  MessageSquare,
  Camera,
  Bell,
  Search,
  UserMinus,
  Phone,
  Info,
  AlertOctagon,
  HelpCircle,
  Activity,
  Zap,
  Ticket,
  Layers,
  Copy,
  Plus,
  Minus,
  Receipt,
  Sparkles,
  Calculator,
  Check
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
import { Stop, TicketType, Transaction, Route, Driver, MultilistekItem, BusWindows } from './types';
import { IvecoWindowLayout } from './components/IvecoWindowLayout';
import { cn } from '@/lib/utils';

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

  // Multilístek Feature States
  const [isMultilistekMode, setIsMultilistekMode] = useState(false);
  const [isMultilistekBuilderOpen, setIsMultilistekBuilderOpen] = useState(false);
  const [multilistekNote, setMultilistekNote] = useState("");
  const [printedTicketModalData, setPrintedTicketModalData] = useState<Transaction | null>(null);
  const [isTicketPreviewOpen, setIsTicketPreviewOpen] = useState(false);
  const [reprintingEffect, setReprintingEffect] = useState(false);
  const [lastSoldTicket, setLastSoldTicket] = useState<Transaction | null>(null);
  const [recentSaleToast, setRecentSaleToast] = useState<{ visible: boolean; message: string; ticket: Transaction | null }>({ visible: false, message: '', ticket: null });
  const [saleButtonSuccess, setSaleButtonSuccess] = useState(false);
  const [isZReportOpen, setIsZReportOpen] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyPaymentFilter, setHistoryPaymentFilter] = useState<'all' | 'cash' | 'card' | 'mobile'>('all');
  const [stornoConfirmId, setStornoConfirmId] = useState<string | null>(null);

  // Interactive Multilístek Keypad & Papírek Workflow States
  const [isMultilistekKeypadMode, setIsMultilistekKeypadMode] = useState(false);
  const [selectedMultilistekTicket, setSelectedMultilistekTicket] = useState<TicketType>(TICKET_TYPES[0]);
  const [multilistekKeypadInput, setMultilistekKeypadInput] = useState<string>("");
  const [multilistekDraftItems, setMultilistekDraftItems] = useState<{ type: TicketType; count: number }[]>([]);

  // Ticket Filtering & Search States
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState<'all' | 'basic' | 'time' | 'group' | 'luggage' | 'special'>('all');
  const [ticketSearchQuery, setTicketSearchQuery] = useState<string>("");
  const [keypadCategoryFilter, setKeypadCategoryFilter] = useState<'all' | 'basic' | 'time' | 'group' | 'luggage' | 'special'>('all');
  const [announcementCategoryFilter, setAnnouncementCategoryFilter] = useState<string>('all');
  const [announcementSearchQuery, setAnnouncementSearchQuery] = useState<string>("");
  const [builderModalCategoryFilter, setBuilderModalCategoryFilter] = useState<'all' | 'basic' | 'time' | 'group' | 'luggage' | 'special'>('all');

  // Keypad actions for Multilístek
  const handleKeypadPress = (val: string) => {
    playPaymentBeep(false);
    handleActivity();
    if (val === 'C') {
      setMultilistekKeypadInput("");
    } else if (val === 'backspace') {
      setMultilistekKeypadInput(prev => prev.slice(0, -1));
    } else {
      setMultilistekKeypadInput(prev => {
        if (prev === "" && val === "0") return "";
        if (prev.length >= 3) return prev;
        return prev + val;
      });
    }
  };

  const handleAddKeypadItemToDraft = () => {
    if (!selectedMultilistekTicket) return;
    const count = parseInt(multilistekKeypadInput, 10) || 1;
    if (count <= 0) return;

    playPaymentBeep(true);
    handleActivity();

    setMultilistekDraftItems(prev => {
      const existingIdx = prev.findIndex(item => item.type.id === selectedMultilistekTicket.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          count: updated[existingIdx].count + count
        };
        return updated;
      } else {
        return [...prev, { type: selectedMultilistekTicket, count }];
      }
    });

    // Step 3: Clear keypad display, but keep calculator and mode OPEN!
    setMultilistekKeypadInput("");
  };

  const handleRemoveDraftItem = (typeId: string) => {
    playPaymentBeep(false);
    handleActivity();
    setMultilistekDraftItems(prev => prev.filter(item => item.type.id !== typeId));
  };

  const handleConfirmDraftToCart = () => {
    if (multilistekDraftItems.length === 0) return;
    playPaymentBeep(true);
    handleActivity();

    setCart(multilistekDraftItems);
    setIsMultilistekMode(true);
    setIsMultilistekKeypadMode(false);
    setMultilistekDraftItems([]);
    setMultilistekKeypadInput("");
  };

  const handleDirectSellFromDraft = () => {
    if (multilistekDraftItems.length === 0) return;
    playPaymentBeep(true);
    handleActivity();

    const itemsToSell = [...multilistekDraftItems];
    setCart(itemsToSell);
    setIsMultilistekMode(true);
    setIsMultilistekKeypadMode(false);
    setMultilistekDraftItems([]);
    setMultilistekKeypadInput("");

    // Trigger sell immediately
    setTimeout(() => {
      handleSellTicket();
    }, 80);
  };

  // Quick preset loader for Multilístek
  const applyMultilistekPreset = (presetKey: string) => {
    const adult = TICKET_TYPES.find(t => t.id === 'adult') || TICKET_TYPES[0];
    const child = TICKET_TYPES.find(t => t.id === 'child') || TICKET_TYPES[1];
    const student = TICKET_TYPES.find(t => t.id === 'student') || TICKET_TYPES[2];
    const luggage = TICKET_TYPES.find(t => t.id === 'luggage') || TICKET_TYPES[5];
    const bike = TICKET_TYPES.find(t => t.id === 'bike') || TICKET_TYPES[10];

    let newCart: { type: TicketType; count: number }[] = [];
    let note = '';

    if (presetKey === 'rodina') {
      newCart = [
        { type: adult, count: 2 },
        { type: child, count: 2 }
      ];
      note = 'Rodinný multilístek (2+2)';
    } else if (presetKey === 'dvojice') {
      newCart = [
        { type: adult, count: 2 }
      ];
      note = 'Dvojice dospělých';
    } else if (presetKey === 'pes') {
      newCart = [
        { type: adult, count: 1 },
        { type: luggage, count: 1 }
      ];
      note = 'Cestující se psem / zavazadlem';
    } else if (presetKey === 'skola') {
      newCart = [
        { type: child, count: 10 },
        { type: adult, count: 2 }
      ];
      note = 'Školní výlet (10+2)';
    } else if (presetKey === 'studenti') {
      newCart = [
        { type: student, count: 4 }
      ];
      note = 'Skupina studentů (4 os.)';
    } else if (presetKey === 'kola') {
      newCart = [
        { type: adult, count: 2 },
        { type: bike, count: 2 }
      ];
      note = 'Turisté s koly (2+2)';
    }

    setMultilistekDraftItems(newCart);
    setIsMultilistekKeypadMode(true);
    setMultilistekNote(note);
    handleActivity();
  };
  
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

  // Sync dark class on document element so Tailwind dark: variants and CSS variables work in all modes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
  
  // Iveco Crossway Windows & Roof Hatches State
  const [busWindows, setBusWindows] = useState<BusWindows>({
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

  // HVAC Sub-View (Controls vs Iveco Window Layout)
  const [hvacSubView, setHvacSubView] = useState<'controls' | 'windows'>('controls');

  // Count of currently open windows and roof hatches
  const openWindowCount = useMemo(() => {
    return [
      busWindows.driverWindow,
      busWindows.roofHatchFront,
      busWindows.roofHatchRear,
      busWindows.leftWindow1,
      busWindows.leftWindow2,
      busWindows.leftWindow3,
      busWindows.rightWindow1,
      busWindows.rightWindow2,
      busWindows.rightWindow3
    ].filter(Boolean).length;
  }, [busWindows]);

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

  // HVAC Simulation Logic - Realistic Smooth Thermodynamics, Solar Heating & Window Ventilation
  useEffect(() => {
    const hvacTimer = setInterval(() => {
      setHvac(prev => {
        // Temperature physics:
        // When outside is warm (e.g. > 16°C), solar radiation heats the bus interior above ambient external temperature
        // Driver cabin has a large windshield and dashboard that traps heat even more (higher solar equilibrium)
        const isWarmOutside = prev.externalTemp >= 16;

        // Window Ventilation & Draft Factor:
        const openWindowCount = [
          busWindows.driverWindow,
          busWindows.roofHatchFront,
          busWindows.roofHatchRear,
          busWindows.leftWindow1,
          busWindows.leftWindow2,
          busWindows.leftWindow3,
          busWindows.rightWindow1,
          busWindows.rightWindow2,
          busWindows.rightWindow3
        ].filter(Boolean).length;

        // Effective ventilation factor (0 to 1)
        const ventFactor = Math.min(1, openWindowCount / 5);

        // Roof hatches exhaust hot rising air (stack effect / komínový efekt)
        const roofHatchVent = (busWindows.roofHatchFront ? 0.45 : 0) + (busWindows.roofHatchRear ? 0.45 : 0);

        // Solar heat accumulation is suppressed when windows and roof hatches are open
        const solarSuppression = Math.max(0, 1 - (ventFactor * 0.7 + roofHatchVent * 0.25));
        const effectiveSolarCabin = Math.max(0, 5.5 * solarSuppression);
        const effectiveSolarPassenger = Math.max(0, (3.5 + passengerCount * 0.03) * solarSuppression);

        const solarEquilibriumCabin = isWarmOutside ? prev.externalTemp + effectiveSolarCabin : prev.externalTemp;
        const solarEquilibriumPassenger = isWarmOutside ? prev.externalTemp + effectiveSolarPassenger : prev.externalTemp;
        
        let heatingIntensity = 0;
        let coolingIntensity = 0;
        let fanSpeed = prev.fanSpeed;

        if (prev.auto) {
          const pDiff = prev.targetPassengerTemp - prev.passengerTemp;
          const dDiff = prev.targetDriverTemp - prev.driverTemp;
          const maxDiff = Math.max(Math.abs(pDiff), Math.abs(dDiff));

          // In Auto mode, the HVAC computer intelligently picks fan speed 1..6
          if (maxDiff > 5) fanSpeed = 6;
          else if (maxDiff > 3) fanSpeed = 4;
          else if (maxDiff > 1.5) fanSpeed = 3;
          else if (maxDiff > 0.4) fanSpeed = 2;
          else fanSpeed = 1;

          if (pDiff > 0.3 || dDiff > 0.3) {
            heatingIntensity = Math.min(100, Math.max(pDiff, dDiff) * 20);
          } else if (prev.ac && (pDiff < -0.2 || dDiff < -0.2)) {
            coolingIntensity = Math.min(100, Math.max(Math.abs(pDiff), Math.abs(dDiff)) * 22);
          }
        } else {
          // Manual mode logic: power directly governed by user-selected fan speed (0..7)
          if (prev.webasto) {
            heatingIntensity = 100;
          } else if (prev.targetPassengerTemp > prev.passengerTemp && prev.fanSpeed > 0) {
            heatingIntensity = Math.min(100, prev.fanSpeed * 15);
          }
          
          if (prev.ac && prev.fanSpeed > 0) {
            // Cooling intensity scales cleanly with the selected fan speed (1 to 7)
            coolingIntensity = Math.min(100, prev.fanSpeed * 14.5);
          }
        }

        // 1. Natural thermodynamic drift towards ambient/solar equilibrium (slow & realistic)
        const naturalDriftRatePassenger = 0.007;
        const naturalDriftRateDriver = 0.011; // Driver cabin warms faster through windscreen
        
        const passengerDrift = (solarEquilibriumPassenger - prev.passengerTemp) * naturalDriftRatePassenger;
        const driverDrift = (solarEquilibriumCabin - prev.driverTemp) * naturalDriftRateDriver;

        // 2. Active HVAC cooling / heating effects:
        const activeAirRate = fanSpeed === 0 ? 0 : (0.006 + (fanSpeed / 7) * 0.024);
        const activeCoolRate = (coolingIntensity / 100) * activeAirRate;
        const activeHeatRate = (heatingIntensity / 100) * activeAirRate * 0.9;

        // 3. Fresh airflow from open windows & roof hatches:
        // Driving motion creates strong ram-air cross-ventilation (náporové větrání za jízdy)
        const motionFactor = isDriving ? 2.5 : 1.0;
        const salonAirExchangeRate = ventFactor * 0.022 * motionFactor;
        const driverAirExchangeRate = (busWindows.driverWindow ? 0.035 : ventFactor * 0.012) * motionFactor;

        // Salon net delta
        let pDelta = passengerDrift;
        if (coolingIntensity > 0) {
          pDelta += (prev.targetPassengerTemp - prev.passengerTemp) * activeCoolRate;
        }
        if (heatingIntensity > 0) {
          pDelta += (prev.targetPassengerTemp - prev.passengerTemp) * activeHeatRate;
        }
        // Direct cooling/air exchange towards outside ambient temp from open windows
        if (openWindowCount > 0) {
          pDelta += (prev.externalTemp - prev.passengerTemp) * salonAirExchangeRate;
        }

        // Driver Cabin net delta
        let dDelta = driverDrift;
        const driverBoost = prev.frontDefrost ? 1.25 : 1.0;
        if (coolingIntensity > 0) {
          dDelta += (prev.targetDriverTemp - prev.driverTemp) * activeCoolRate * driverBoost;
        }
        if (heatingIntensity > 0) {
          dDelta += (prev.targetDriverTemp - prev.driverTemp) * activeHeatRate * driverBoost;
        }
        // Driver window ventilation
        if (busWindows.driverWindow || openWindowCount > 0) {
          dDelta += (prev.externalTemp - prev.driverTemp) * driverAirExchangeRate;
        }

        const newPassengerTemp = Math.min(38, Math.max(10, prev.passengerTemp + pDelta));
        const newDriverTemp = Math.min(40, Math.max(10, prev.driverTemp + dDelta));

        return {
          ...prev,
          fanSpeed,
          heatingIntensity,
          coolingIntensity,
          passengerTemp: newPassengerTemp,
          driverTemp: newDriverTemp
        };
      });
    }, 1800);
    return () => clearInterval(hvacTimer);
  }, [passengerCount, busWindows, isDriving]);

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
        const scheduledMinutes = (isDriving && currentRoute.stops[currentStopIndex].arrivalMinutesFromStart !== undefined)
          ? currentRoute.stops[currentStopIndex].arrivalMinutesFromStart
          : currentRoute.stops[currentStopIndex].minutesFromStart;
        const scheduledTime = new Date(tripStartTime.getTime() + scheduledMinutes * 60000);
        const diffSeconds = Math.floor((now.getTime() - scheduledTime.getTime()) / 1000);
        setDeviation(diffSeconds);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoggedIn, isSaverActive, tripStartTime, currentRoute, currentStopIndex, isDriving]);

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
    const minutes = (isDriving && currentStop.arrivalMinutesFromStart !== undefined)
      ? currentStop.arrivalMinutesFromStart
      : currentStop.minutesFromStart;
    const date = new Date(tripStartTime.getTime() + minutes * 60000);
    return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, [tripStartTime, currentStop, isDriving]);

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
    
    // 2. Announce detour / line info based on schedule rules
    if (currentRoute.id === '120_ABX') {
      const text = "Vážení cestující, linka sto dvacet lomeno á bé iks je vedena jako náhradní kyvadlová doprava mezi zastávkami Horní Slavkov staré náměstí a Horní Slavkov Kounice. Od prvního září dva tisíce dvacet šest je v provozu výhradně o víkendech do prvního prosince dva tisíce dvacet šest, neboť v pracovních dnech jezdí běžné linky sto dvacet po své standardní trase. Děkujeme za pochopení.";
      playAnnouncement(text, false);
    } else if (currentRoute.id === '120_HALDA_WD') {
      const text = "Vážení cestující, tento spoj linky přes Haldu jede v režimu pracovních dnů přes zastávky Sídliště, Halda u mostu, Halda na mostě, na Haldě, Kounice hřiště a Kounice konečná.";
      playAnnouncement(text, false);
    } else if (currentRoute.id === '120_HALDA_WE') {
      const text = "Vážení cestující, z důvodu víkendové výluky jede tento spoj po víkendové odklonové trase přes zastávky Halda pod mostem, Halda u mostu, Halda za mostem, na Haldě a Kounice u hřiště.";
      playAnnouncement(text, false);
    } else if (currentRoute.id.endsWith('_REG') || currentRoute.id === '219') {
      const lineNo = currentRoute.number === '219' ? 'dvě stě devatenáct' : currentRoute.number.replace('/', ' lomeno ');
      const text = `Vážení cestující, linka ${lineNo} jezdí v pracovních dnech po své trase. Upozorňujeme, že o víkendech je provoz linky zrušen z důvodu uzavírky Kostelní ulice. O víkendech využijte náhradní dopravu: kyvadlovou linku sto dvacet lomeno á bé iks nebo víkendovou linku přes Haldu. Děkujeme za pochopení.`;
      playAnnouncement(text, false);
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

  const getComputedDepartureTime = (minutesOffset: number, arrivalOffset?: number) => {
    const [hours, minutes] = manualStartTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    if (arrivalOffset !== undefined && arrivalOffset !== minutesOffset) {
      const arrDate = new Date(date.getTime() + arrivalOffset * 60000);
      const depDate = new Date(date.getTime() + minutesOffset * 60000);
      return `${arrDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })} (odj ${depDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })})`;
    }
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

  const playThermalPrinterSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const bufferSize = Math.floor(audioCtx.sampleRate * 0.55);
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2600, now);
      filter.Q.setValueAtTime(3.0, now);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      for (let t = 0; t < 0.45; t += 0.035) {
        gain.gain.setValueAtTime(0.035, now + t);
        gain.gain.linearRampToValueAtTime(0.005, now + t + 0.018);
      }
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start(now);
      noise.stop(now + 0.5);

      // Paper cutter snap
      setTimeout(() => {
        try {
          const cutterOsc = audioCtx.createOscillator();
          const cutterGain = audioCtx.createGain();
          cutterOsc.type = 'triangle';
          cutterOsc.frequency.setValueAtTime(200, audioCtx.currentTime);
          cutterOsc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.07);
          cutterGain.gain.setValueAtTime(0.12, audioCtx.currentTime);
          cutterGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.07);
          cutterOsc.connect(cutterGain);
          cutterGain.connect(audioCtx.destination);
          cutterOsc.start();
          cutterOsc.stop(audioCtx.currentTime + 0.07);
        } catch (e) {}
      }, 480);
    } catch (e) {
      console.error("Printer audio error:", e);
    }
  };

  const speakNext = () => {
    if (speechQueueRef.current.length === 0) {
      isSpeakingRef.current = false;
      return;
    }
    
    isSpeakingRef.current = true;
    const nextItem = speechQueueRef.current.shift()!;
    
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
    if (route.id === "120_ABX" && stopIndex === 0) {
      const text = "Vážení cestující, linka sto dvacet lomeno á bé iks je z důvodu uzavírky Kostelní ulice a fary vedena jako kyvadlová náhradní doprava mezi zastávkami Horní Slavkov staré náměstí a Horní Slavkov Kounice. Od prvního září dva tisíce dvacet šest je v provozu výhradně o víkendech do prvního prosince dva tisíce dvacet šest, neboť v pracovních dnech jezdí běžné linky sto dvacet po své standardní trase. Děkujeme za pochopení.";
      playAnnouncement(text, false);
      return;
    }
    if (route.id === "120_HALDA_WD" && stopIndex === 0) {
      const text = "Vážení cestující, tento spoj linky přes Haldu jede v režimu pracovních dnů přes zastávky Sídliště, Halda u mostu, Halda na mostě, na Haldě, Kounice hřiště a Kounice konečná.";
      playAnnouncement(text, false);
      return;
    }
    if (route.id === "120_HALDA_WE" && stopIndex === 0) {
      const text = "Vážení cestující, z důvodu víkendové výluky jede tento spoj po víkendové odklonové trase přes zastávky Halda pod mostem, Halda u mostu, Halda za mostem, na Haldě a Kounice u hřiště.";
      playAnnouncement(text, false);
      return;
    }
    if ((route.id.endsWith('_REG') || route.id === '219') && stopIndex === 0) {
      const lineNo = route.number === '219' ? 'dvě stě devatenáct' : route.number.replace('/', ' lomeno ');
      const text = `Vážení cestující, linka ${lineNo} jezdí v pracovních dnech po své trase. Upozorňujeme, že o víkendech je provoz linky zrušen z důvodu uzavírky Kostelní ulice. O víkendech využijte náhradní dopravu: kyvadlovou linku sto dvacet lomeno á bé iks nebo víkendovou linku přes Haldu. Děkujeme za pochopení.`;
      playAnnouncement(text, false);
      return;
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
      const newMinutes = totalMin - stop.minutesFromStart;
      const newArrival = stop.arrivalMinutesFromStart !== undefined
        ? Math.max(0, newMinutes - (stop.minutesFromStart - stop.arrivalMinutesFromStart))
        : undefined;
      return {
        ...stop,
        kmFromStart: Math.round((totalKm - stop.kmFromStart) * 10) / 10,
        minutesFromStart: newMinutes,
        arrivalMinutesFromStart: newArrival
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

  const handleLogin = (pinToUse?: string) => {
    const enteredPin = (typeof pinToUse === 'string' ? pinToUse : pin).trim();
    const driver = DRIVERS.find(d => d.pin === enteredPin);
    if (driver) {
      setCurrentDriver(driver);
      setIsLoggedIn(true);
      setPin('');
      handleActivity();
      try {
        playAnnouncement(`Vítejte ve službě, řidiči ${driver.name}. Dopravní podnik Horní Slavkov.`);
      } catch (e) {}
    } else {
      alert('Nesprávný PIN. Zadejte platný PIN (např. 260308 pro Štěpána Stredniho) nebo použijte rychlé přihlášení.');
      setPin('');
    }
  };

  const handleBypassLogin = (driverId: string = 'd4') => {
    const driver = DRIVERS.find(d => d.id === driverId) || DRIVERS[0];
    setCurrentDriver(driver);
    setIsLoggedIn(true);
    setPin('');
    handleActivity();
    try {
      playAnnouncement(`Vítejte ve službě, řidiči ${driver.name}. Dopravní podnik Horní Slavkov.`);
    } catch (e) {}
  };

  const handleForceUnlockPrinter = () => {
    setIsPrinting(false);
    setPaymentProgressState('idle');
    setPaymentStatusText('');
    setPaymentProgress(0);
    handleActivity();
  };

  const handleReset = () => {
    setIsLoggedIn(false);
    setCurrentDriver(null);
    setPin('');
    setIsPrinting(false);
    setPaymentProgressState('idle');
    setPaymentStatusText('');
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
    setBusWindows({
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
    setHvacSubView('controls');
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
    if (cart.length === 0) return;
    handleActivity();

    // If somehow isPrinting is stuck, force unlock
    if (isPrinting) {
      handleForceUnlockPrinter();
      return;
    }

    setIsPrinting(true);
    setPaymentProgress(0);
    setPaymentProgressState('processing_payment');

    // Failsafe watchdog timer: guarantees the button NEVER gets stuck
    const watchdogTimer = setTimeout(() => {
      setIsPrinting(false);
      setPaymentProgressState('idle');
      setPaymentStatusText('');
    }, 2500);

    const ticketsCount = cart.reduce((acc, item) => acc + item.count, 0);
    const method = paymentMethod;

    if (method === 'cash') {
      // CASH FLOW: Instantaneous (<100ms)
      setPaymentStatusText("HOTOVOST: PŘIJATO");
      setPaymentProgress(100);
      setPaymentProgressState('printing_ticket');

      setTimeout(() => {
        clearTimeout(watchdogTimer);
        executeFinalTicketSale(ticketsCount);
      }, 80);

    } else {
      // CARD or MOBILE OR QR FLOW: Fast and responsive
      const isMobile = method === 'mobile';
      setPaymentStatusText(isMobile ? "PŘILOŽTE MOBIL / HODINKY..." : "PŘILOŽTE PLATEBNÍ KARTU...");
      setPaymentProgress(40);

      // Simulating Card Tap Sound
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(1800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      } catch (e) {}

      setTimeout(() => {
        setPaymentStatusText("PLATBA SCHVÁLENA! TISK...");
        setPaymentProgress(100);
        setPaymentProgressState('printing_ticket');
        playPaymentBeep(true);

        setTimeout(() => {
          clearTimeout(watchdogTimer);
          executeFinalTicketSale(ticketsCount);
        }, 120);
      }, 200);
    }
  };

  const executeFinalTicketSale = (ticketsCount: number) => {
    try {
      if (cart.length === 0) return;

      const isMulti = isMultilistekMode || cart.length > 1;
      let createdTransaction: Transaction;

      if (isMulti) {
        const multilistekItems: MultilistekItem[] = cart.map(item => ({
          type: item.type,
          count: item.count,
          unitPrice: calculatePrice(currentStop, destinationStop, item.type),
          totalPrice: calculatePrice(currentStop, destinationStop, item.type) * item.count
        }));
        const totalAmount = multilistekItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
        const totalPersons = multilistekItems.reduce((acc, curr) => acc + curr.count, 0);
        const ticketCode = `ML-2026-${Math.floor(10000 + Math.random() * 90000)}`;

        createdTransaction = {
          id: Math.random().toString(36).substring(2, 11),
          timestamp: new Date(),
          fromStop: currentStop.name,
          toStop: destinationStop.name,
          ticketType: `MULTILÍSTEK (${totalPersons} položek)`,
          price: totalAmount,
          isMultilistek: true,
          multilistekItems: multilistekItems,
          totalPassengers: totalPersons,
          paymentMethod: paymentMethod.toUpperCase(),
          ticketCode: ticketCode,
          note: multilistekNote.trim() || undefined
        };

        setPassengerCount(prev => prev + totalPersons);
        setTotalBoarded(prev => prev + totalPersons);
        
        const destStopId = currentRoute.stops[selectedDestinationIndex]?.id;
        if (destStopId) {
          setPassengersByStop(prev => ({
            ...prev,
            [destStopId]: (prev[destStopId] || 0) + totalPersons
          }));
        }

        setTransactions(prev => [createdTransaction, ...prev].slice(0, 300));
        setPrintedTicketModalData(createdTransaction);
        setLastSoldTicket(createdTransaction);
        playThermalPrinterSound();
      } else {
        const item = cart[0];
        const unitPrice = calculatePrice(currentStop, destinationStop, item.type);
        const totalPrice = unitPrice * item.count;
        const ticketCode = `JIZ-2026-${Math.floor(10000 + Math.random() * 90000)}`;

        createdTransaction = {
          id: Math.random().toString(36).substring(2, 11),
          timestamp: new Date(),
          fromStop: currentStop.name,
          toStop: destinationStop.name,
          ticketType: `${item.count}x ${item.type.name}`,
          price: totalPrice,
          isMultilistek: false,
          totalPassengers: item.count,
          paymentMethod: paymentMethod.toUpperCase(),
          ticketCode: ticketCode
        };

        setPassengerCount(prev => prev + item.count);
        setTotalBoarded(prev => prev + item.count);
        
        const destStopId = currentRoute.stops[selectedDestinationIndex]?.id;
        if (destStopId) {
          setPassengersByStop(prev => ({
            ...prev,
            [destStopId]: (prev[destStopId] || 0) + item.count
          }));
        }

        setTransactions(prev => [createdTransaction, ...prev].slice(0, 300));
        setPrintedTicketModalData(createdTransaction);
        setLastSoldTicket(createdTransaction);
        playThermalPrinterSound();
      }

      setCart([]);
      setMultilistekNote("");
      setIsMultilistekMode(false);
      setSaleButtonSuccess(true);
      setTimeout(() => setSaleButtonSuccess(false), 1800);

      // Trigger non-intrusive driver toast
      setRecentSaleToast({
        visible: true,
        message: `Vydána jízdenka: ${createdTransaction.price} Kč (${createdTransaction.fromStop} → ${createdTransaction.toStop})`,
        ticket: createdTransaction
      });
      setTimeout(() => {
        setRecentSaleToast(prev => ({ ...prev, visible: false }));
      }, 4000);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1200);
    } catch (err) {
      console.error("Ticket sale processing:", err);
    } finally {
      setIsPrinting(false);
      setPaymentProgressState('idle');
      setPaymentStatusText('');
      setPaymentProgress(0);
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

  // Welcome Screen & Driver Login
  if (!isLoggedIn) {
    return (
      <div 
        className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col justify-between p-4 md:p-8 font-sans select-none overflow-y-auto"
        onKeyDown={(e) => {
          if (e.key >= '0' && e.key <= '9') {
            if (pin.length < 8) setPin(prev => prev + e.key);
          } else if (e.key === 'Enter') {
            handleLogin();
          } else if (e.key === 'Backspace') {
            setPin(prev => prev.slice(0, -1));
          } else if (e.key === 'Escape') {
            setPin('');
          }
        }}
        tabIndex={0}
      >
        {/* Welcome Header */}
        <header className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3.5">
            <div className="bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-black px-3.5 py-1.5 rounded-lg text-2xl italic tracking-tight shadow-md flex items-center gap-1.5">
              <span>TELMAX</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-black tracking-wider text-amber-400 uppercase">
                Dopravní podnik Horní Slavkov
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Palubní terminál OIB Touch · Iveco Crossway LE 12M
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-2xl font-mono font-black text-amber-400 tracking-tight tabular-nums">
                {currentTime.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                {currentTime.toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full text-emerald-400 text-xs font-bold shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-emerald-500/30" />
              SYSTÉM PŘIPRAVEN
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="w-full max-w-5xl mx-auto my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Quick Bypass & Driver Cards */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-4">
            {/* Quick Bypass Hero Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800/90 shadow-2xl flex flex-col gap-4 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Bus size={18} className="text-amber-400" />
                  </div>
                  <h2 className="text-lg font-black uppercase text-white tracking-wide">
                    Nástup do služby DPHS
                  </h2>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-amber-400 px-3 py-1 rounded-full border border-slate-700">
                  Vůz #4208
                </span>
              </div>
              
              <p className="text-xs text-slate-300 leading-relaxed">
                Vozidlo <strong className="text-white font-bold">Iveco Crossway LE Line 12M</strong> je připraveno pro obsluhu linek v Horním Slavkově a integrovaného systému. Zvolte rychlý vstup do kabiny nebo se identifikujte osobním PINem.
              </p>

              {/* Fast Bypass Login Button */}
              <Button
                className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-98 text-slate-950 font-black text-base uppercase rounded-xl shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-3 cursor-pointer"
                onClick={() => handleBypassLogin('d4')}
              >
                <LogIn size={22} className="stroke-[2.5]" />
                RYCHLÝ VSTUP DO KABINY (BEZ PINU)
              </Button>
            </div>

            {/* Quick Driver Selection */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 flex flex-col gap-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Řidiči ve směně
                </span>
                <span className="text-[11px] text-slate-500 font-mono">1-Kliknutím pro přihlášení</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DRIVERS.map((d) => {
                  const isStepan = d.id === 'd4';
                  return (
                    <div
                      key={d.id}
                      className={cn(
                        "p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all cursor-pointer group",
                        isStepan 
                          ? "bg-amber-500/10 border-amber-500/40 hover:border-amber-400 shadow-sm" 
                          : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                      )}
                      onClick={() => handleBypassLogin(d.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold",
                            isStepan ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-slate-300"
                          )}>
                            <User size={15} />
                          </div>
                          <span className={cn("text-xs font-bold", isStepan ? "text-white font-black" : "text-slate-300")}>
                            {d.name}
                          </span>
                        </div>
                        {isStepan && (
                          <span className="text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                            Aktivní
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px] font-mono text-slate-500">
                          Kód: {d.pin}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={cn(
                            "h-6 px-2.5 text-[10px] font-black uppercase rounded-lg cursor-pointer",
                            isStepan 
                              ? "bg-amber-500 hover:bg-amber-400 text-slate-950" 
                              : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLogin(d.pin);
                          }}
                        >
                          Zvolit
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Keypad & PIN Terminal */}
          <div className="lg:col-span-5 flex flex-col">
            <Card className="flex-1 bg-slate-900/90 border-slate-800 p-6 flex flex-col justify-between gap-4 shadow-2xl rounded-2xl backdrop-blur-xl">
              <div className="text-center">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 block mb-1">
                  Odbavovací terminál
                </span>
                <h3 className="text-white text-lg font-black uppercase tracking-wide">
                  Zadejte PIN řidiče
                </h3>
              </div>

              {/* PIN Display */}
              <div className="bg-[#05080e] p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-1.5 shadow-inner min-h-[76px]">
                <div className="flex items-center gap-2.5">
                  <KeyRound size={20} className="text-amber-400 opacity-80" />
                  <span className="text-3xl font-mono font-black text-amber-400 tracking-[0.5rem] tabular-nums">
                    {pin.length > 0 ? pin.split('').map(() => '●').join('') : '••••••'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {pin.length > 0 ? `Zadáno ${pin.length} znaků (např. 260308)` : 'Zadejte osobní PIN (např. 260308 pro Štěpána)'}
                </span>
              </div>

              {/* Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: '1' }, { key: '2' }, { key: '3' },
                  { key: '4' }, { key: '5' }, { key: '6' },
                  { key: '7' }, { key: '8' }, { key: '9' },
                  { key: 'C', label: 'SMAZAT', cls: 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-bold' },
                  { key: '0' },
                  { key: '⌫', label: 'ZPĚT', cls: 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700' }
                ].map((item) => (
                  <Button
                    key={item.key}
                    variant="outline"
                    className={cn(
                      "h-12 text-xl font-mono font-bold border active:scale-95 transition-all select-none cursor-pointer",
                      item.cls || "bg-slate-950/80 border-slate-800 text-white hover:bg-slate-800 hover:border-slate-700"
                    )}
                    onClick={() => {
                      if (item.key === 'C') setPin('');
                      else if (item.key === '⌫') setPin(prev => prev.slice(0, -1));
                      else if (pin.length < 8) setPin(prev => prev + item.key);
                    }}
                  >
                    {item.label || item.key}
                  </Button>
                ))}
              </div>

              {/* Submit Button */}
              <Button
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-base uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => handleLogin()}
                disabled={pin.length === 0}
              >
                <CheckCircle2 size={18} />
                POTVRDIT PIN (PŘIHLÁSIT)
              </Button>
            </Card>
          </div>
        </main>

        {/* Welcome Footer / Diagnostic Status */}
        <footer className="w-full max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-500 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span>DPHS Horní Slavkov · Provozovna 1</span>
            <span>·</span>
            <span>Linky: 120, 120/A, 120/B, 120/ABx</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 font-bold">GPS: 12 SAT (OK)</span>
            <span className="text-emerald-400 font-bold">TISKÁRNA: PŘIPRAVENA</span>
            <span className="text-sky-400 font-bold">DISPEČINK: ONLINE</span>
          </div>
        </footer>
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
            ? "bg-[#070b12] text-slate-100" 
            : "bg-slate-100 text-slate-900"
        )}
        onClick={() => setIsSaverActive(false)}
      >
        {/* Top Status Info */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full max-w-5xl justify-center z-10 px-4">
          <div className={cn(
            "px-4 py-2.5 rounded-xl border flex flex-col items-center min-w-[110px] shadow-lg backdrop-blur-md",
            isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
          )}>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest mb-0.5",
              isDarkMode ? "text-slate-400" : "text-slate-500"
            )}>Nástup</span>
            <span className={cn(
              "text-xl font-mono font-black tabular-nums",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>{scheduledDeparture}</span>
          </div>
          
          <div className={cn(
            "px-4 py-2.5 rounded-xl border flex flex-col items-center min-w-[110px] shadow-lg backdrop-blur-md",
            isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
          )}>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest mb-0.5",
              isDarkMode ? "text-slate-400" : "text-slate-500"
            )}>Zpoždění</span>
            <span className={cn(
              "text-xl font-mono font-black tabular-nums",
              deviation === 0 ? "text-emerald-400" : deviation > 0 ? "text-amber-400" : "text-sky-400"
            )}>
              {formatDeviation(deviation)}
            </span>
          </div>

          <div className={cn(
            "px-4 py-2.5 rounded-xl border flex flex-col items-center min-w-[110px] shadow-lg backdrop-blur-md",
            isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
          )}>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest mb-0.5",
              isDarkMode ? "text-slate-400" : "text-slate-500"
            )}>Cestující</span>
            <div className="flex items-center gap-1.5">
              <Users size={14} className={isDarkMode ? "text-amber-400" : "text-amber-600"} />
              <span className={cn(
                "text-xl font-mono font-black tabular-nums",
                isDarkMode ? "text-white" : "text-slate-900"
              )}>{passengerCount}</span>
            </div>
          </div>

          <div className={cn(
            "px-4 py-2.5 rounded-xl border flex flex-col items-center min-w-[110px] shadow-lg backdrop-blur-md",
            isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
          )}>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest mb-0.5",
              isDarkMode ? "text-slate-400" : "text-slate-500"
            )}>{isDriving ? "Příští" : "Aktuální"}</span>
            <span className={cn(
              "text-base font-black tracking-tight line-clamp-1",
              isDarkMode ? "text-amber-400" : "text-slate-800"
            )}>
              {currentStop.name.replace('Horní Slavkov ', '')}
            </span>
          </div>
        </div>

        {/* Giant Clock Centerpiece */}
        <div className="flex flex-col items-center gap-4 z-10 w-full max-w-3xl px-4">
          <div className={cn(
            "w-full px-8 py-8 rounded-3xl border shadow-2xl transition-all duration-700 flex flex-col items-center backdrop-blur-xl",
            isDarkMode 
              ? "bg-slate-900/90 border-slate-800 shadow-amber-500/5" 
              : "bg-white/95 border-slate-200 shadow-xl"
          )}>
            <span className={cn(
              "text-xs uppercase font-black tracking-[0.4em] mb-4 block text-center",
              isDarkMode ? "text-amber-400" : "text-slate-600"
            )}>PŘESNÝ ČAS DISPEČINKU</span>
            
            <div className={cn(
              "text-7xl sm:text-8xl md:text-9xl font-mono font-black tracking-tighter tabular-nums flex items-baseline justify-center leading-none",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>
              {currentTime.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
              <span className={cn(
                "text-3xl sm:text-5xl ml-2 font-mono font-bold opacity-40",
                isDarkMode ? "text-amber-400" : "text-slate-400"
              )}>
                {currentTime.toLocaleTimeString('cs-CZ', { second: '2-digit' })}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-1.5 mt-2">
            <div className={cn(
              "text-xs font-black uppercase tracking-widest opacity-60",
              isDarkMode ? "text-slate-400" : "text-slate-500"
            )}>
              {isDriving ? (currentStopIndex === currentRoute.stops.length - 1 ? "Konečná zastávka" : "Příští zastávka") : "Aktuální stanice"}
            </div>
            <div className={cn(
              "text-2xl sm:text-4xl font-black uppercase text-center",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>
              {currentStop.name}
            </div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 mt-1">
              <span>Linka {currentRoute.number}</span>
              <span>·</span>
              <span>Směr {destinationStop.name}</span>
            </div>
          </div>
        </div>

        {/* Bottom Interaction Guide */}
        <motion.div 
          animate={{ 
            opacity: [0.5, 1, 0.5],
            y: [0, -3, 0] 
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 z-10"
        >
           <div className={cn(
             "h-1 w-16 rounded-full",
             isDarkMode ? "bg-amber-400/40" : "bg-slate-400"
           )} />
           <span className={cn(
             "text-xs font-black uppercase tracking-widest",
             isDarkMode ? "text-amber-400" : "text-slate-600"
           )}>
             Klepnutím probudíte terminál
           </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "min-h-screen h-[100dvh] flex flex-col transition-colors duration-500 overflow-hidden font-sans select-none",
        isDarkMode ? "bg-[#090d16] text-slate-100" : "bg-[#f1f5f9] text-slate-900"
      )}
      onMouseMove={handleActivity}
      onClick={handleActivity}
    >
      {/* Top Status Bar */}
      <header className={cn(
        "h-14 min-h-[56px] px-3 sm:px-4 flex items-center justify-between border-b shadow-sm z-20 relative transition-colors",
        isDarkMode ? "bg-[#0d131f] border-slate-800/80" : "bg-white border-slate-200"
      )}>
        {/* Left Side: Brand & Route */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-md text-base italic tracking-tight shadow-sm shrink-0 select-none">
            TELMAX
          </div>
          <div className={cn(
            "font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wider hidden sm:inline-block shrink-0 border",
            isDarkMode ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-100 text-slate-700 border-slate-200"
          )}>
            IVECO LE
          </div>
          <div className="flex flex-col min-w-0 pr-1">
            <div className="flex items-center gap-2 leading-none">
              <span className={cn(
                "text-[10px] font-mono font-bold uppercase truncate",
                isDarkMode ? "text-slate-400" : "text-slate-500"
              )}>
                Linka {currentRoute.number} · {currentRoute.name}
              </span>
            </div>
            <span className={cn(
              "text-sm font-black leading-tight truncate mt-0.5",
              isDarkMode ? "text-amber-400" : "text-slate-900"
            )}>
              {currentStop.name}
            </span>
          </div>
        </div>
        
        {/* Right Side: Dual Temps, Deviation, Time & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Dual Temperature Badge (Kabina + Salón + Venku) */}
          <div 
            className={cn(
              "flex flex-col items-center justify-center px-2.5 py-1 rounded-lg border shadow-xs shrink-0 cursor-pointer transition-colors select-none",
              isDarkMode ? "bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
            )}
            onClick={() => {
              setActiveTab("hvac");
              handleActivity();
            }}
            title="Klimatizace & Okna: Kabina / Salón / Venku"
          >
            <div className="flex items-center gap-1.5 text-[8px] uppercase font-black tracking-wider leading-none mb-0.5">
              <span className="text-amber-400">Kabina</span>
              <span className="opacity-30">/</span>
              <span className="text-sky-400">Salón</span>
              <span className="opacity-30">/</span>
              <span className="opacity-60">Venku</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs font-black leading-none tabular-nums">
              {hvac.ac ? (
                <Snowflake size={11} className="text-sky-400 animate-spin-slow" />
              ) : hvac.webasto ? (
                <Flame size={11} className="text-red-500 animate-pulse" />
              ) : hvac.externalTemp > 20 ? (
                <Sun size={11} className="text-amber-400" />
              ) : (
                <Wind size={11} className="text-emerald-400" />
              )}
              <span className="text-amber-400">{hvac.driverTemp.toFixed(1)}°</span>
              <span className="opacity-30">|</span>
              <span className="text-sky-400">{hvac.passengerTemp.toFixed(1)}°</span>
              <span className="opacity-30">|</span>
              <span className="opacity-60 text-[11px]">{hvac.externalTemp}°</span>
            </div>
          </div>

          {/* Schedule Deviation Badge (Odchylka od JŘ) */}
          <div className={cn(
            "flex flex-col items-center justify-center px-2.5 py-1 rounded-lg border shadow-xs shrink-0 select-none min-w-[70px]",
            isDarkMode ? "bg-slate-900/90 border-slate-800" : "bg-slate-50 border-slate-200"
          )}>
            <span className={cn(
              "text-[8px] uppercase font-black tracking-wider mb-0.5 leading-none",
              isDarkMode ? "text-slate-400" : "text-slate-500"
            )}>
              Odchylka
            </span>
            <div className={cn(
              "text-xs sm:text-sm font-mono font-black tabular-nums leading-none",
              deviation === 0 ? "text-emerald-400" : 
              deviation > 0 ? "text-rose-400" : "text-sky-400"
            )}>
              {formatDeviation(deviation)}
            </div>
          </div>

          {/* Current Time */}
          <div className={cn(
            "hidden md:flex flex-col items-end shrink-0 px-1 select-none",
            isDarkMode ? "text-white" : "text-slate-900"
          )}>
             <span className="text-[8px] text-slate-400 uppercase font-black leading-none mb-0.5">Čas</span>
             <span className="text-sm font-mono font-black leading-none tabular-nums text-amber-400">
               {currentTime.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
             </span>
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Gong / Volume Mute toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsGongEnabled(!isGongEnabled)}
              className={cn(
                "h-9 w-9 rounded-lg border transition-all flex items-center justify-center cursor-pointer",
                isGongEnabled 
                  ? (isDarkMode ? "text-sky-400 border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20" : "text-sky-600 border-sky-200 bg-sky-50 hover:bg-sky-100")
                  : (isDarkMode ? "text-slate-500 border-slate-800 bg-slate-900" : "text-slate-400 border-slate-200 bg-slate-100")
              )}
              title={isGongEnabled ? "Hlášení stanic aktivní" : "Hlášení stanic ztlumeno"}
            >
              <Volume2 size={17} />
            </Button>

            {/* Dispečink Phone */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsPhoneOpen(true)}
              className={cn(
                "h-9 w-9 rounded-lg border transition-all flex items-center justify-center cursor-pointer",
                isDarkMode 
                  ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20" 
                  : "text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
              )}
              title="Volat centrální dispečink"
            >
              <Phone size={17} />
            </Button>

            {/* Power / Screen Saver */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSaverActive(true)}
              className={cn(
                "h-9 w-9 rounded-lg border transition-all flex items-center justify-center cursor-pointer",
                isDarkMode 
                  ? "text-rose-400 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20" 
                  : "text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100"
              )}
              title="Úsporný režim obrazovky"
            >
              <Power size={17} />
            </Button>

            {/* Day / Night Mode Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => { setIsDarkMode(!isDarkMode); handleActivity(); }}
              className={cn(
                "h-9 w-9 rounded-lg border transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95",
                isDarkMode 
                  ? "text-amber-300 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20" 
                  : "text-amber-600 border-amber-300 bg-amber-50 hover:bg-amber-100"
              )}
              title={isDarkMode ? "Přepnout na denní režim" : "Přepnout na noční režim"}
            >
              {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
            </Button>

            {/* Fullscreen Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleFullscreen}
              className={cn(
                "h-9 w-9 rounded-lg font-black border transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95",
                isFullscreen 
                  ? "bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400" 
                  : (isDarkMode ? "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100")
              )}
              title={isFullscreen ? "Ukončit celou obrazovku" : "Režim celé obrazovky"}
            >
              {isFullscreen ? <Minimize size={17} strokeWidth={2.5} /> : <Maximize size={17} strokeWidth={2.5} />}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-1 p-1 sm:p-1.5 overflow-hidden">
        {/* Left Column: Route Progress & Driver Controls */}
        <div className={cn(
          "hidden lg:flex lg:w-1/4 max-w-xs flex-col shrink-0 rounded-xl border transition-colors overflow-hidden",
          isDarkMode ? "bg-[#0d131f] border-slate-800/80" : "bg-white border-slate-200 shadow-sm"
        )}>
          <div className="flex-1 flex flex-col min-h-0">
             {/* Current Station Large Display */}
             <div className={cn(
               "p-3.5 border-b",
               isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-slate-50 border-slate-200"
             )}>
                <span className={cn("text-[9px] font-black uppercase tracking-wider mb-1 block", isDarkMode ? "text-amber-400" : "text-amber-600")}>Aktuální stanice</span>
                <div className="flex items-center justify-between gap-2">
                   <h2 className={cn(
                     "text-xl font-black uppercase tracking-tight truncate leading-tight",
                     isDarkMode ? "text-white" : "text-slate-900"
                   )}>
                     {currentStop.name}
                   </h2>
                   <Badge className="font-mono font-black h-5 px-2 bg-amber-400 text-slate-950 border-none shrink-0">
                     Zóna {currentStop.zone}
                   </Badge>
                </div>
             </div>

             {/* Passengers Stats */}
             <div className={cn(
               "p-3 border-b flex items-center justify-between transition-colors",
               isDarkMode ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-100"
             )}>
                <div className="flex items-center gap-2.5">
                   <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                     <Users size={17} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase text-slate-400 leading-none mb-1">Cestující ve voze</span>
                      <span className={cn(
                        "text-xl font-mono font-black leading-none",
                        isDarkMode ? "text-white" : "text-slate-900"
                      )}>{passengerCount}</span>
                   </div>
                </div>
                {passengersByStop[currentStop.id] > 0 && (
                  <div className="bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/30 flex flex-col items-end">
                     <span className="text-[8px] font-black text-rose-400 uppercase leading-none">Vystoupí</span>
                     <span className="text-xs font-mono font-black text-rose-400">-{passengersByStop[currentStop.id]}</span>
                  </div>
                )}
             </div>

             {/* Next Stops Timeline List */}
             <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                {currentRoute.stops.map((stop, idx) => (
                  <div 
                    key={stop.id} 
                    className={cn(
                      "p-2.5 rounded-lg flex items-center justify-between transition-colors",
                      idx === currentStopIndex 
                        ? (isDarkMode ? "bg-amber-500/15 border border-amber-500/40 text-amber-300" : "bg-amber-50 border border-amber-300 text-amber-900") 
                        : idx < currentStopIndex 
                          ? "opacity-35" 
                          : (isDarkMode ? "bg-slate-900/40 border border-slate-800/60" : "bg-slate-50 border border-slate-200")
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                       <div className={cn(
                         "w-2.5 h-2.5 rounded-full shrink-0",
                         idx === currentStopIndex ? "bg-amber-400 ring-4 ring-amber-500/20 animate-pulse" : 
                         idx < currentStopIndex ? "bg-slate-600" : "bg-sky-500"
                       )} />
                       <div className="flex flex-col min-w-0">
                         <span className={cn(
                           "text-xs font-bold uppercase truncate",
                           idx === currentStopIndex 
                             ? (isDarkMode ? "text-amber-400 font-black" : "text-amber-800 font-black") 
                             : (isDarkMode ? "text-slate-200" : "text-slate-800")
                         )}>
                           {stop.name}
                         </span>
                         {idx === currentStopIndex && stop.arrivalMinutesFromStart !== undefined && stop.arrivalMinutesFromStart !== stop.minutesFromStart && (
                           <span className="text-[9px] font-mono font-bold text-amber-400 leading-tight">
                             {isDriving ? `Příjezd: ${stop.arrivalMinutesFromStart}m` : `Odjezd: ${stop.minutesFromStart}m (stání 2m)`}
                           </span>
                         )}
                       </div>
                    </div>
                    {idx > currentStopIndex && (
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">+{stop.minutesFromStart - currentStop.minutesFromStart}m</span>
                    )}
                  </div>
                ))}
             </div>

              {/* Route Navigation Controls */}
              <div className={cn(
                "p-2.5 border-t grid grid-cols-3 gap-1.5 transition-colors",
                isDarkMode ? "bg-slate-900/90 border-slate-800" : "bg-slate-50 border-slate-200"
              )}>
                <Button 
                  variant="outline" 
                  className={cn(
                    "h-12 font-bold text-xs uppercase rounded-xl border transition-all select-none cursor-pointer",
                    isDarkMode 
                      ? "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800" 
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  )}
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
                  className={cn(
                    "h-12 font-bold text-xs uppercase rounded-xl border flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all select-none cursor-pointer",
                    isDarkMode 
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20" 
                      : "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
                  )}
                  onClick={handleAnnounceStop}
                  disabled={!nextStop}
                >
                  <Megaphone size={15} />
                  <span className="text-[9px]">HLÁSIT</span>
                </Button>
                <Button 
                  onClick={() => {
                    if (isDriving) {
                      const offCount = passengersByStop[currentStop.id] || 0;
                      setPassengerCount(prev => Math.max(0, prev - offCount));
                      setIsDriving(false);
                    } else {
                      if (nextStop) {
                        playAnnouncement(currentStop.name, true); 
                        setPassengersByStop(prev => ({ ...prev, [currentStop.id]: 0 }));
                        const isNextLast = (currentStopIndex + 1) === (currentRoute.stops.length - 1);
                        
                        if ((currentRoute.name.includes("Výluka") || currentRoute.id.includes("VYL")) && currentStopIndex === 0) {
                          const isDetourC = currentRoute.id === "120C1_VYL" || currentRoute.id === "120C2_VYL";
                          if (!isDetourC) {
                            const lineNo = currentRoute.number.replace('/', ' lomeno ');
                            let detourStops = currentRoute.stops.slice(-3).map(s => s.name.replace('(Náhradní)', 'náhradní')).join(', ');
                            const detourText = `Upozornění pro cestující. Z důvodu výluky je linka ${lineNo} odkloněna přes zastávky ${detourStops}.`;
                            playAnnouncement(detourText, false);
                          }
                        }
                        
                        checkForDetourAnnouncement(currentRoute, currentStopIndex);
                        let nextText = `Příští zastávka: ${nextStop.name}`;
                        if (nextStop.isOnDemand) nextText += `. Na znamení.`;
                        if (isNextLast) nextText += `. Konečná zastávka.`;
                        playAnnouncement(nextText, true);
                        
                        setCurrentStopIndex(prev => prev + 1);
                        setIsDriving(true);
                      }
                    }
                    setStopRequest(false);
                    handleActivity();
                  }}
                  disabled={!nextStop && !isDriving}
                  className={cn(
                    "h-12 font-black leading-none uppercase text-xs rounded-xl transition-all shadow-md active:scale-95 select-none cursor-pointer",
                    isDriving 
                      ? "bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950" 
                      : (nextStop ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-rose-600 hover:bg-rose-500 text-white")
                  )}
                >
                  {isDriving ? "PŘÍJEZD" : (nextStop ? "ODJEZD" : "KONEC")}
                </Button>
             </div>
          </div>
        </div>

        {/* Right Column: Main Workspace with Tabs */}
        <div className={cn(
          "flex-1 flex flex-col min-h-0 rounded-xl border transition-colors overflow-hidden",
          isDarkMode ? "bg-[#0d131f] border-slate-800/80" : "bg-white border-slate-200 shadow-sm"
        )}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
             <TabsList className={cn(
               "grid grid-cols-7 h-11 shrink-0 rounded-none p-1 gap-1 border-b",
               isDarkMode ? "bg-slate-950/80 border-slate-800" : "bg-slate-100 border-slate-200"
             )}>
                {[
                  { value: 'home', label: 'Prodej', icon: ShoppingCart },
                  { value: 'route', label: 'Linka', icon: MapPin },
                  { value: 'messages', label: 'Dispečink', icon: MessageSquare },
                  { value: 'hvac', label: 'HVAC & Okna', icon: Wind },
                  { value: 'vehicle', label: 'Vůz', icon: Gauge },
                  { value: 'history', label: 'Tržba', icon: Receipt },
                  { value: 'settings', label: 'Systém', icon: Settings }
                ].map(tab => (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value} 
                    className={cn(
                      "rounded-lg font-black uppercase text-[11px] h-full flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                      isDarkMode 
                        ? "data-[state=active]:bg-slate-800 data-[state=active]:text-amber-400 text-slate-400 hover:text-slate-200" 
                        : "data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <tab.icon size={13} className="shrink-0" />
                    <span className="truncate">{tab.label}</span>
                    {tab.value === 'messages' && messages.some(m => !m.read) && (
                      <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shrink-0" />
                    )}
                  </TabsTrigger>
                ))}
             </TabsList>

              <div className="flex-1 p-1 overflow-hidden min-h-0 flex flex-col">
                <TabsContent value="home" className="flex-1 flex flex-col gap-1.5 mt-0 min-h-0 h-full pb-0 scrollbar-none overflow-hidden">
                  {/* UNIFIED DISPATCH STRIP (Current Station, Destination, Passengers, Deviation, Departure/Arrival) */}
                  <div className={cn(
                    "flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5 px-2 py-1.5 rounded-xl border shrink-0 shadow-xs transition-colors",
                    isDarkMode ? "bg-slate-900/90 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                  )}>
                    {/* Left: Current Station & Destination Selector */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-lg border text-left",
                        isDarkMode ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                      )}>
                        <span className="text-[8px] font-bold uppercase text-slate-400">Stanice:</span>
                        <span className="text-xs font-black truncate max-w-[120px] sm:max-w-[180px]">{currentStop.name}</span>
                        <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">Z{currentStop.zone}</span>
                      </div>

                      <span className="text-slate-500 text-xs font-bold">→</span>

                      <Dialog open={isDestinationOpen} onOpenChange={setIsDestinationOpen}>
                        <DialogTrigger asChild>
                          <button 
                            className={cn(
                              "flex items-center gap-1.5 px-2 py-1 rounded-lg border text-left transition-colors cursor-pointer",
                              isDarkMode ? "bg-slate-950/60 border-slate-800 hover:border-amber-500/50" : "bg-slate-50 border-slate-200 hover:border-amber-500/50"
                            )}
                            onClick={() => handleActivity()}
                            title="Klepněte pro změnu cílové zastávky"
                          >
                            <span className="text-[8px] font-bold uppercase text-slate-400">Cíl:</span>
                            <span className="text-xs font-black truncate max-w-[120px] sm:max-w-[180px] text-amber-400">{destinationStop.name}</span>
                            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-sky-500/20 text-sky-400 font-bold">Z{destinationStop.zone}</span>
                            <ChevronRight size={12} className="text-slate-400" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className={isDarkMode ? "bg-slate-950 text-white border-slate-800" : "bg-white text-slate-900"}>
                            <DialogHeader><DialogTitle className="uppercase font-black text-amber-400">Vyberte cílovou zastávku</DialogTitle></DialogHeader>
                            <div className="p-2 space-y-1 overflow-y-auto max-h-[60vh] scrollbar-thin">
                               {availableDestinations.map((stop) => (
                                 <Button
                                   key={stop.id}
                                   variant="outline"
                                   className={cn(
                                     "w-full justify-between h-11 text-sm font-bold uppercase rounded-xl",
                                     stop.id === destinationStop.id ? "border-amber-500 text-amber-400 bg-amber-500/10" : ""
                                   )}
                                   onClick={() => {
                                     setSelectedDestinationIndex(currentRoute.stops.indexOf(stop));
                                     setIsDestinationOpen(false);
                                     handleActivity();
                                   }}
                                 >
                                   <div className="flex items-center gap-2">
                                     <MapPin size={15} className="text-amber-400" />
                                     <span>{stop.name}</span>
                                   </div>
                                   <span className="font-mono text-xs opacity-70">Zóna {stop.zone}</span>
                                 </Button>
                               ))}
                            </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Middle: Passengers & Deviation Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Passengers counter */}
                      <div className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-lg border",
                        isDarkMode ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                      )}>
                        <Users size={12} className="text-amber-400" />
                        <span className="text-xs font-mono font-black">{passengerCount} os.</span>
                        {currentStopIndex > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentStopIndex(prev => Math.max(0, prev - 1));
                              setIsDriving(false);
                              handleActivity();
                            }}
                            className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer active:scale-95"
                            title="Zpět na předchozí zastávku"
                          >
                            ZPĚT
                          </button>
                        )}
                      </div>

                      {/* Deviation Widget */}
                      <div className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-lg border",
                        isDarkMode ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                      )}>
                        <Clock size={12} className={deviation === 0 ? "text-emerald-400" : deviation > 0 ? "text-rose-400" : "text-sky-400"} />
                        <span className={cn(
                          "text-xs font-mono font-black tabular-nums",
                          deviation === 0 ? "text-emerald-400" : deviation > 0 ? "text-rose-400" : "text-sky-400"
                        )}>
                          {formatDeviation(deviation)}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => setDeviation(prev => prev - 15)}
                            className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer active:scale-95"
                            title="Ubrat 15s"
                          >
                            -15s
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeviation(prev => prev + 15)}
                            className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer active:scale-95"
                            title="Přidat 15s"
                          >
                            +15s
                          </button>
                        </div>
                      </div>

                      {/* Multilistek Calculator Toggle */}
                      <button
                        type="button"
                        onClick={() => { setIsMultilistekKeypadMode(!isMultilistekKeypadMode); handleActivity(); }}
                        className={cn(
                          "h-8 px-2.5 rounded-lg border font-bold text-xs uppercase flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95",
                          isMultilistekKeypadMode 
                            ? "bg-amber-400 text-slate-950 border-amber-300 font-black" 
                            : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                        )}
                        title="Otevřít kalkulačku pro hromadný multilístek"
                      >
                        <Calculator size={13} />
                        <span className="hidden md:inline">Multilístek</span>
                      </button>
                    </div>

                    {/* Right: Big Odjezd / Příjezd Action Button */}
                    <Button 
                      onClick={() => {
                        if (isDriving) {
                          const offCount = passengersByStop[currentStop.id] || 0;
                          setPassengerCount(prev => Math.max(0, prev - offCount));
                          setIsDriving(false);
                        } else {
                          if (nextStop) {
                            playAnnouncement(currentStop.name); 
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
                        "h-8 sm:h-9 px-4 sm:px-6 font-black uppercase text-xs sm:text-sm rounded-xl transition-all shadow-md shrink-0 cursor-pointer active:scale-95",
                        isDriving 
                          ? "bg-amber-500 hover:bg-amber-400 text-slate-950" 
                          : (nextStop ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-rose-600 hover:bg-rose-500 text-white")
                      )}
                    >
                      {isDriving ? "PŘÍJEZD" : (nextStop ? "ODJEZD" : "KONEC TRASY")}
                    </Button>
                  </div>

                  {/* MAIN CONTENT AREA: NORMAL vs MULTILÍSTEK KEYPAD MODE */}
                  {isMultilistekKeypadMode ? (
                    <div className="flex-1 flex flex-col sm:flex-row gap-1 min-h-0 overflow-hidden animate-in fade-in zoom-in-95 duration-150 pr-0.5">
                      {/* LEFT SIDE: TICKET TYPE SELECTION + CALCULATOR KEYPAD */}
                      <div className="flex-1 flex flex-col gap-1 p-1 bg-amber-500/10 border-2 border-amber-500/30 rounded-sm shadow-md overflow-y-auto scrollbar-thin min-h-0 shrink-0 sm:shrink">
                        {/* Top Title Bar */}
                        <div className="flex justify-between items-center bg-amber-500 text-black px-1.5 py-0.5 rounded-sm font-black uppercase text-[8.5px] sm:text-[9px] tracking-wider shrink-0 shadow-sm">
                          <span className="flex items-center gap-1 truncate">
                            <Calculator size={10} />
                            KALKULAČKA MULTILÍSTKU
                          </span>
                          <button
                            type="button"
                            onClick={() => { setIsMultilistekKeypadMode(false); handleActivity(); }}
                            className="text-[7.5px] sm:text-[8px] bg-black text-amber-300 font-bold px-1.5 py-0.5 rounded hover:bg-zinc-800 cursor-pointer shrink-0 ml-1"
                          >
                            ✕ ZRUŠIT
                          </button>
                        </div>

                        {/* Category filter pills for keypad mode */}
                        <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none shrink-0 text-[7px] font-bold">
                          {[
                            { id: 'all', label: 'Všechny' },
                            { id: 'basic', label: 'Základní' },
                            { id: 'time', label: 'Časové' },
                            { id: 'group', label: 'Skupiny' },
                            { id: 'luggage', label: 'Zavazadla/Kola' },
                            { id: 'special', label: 'Ostatní' },
                          ].map(cat => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => { setKeypadCategoryFilter(cat.id as any); handleActivity(); }}
                              className={cn(
                                "px-1.5 py-0.5 rounded uppercase font-black transition-colors whitespace-nowrap",
                                keypadCategoryFilter === cat.id
                                  ? "bg-amber-500 text-black shadow-xs"
                                  : "bg-black/40 text-slate-300 hover:bg-black/60"
                              )}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>

                        {/* Ticket Tiles Grid (Select active ticket) */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-0.5 max-h-32 overflow-y-auto pr-0.5 scrollbar-thin shrink-0">
                          {TICKET_TYPES.filter(t => keypadCategoryFilter === 'all' || t.category === keypadCategoryFilter).map(type => {
                            const isSelected = selectedMultilistekTicket?.id === type.id;
                            const price = calculatePrice(currentStop, destinationStop, type);
                            return (
                              <button
                                key={type.id}
                                type="button"
                                onClick={() => {
                                  setSelectedMultilistekTicket(type);
                                  handleActivity();
                                  playPaymentBeep(false);
                                }}
                                className={cn(
                                  "h-8 sm:h-9 p-0.5 flex flex-col justify-center items-center rounded-sm border transition-all text-center select-none cursor-pointer active:scale-95",
                                  isSelected
                                    ? "bg-amber-400 border-amber-600 text-black font-black shadow-md ring-2 ring-amber-300"
                                    : (isDarkMode ? "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200 font-bold text-[7.5px]" : "bg-white hover:bg-slate-100 border-slate-300 text-slate-800 font-bold text-[7.5px]")
                                )}
                              >
                                <span className="text-[7px] sm:text-[7.5px] uppercase leading-none font-black truncate w-full">{type.name}</span>
                                <span className="text-[8.5px] sm:text-[9px] font-black font-mono leading-none mt-0.5">
                                  {price === 0 ? <span className="text-amber-700">ZDARMA</span> : `${price} Kč`}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Calculator Screen & Keypad */}
                        <div className="flex-1 bg-slate-900 text-white rounded-sm border-2 border-slate-700 p-1 sm:p-1.5 flex flex-col justify-between min-h-[150px] sm:min-h-0">
                          {/* Screen Display */}
                          <div className="bg-black/90 border border-slate-700 rounded px-1.5 py-0.5 sm:py-1 flex justify-between items-center shadow-inner shrink-0 mb-1">
                            <div className="flex flex-col min-w-0 pr-1">
                              <span className="text-[7px] sm:text-[7.5px] font-bold text-amber-400 uppercase tracking-widest truncate">
                                Vybráno: <span className="text-white font-black">{selectedMultilistekTicket?.name || 'DOSPĚLÝ'}</span>
                              </span>
                              <span className="text-[8px] sm:text-[8.5px] text-slate-400 font-mono truncate">
                                {multilistekKeypadInput ? `${parseInt(multilistekKeypadInput)} × ${calculatePrice(currentStop, destinationStop, selectedMultilistekTicket)} Kč` : 'Naťukejte počet...'}
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-base sm:text-lg font-mono font-black text-amber-400 tracking-wider leading-none">
                                {multilistekKeypadInput || "0"} <span className="text-[9px] font-normal text-slate-400">ks</span>
                              </div>
                              <div className="text-[8px] sm:text-[8.5px] font-mono text-emerald-400 font-bold">
                                = {(parseInt(multilistekKeypadInput || "0") * calculatePrice(currentStop, destinationStop, selectedMultilistekTicket)).toFixed(0)} Kč
                              </div>
                            </div>
                          </div>

                          {/* Keypad Buttons */}
                          <div className="grid grid-cols-4 gap-0.5 sm:gap-1 flex-1 min-h-0">
                            {['7', '8', '9', 'C'].map(k => (
                              <button
                                key={k}
                                type="button"
                                onClick={() => handleKeypadPress(k)}
                                className={cn(
                                  "h-6 sm:h-7 rounded font-mono font-black text-xs sm:text-sm transition-all active:scale-95 shadow cursor-pointer select-none flex items-center justify-center",
                                  k === 'C' ? "bg-red-600 hover:bg-red-700 text-white" : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-600"
                                )}
                              >
                                {k}
                              </button>
                            ))}
                            {['4', '5', '6', '⌫'].map(k => (
                              <button
                                key={k}
                                type="button"
                                onClick={() => handleKeypadPress(k === '⌫' ? 'backspace' : k)}
                                className={cn(
                                  "h-6 sm:h-7 rounded font-mono font-black text-xs sm:text-sm transition-all active:scale-95 shadow cursor-pointer select-none flex items-center justify-center",
                                  k === '⌫' ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-600"
                                )}
                              >
                                {k}
                              </button>
                            ))}
                            {['1', '2', '3', '0'].map(k => (
                              <button
                                key={k}
                                type="button"
                                onClick={() => handleKeypadPress(k)}
                                className="h-6 sm:h-7 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded font-mono font-black text-xs sm:text-sm transition-all active:scale-95 shadow cursor-pointer select-none flex items-center justify-center"
                              >
                                {k}
                              </button>
                            ))}

                            {/* PLUS BUTTON */}
                            <button
                              type="button"
                              onClick={handleAddKeypadItemToDraft}
                              className="col-span-4 h-7 sm:h-8 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-black font-black text-[10px] sm:text-xs uppercase rounded shadow-lg border border-emerald-400 transition-all active:scale-98 flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Plus size={14} strokeWidth={3} />
                              PŘIDAT NA PAPÍREK (+)
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT SIDE: POMOCNÝ PAPÍREK (DRAFT MULTILÍSTEK LIST) */}
                      <div className="w-full sm:w-64 md:w-80 flex flex-col h-full shrink-0 bg-amber-50/90 dark:bg-zinc-900 border-2 border-amber-400 rounded-sm shadow-xl overflow-hidden min-h-0">
                        {/* Papírek Header */}
                        <div className="p-1 bg-amber-500 text-black font-black text-[8.5px] sm:text-[9.5px] uppercase tracking-wider flex justify-between items-center shrink-0 shadow-sm">
                          <span className="flex items-center gap-1">
                            <FileText size={10} />
                            POMOCNÝ PAPÍREK
                          </span>
                          <span className="text-[8px] font-mono bg-black text-amber-300 px-1 rounded font-bold">
                            {multilistekDraftItems.reduce((a,b) => a+b.count, 0)} os.
                          </span>
                        </div>

                        {/* Draft Items List */}
                        <div className="flex-1 min-h-0 overflow-y-auto p-1 space-y-0.5 scrollbar-thin bg-[#fffdf5] dark:bg-zinc-950 font-mono text-xs">
                          {multilistekDraftItems.length === 0 ? (
                            <div className="h-full min-h-[50px] flex flex-col items-center justify-center text-slate-400 p-1.5 text-center">
                              <Receipt size={20} className="opacity-30 mb-0.5 text-amber-600" />
                              <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500">Papírek je prázdný</span>
                              <span className="text-[7.5px] text-slate-400 mt-0.5">Vyberte tarif, zadat počet a (+)</span>
                            </div>
                          ) : (
                            multilistekDraftItems.map((item, idx) => {
                              const itemPrice = calculatePrice(currentStop, destinationStop, item.type);
                              const totalPrice = itemPrice * item.count;

                              return (
                                <div key={idx} className="flex items-center justify-between p-0.5 sm:p-1 bg-white dark:bg-zinc-900 border border-amber-200 dark:border-zinc-800 rounded shadow-xs">
                                  <div className="flex flex-col">
                                    <span className="font-black text-slate-900 dark:text-amber-300 text-[9px] sm:text-[10px] uppercase leading-tight">
                                      {item.count}x {item.type.name}
                                    </span>
                                    <span className="text-[7.5px] sm:text-[8.5px] text-slate-500 dark:text-zinc-400">
                                      ({itemPrice} Kč/ks)
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-black text-blue-900 dark:text-blue-400 text-[10px] sm:text-xs">
                                      {totalPrice} Kč
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                      onClick={() => handleRemoveDraftItem(item.type.id)}
                                      title="Odstranit z papírku"
                                    >
                                      <Trash2 size={10} />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Note Input */}
                        <div className="p-0.5 sm:p-1 bg-amber-100/80 dark:bg-zinc-800 border-t border-amber-200 shrink-0">
                          <input
                            type="text"
                            placeholder="Poznámka ke skupině..."
                            value={multilistekNote}
                            onChange={(e) => setMultilistekNote(e.target.value)}
                            className="w-full px-1 py-0.5 text-[8px] sm:text-[9px] border border-amber-300 rounded bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                          />
                        </div>

                        {/* Summary & Confirmation Buttons */}
                        <div className="p-1 sm:p-1.5 bg-white dark:bg-zinc-900 border-t border-amber-300 shrink-0 space-y-1">
                          <div className="flex justify-between items-baseline">
                            <span className="text-[8px] sm:text-[8.5px] font-black uppercase text-slate-600 dark:text-zinc-400">
                              Celkem:
                            </span>
                            <span className="text-base sm:text-xl font-black text-amber-400 font-mono leading-none">
                              {multilistekDraftItems.reduce((acc, item) => acc + (calculatePrice(currentStop, destinationStop, item.type) * item.count), 0)}
                              <span className="text-[10px] sm:text-xs ml-0.5">Kč</span>
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1">
                            <Button
                              className="h-8 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[9px] uppercase rounded-lg shadow-sm transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1"
                              onClick={handleDirectSellFromDraft}
                              disabled={multilistekDraftItems.length === 0}
                            >
                              <Printer size={12} />
                              VÝDEJ A TISK
                            </Button>

                            <Button
                              variant="outline"
                              className="h-8 bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 font-black text-[9px] uppercase rounded-lg shadow-sm transition-all active:scale-98 cursor-pointer flex items-center justify-center"
                              onClick={handleConfirmDraftToCart}
                              disabled={multilistekDraftItems.length === 0}
                            >
                              DO KOŠÍKU
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* MAIN CONTENT AREA: TICKETS (Left) + CART (Right) */
                    <div className="flex-1 flex flex-col sm:flex-row gap-1.5 min-h-0 overflow-hidden">
                      {/* TICKETS AREA */}
                      <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-0.5 scrollbar-thin min-h-0">
                         {/* Quick Primary Tickets (Top 4 Favorites) */}
                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 shrink-0">
                            {TICKET_TYPES.filter(t => ['adult', 'child', 'student', 'senior'].includes(t.id)).map(type => (
                              <Button
                                key={type.id}
                                className={cn(
                                  "h-12 flex flex-col items-center justify-center p-1 border rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer relative",
                                  type.id === 'adult' ? "bg-blue-600 hover:bg-blue-500 border-blue-500/50 text-white" :
                                  type.id === 'child' ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-500/50 text-white" :
                                  type.id === 'student' ? "bg-amber-600 hover:bg-amber-500 border-amber-500/50 text-white" :
                                  "bg-slate-700 hover:bg-slate-600 border-slate-600 text-white"
                                )}
                                onClick={() => { addToCart(type); handleActivity(); }}
                              >
                                <span className="absolute top-1 right-1.5 text-[7px] font-mono font-black opacity-80 uppercase tracking-tighter">
                                  {type.badge}
                                </span>
                                <span className="text-[9.5px] font-black uppercase text-center leading-tight tracking-tight mt-1">{type.name}</span>
                                <span className="text-base font-black font-mono leading-none mt-0.5">
                                  {calculatePrice(currentStop, destinationStop, type)} <span className="text-[9px] font-normal opacity-80">Kč</span>
                                </span>
                              </Button>
                            ))}
                         </div>

                         {/* Ticket Toolbar: Live Search & Category Filter Pills */}
                         <div className={cn(
                           "flex flex-col gap-1 p-1.5 rounded-xl border shrink-0 transition-colors",
                           isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-slate-100 border-slate-200 shadow-xs"
                         )}>
                           <div className="flex items-center gap-1.5">
                             <div className="relative flex-1">
                               <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                               <input
                                 type="text"
                                 placeholder="Hledat lístek (např. 24h, pes, kolo, průkaz, zpožděnka)..."
                                 value={ticketSearchQuery}
                                 onChange={(e) => setTicketSearchQuery(e.target.value)}
                                 className={cn(
                                   "w-full pl-7 pr-7 py-1 text-xs rounded-lg border focus:outline-none transition-colors",
                                   isDarkMode ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-amber-500/50" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500"
                                 )}
                               />
                               {ticketSearchQuery && (
                                 <button
                                   type="button"
                                   onClick={() => setTicketSearchQuery("")}
                                   className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                                 >
                                   ✕
                                 </button>
                               )}
                             </div>
                             <span className="text-[9px] font-bold text-slate-400 shrink-0 font-mono px-1">
                               {TICKET_TYPES.filter(t => {
                                 const matchesCat = ticketCategoryFilter === 'all' || t.category === ticketCategoryFilter;
                                 const matchesQuery = !ticketSearchQuery || t.name.toLowerCase().includes(ticketSearchQuery.toLowerCase()) || (t.description && t.description.toLowerCase().includes(ticketSearchQuery.toLowerCase()));
                                 return matchesCat && matchesQuery;
                               }).length} / {TICKET_TYPES.length}
                             </span>
                           </div>

                           {/* Category Pills */}
                           <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5 text-[8px]">
                             {[
                               { id: 'all', label: `Všechny (${TICKET_TYPES.length})` },
                               { id: 'basic', label: `Základní (${TICKET_TYPES.filter(t => t.category === 'basic').length})` },
                               { id: 'time', label: `Časové & Síťové (${TICKET_TYPES.filter(t => t.category === 'time').length})` },
                               { id: 'group', label: `Skupinové (${TICKET_TYPES.filter(t => t.category === 'group').length})` },
                               { id: 'luggage', label: `Zavazadla & Kola (${TICKET_TYPES.filter(t => t.category === 'luggage').length})` },
                               { id: 'special', label: `Doplňkové (${TICKET_TYPES.filter(t => t.category === 'special').length})` },
                             ].map(cat => (
                               <button
                                 key={cat.id}
                                 type="button"
                                 onClick={() => { setTicketCategoryFilter(cat.id as any); handleActivity(); }}
                                 className={cn(
                                   "px-2.5 py-1 rounded-lg uppercase font-black transition-all whitespace-nowrap cursor-pointer",
                                   ticketCategoryFilter === cat.id
                                     ? "bg-amber-500 text-slate-950 shadow-xs"
                                     : (isDarkMode ? "bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800" : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200")
                                 )}
                               >
                                 {cat.label}
                               </button>
                             ))}
                           </div>
                         </div>

                         {/* Comprehensive Tickets Grid */}
                         <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-1.5">
                            {TICKET_TYPES.filter(type => {
                              const matchesCat = ticketCategoryFilter === 'all' 
                                ? (ticketSearchQuery ? true : !['adult', 'child', 'student', 'senior'].includes(type.id))
                                : type.category === ticketCategoryFilter;
                              const matchesQuery = !ticketSearchQuery || 
                                type.name.toLowerCase().includes(ticketSearchQuery.toLowerCase()) || 
                                (type.description && type.description.toLowerCase().includes(ticketSearchQuery.toLowerCase())) ||
                                (type.badge && type.badge.toLowerCase().includes(ticketSearchQuery.toLowerCase()));
                              return matchesCat && matchesQuery;
                            }).map(type => {
                              const price = calculatePrice(currentStop, destinationStop, type);
                              const isFree = price === 0;

                              return (
                                <Button
                                  key={type.id}
                                  variant="outline"
                                  className={cn(
                                    "h-12 flex flex-col justify-between p-1.5 border rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer relative text-left",
                                    isFree 
                                      ? "bg-emerald-950/20 border-emerald-500/30 hover:bg-emerald-950/40 text-emerald-300"
                                      : (isDarkMode 
                                          ? "bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 text-slate-200" 
                                          : "bg-white hover:bg-slate-100 border-slate-200 text-slate-900")
                                  )}
                                  onClick={() => { addToCart(type); handleActivity(); }}
                                  title={type.description || type.name}
                                >
                                  {/* Top line: Name & Badge */}
                                  <div className="w-full flex items-start justify-between gap-1">
                                    <span className="text-[8px] sm:text-[8.5px] font-black uppercase leading-tight line-clamp-2 flex-1">
                                      {type.name}
                                    </span>
                                    {type.badge && (
                                      <span className={cn(
                                        "text-[7px] font-mono font-black uppercase px-1 py-0.2 rounded shrink-0 leading-none",
                                        isFree ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                                        type.category === 'time' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                                        type.category === 'group' ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" :
                                        type.category === 'luggage' ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
                                        "bg-slate-800 text-slate-300 border border-slate-700"
                                      )}>
                                        {type.badge}
                                      </span>
                                    )}
                                  </div>

                                  {/* Bottom line: Price */}
                                  <div className="w-full flex items-baseline justify-between mt-0.5">
                                    <span className="text-[7.5px] text-slate-500 font-mono">
                                      {type.multiplier > 0 ? `${(type.multiplier * 100).toFixed(0)}%` : '0%'}
                                    </span>
                                    <span className="text-xs sm:text-sm font-black font-mono leading-none">
                                      {isFree ? (
                                        <span className="text-emerald-400 font-black">ZDARMA</span>
                                      ) : (
                                        <span className="text-amber-400">
                                          {price} <span className="text-[8px] font-bold text-slate-400">Kč</span>
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                </Button>
                              );
                            })}
                         </div>
                      </div>

                      {/* CART & CHECKOUT AREA - STICKY, NEVER CUT OFF */}
                      <div className="w-full sm:w-80 md:w-88 flex flex-col h-full min-h-0 shrink-0">
                         <div className={cn(
                           "flex-1 flex flex-col rounded-xl overflow-hidden shadow-sm min-h-0 border transition-colors",
                           isDarkMode ? "bg-slate-900/90 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"
                         )}>
                            {/* Cart Header */}
                            <div className={cn(
                              "p-2 sm:p-2.5 flex justify-between items-center shrink-0 border-b",
                              isDarkMode ? "bg-slate-950/90 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-900"
                            )}>
                               <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                                 <ShoppingCart size={14} className="text-amber-400" />
                                 Nákupní košík
                                 {isMultilistekMode && (
                                   <span className="ml-1 bg-amber-400 text-slate-950 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">
                                     MULTILÍSTEK
                                   </span>
                                 )}
                               </span>
                               <div className="flex items-center gap-2">
                                 <label className={cn(
                                   "flex items-center gap-1.5 cursor-pointer text-[9px] font-bold select-none px-2 py-0.5 rounded-lg border",
                                   isDarkMode ? "bg-slate-900 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-300 text-slate-700"
                                 )}>
                                   <input
                                     type="checkbox"
                                     checked={isMultilistekMode}
                                     onChange={(e) => setIsMultilistekMode(e.target.checked)}
                                     className="w-3 h-3 accent-amber-500 cursor-pointer"
                                   />
                                   <span>Multilístek</span>
                                 </label>
                                 <span className="text-xs font-mono font-bold text-amber-400">
                                   {cart.reduce((a,b) => a+b.count, 0)} ks
                                 </span>
                                 {cart.length > 0 && (
                                   <button 
                                     type="button" 
                                     onClick={() => setCart([])} 
                                     className="text-[9px] text-rose-400 hover:text-rose-300 font-bold ml-1 cursor-pointer"
                                     title="Vyprázdnit košík"
                                   >
                                     Vysypat
                                   </button>
                                 )}
                               </div>
                            </div>
                            
                            {/* Scrollable Items List */}
                            <div className="flex-1 overflow-y-auto p-1.5 space-y-1 min-h-0 scrollbar-thin">
                               {cart.length === 0 ? (
                                 <div className={cn(
                                   "h-full min-h-[70px] flex flex-col items-center justify-center italic text-xs uppercase font-bold text-center gap-1 py-4",
                                   isDarkMode ? "text-slate-600" : "text-slate-400"
                                 )}>
                                   <ShoppingCart size={22} className="opacity-40" />
                                   <span>Košík je prázdný</span>
                                   <span className="text-[9.5px] font-normal normal-case opacity-70">Zvolte jízdenku vlevo pro odbavení</span>
                                 </div>
                               ) : (
                                 cart.map(item => (
                                   <div key={item.type.id} className={cn(
                                     "flex items-center justify-between p-2 rounded-lg shadow-xs border transition-colors",
                                     isDarkMode ? "bg-slate-950/70 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
                                   )}>
                                      <div className="flex flex-col min-w-0 pr-1">
                                         <span className="text-[10px] font-black uppercase leading-tight truncate">{item.type.name}</span>
                                         <span className="text-xs font-mono font-black text-amber-400 mt-0.5">
                                           {item.count}× {calculatePrice(currentStop, destinationStop, item.type)} Kč
                                         </span>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                         <Button 
                                           variant="ghost" 
                                           size="icon" 
                                           className="h-6 w-6 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer active:scale-90 transition-transform" 
                                           onClick={() => removeFromCart(item.type.id)}
                                         >
                                            <Trash2 size={13} />
                                         </Button>
                                      </div>
                                   </div>
                                 ))
                                )}
                            </div>

                            {/* STICKY CHECKOUT FOOTER - ALWAYS FULLY VISIBLE IN VIEWPORT */}
                            <div className={cn(
                              "p-2.5 sm:p-3 border-t shrink-0 flex flex-col gap-2 transition-colors",
                              isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                            )}>
                               <div className="flex justify-between items-baseline">
                                  <span className={cn("text-[10px] font-black uppercase tracking-wider", isDarkMode ? "text-slate-400" : "text-slate-500")}>Celkem k úhradě</span>
                                  <span className="text-2xl font-black font-mono leading-none text-amber-400 tabular-nums">
                                    {cartTotal} <span className="text-xs font-bold text-slate-400">Kč</span>
                                  </span>
                               </div>

                               {/* Payment method selector */}
                               <div className="grid grid-cols-3 gap-1">
                                  {[
                                    { id: 'cash', icon: Printer, label: 'HOTOVĚ' },
                                    { id: 'card', icon: CreditCard, label: 'KARTOU' },
                                    { id: 'mobile', icon: Wifi, label: 'MOBIL/QR' }
                                  ].map(p => (
                                    <button 
                                      key={p.id}
                                      type="button"
                                      className={cn(
                                        "h-8 sm:h-9 flex flex-col items-center justify-center rounded-lg border text-[9px] font-black transition-all active:scale-95 select-none cursor-pointer",
                                        paymentMethod === p.id 
                                          ? "bg-amber-500 border-amber-400 text-slate-950 shadow-sm font-black" 
                                          : (isDarkMode ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200")
                                      )}
                                      onClick={() => setPaymentMethod(p.id as any)}
                                    >
                                      <p.icon size={12} className="mb-0.5" />
                                      {p.label}
                                    </button>
                                  ))}
                               </div>

                               {/* Checkout & Print Action Button */}
                               <div className="flex items-center gap-1.5">
                                 <Button 
                                   className={cn(
                                     "flex-1 h-11 sm:h-12 font-black text-xs sm:text-sm uppercase rounded-xl active:scale-98 transition-all select-none cursor-pointer shadow-md flex items-center justify-center gap-2",
                                     saleButtonSuccess 
                                       ? "bg-emerald-400 text-slate-950 font-black animate-pulse shadow-emerald-500/20" :
                                     isPrinting 
                                       ? "bg-amber-500 hover:bg-amber-400 text-slate-950 animate-pulse" 
                                       : "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white"
                                   )}
                                   onClick={isPrinting ? handleForceUnlockPrinter : handleSellTicket}
                                   disabled={!isPrinting && cart.length === 0}
                                   title={isPrinting ? "Kliknutím odblokujete tiskárnu" : "Vydat a vytisknout jízdenku"}
                                 >
                                   {saleButtonSuccess ? (
                                     <>
                                       <Check size={17} strokeWidth={3} />
                                       <span>VYTIŠTĚNO! ✓</span>
                                     </>
                                   ) : isPrinting ? (
                                     <>
                                       <RefreshCw size={15} className="animate-spin" />
                                       <span>TISKNE SE...</span>
                                     </>
                                   ) : (
                                     <>
                                       <Printer size={16} />
                                       <span>TISKNOUT JÍZDENKU</span>
                                     </>
                                   )}
                                 </Button>

                                 {isPrinting && (
                                   <Button
                                     variant="outline"
                                     size="sm"
                                     className="h-11 px-2.5 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-400 text-[10px] font-black cursor-pointer active:scale-95 transition-all shrink-0 rounded-xl"
                                     onClick={handleForceUnlockPrinter}
                                     title="Nouzový reset tiskárny"
                                   >
                                     <RefreshCw size={14} className="animate-spin" />
                                   </Button>
                                 )}
                               </div>

                               {/* Last sold ticket quick-bar */}
                               {lastSoldTicket && (
                                 <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[8.5px] text-slate-400">
                                   <span className="truncate">
                                     Poslední: <strong className="text-amber-400 font-mono font-bold">{lastSoldTicket.ticketCode}</strong> ({lastSoldTicket.price} Kč)
                                   </span>
                                   <div className="flex items-center gap-1 shrink-0">
                                     <button
                                       type="button"
                                       onClick={() => {
                                         setPrintedTicketModalData(lastSoldTicket);
                                         setIsTicketPreviewOpen(true);
                                       }}
                                       className="text-amber-400 hover:text-amber-300 font-bold px-1.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer transition-colors"
                                       title="Zobrazit doklad na displeji"
                                     >
                                       Doklad
                                     </button>
                                     <button
                                       type="button"
                                       onClick={() => {
                                         playThermalPrinterSound();
                                         setReprintingEffect(true);
                                         setTimeout(() => setReprintingEffect(false), 800);
                                       }}
                                       className="text-slate-300 hover:text-white font-bold px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer flex items-center gap-0.5 transition-colors"
                                       title="Vytisknout duplikát dokladu"
                                     >
                                       <Printer size={10} />
                                       Duplikát
                                     </button>
                                   </div>
                                 </div>
                               )}
                            </div>
                         </div>
                      </div>
                    </div>
                  )}
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
                      <h3 className={cn("font-bold uppercase tracking-widest", isDarkMode ? "text-amber-400" : "text-sky-600")}>Výběr linky a trasy</h3>
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
                            isDarkMode ? "bg-zinc-900/50 border-white/10 text-white focus:border-amber-400/50" : "bg-white border-slate-300 text-slate-800 focus:border-sky-500/50"
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
                              isDarkMode ? "text-amber-400" : "text-sky-600"
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
                                  isDarkMode ? "bg-zinc-900 border-zinc-800 text-white focus:border-amber-400/50" : "bg-white border-slate-300 text-slate-800 focus:border-sky-500/50"
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
                                  isDarkMode ? "bg-zinc-900 border-zinc-800 text-white focus:border-amber-400/50" : "bg-white border-slate-300 text-slate-800 focus:border-sky-500/50"
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
                                        isDarkMode ? "bg-zinc-900/50 border-zinc-800 text-zinc-100" : "bg-white border-slate-200 text-slate-800 focus:border-sky-500/50"
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
                                        isDarkMode ? "bg-zinc-900/50 border-zinc-800 text-zinc-100" : "bg-white border-slate-200 text-slate-800 focus:border-sky-500/50"
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
                                      {getComputedDepartureTime(stop.minutesFromStart, stop.arrivalMinutesFromStart)}
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
                          <h4 className="text-sm font-black uppercase tracking-wider text-amber-500">Mimořádná výluka a víkendová uzavírka Kostelní ulice</h4>
                          <span className={cn(
                            "text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase shrink-0",
                            isDarkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-500/10 text-amber-800"
                          )}>Výluka trvá do 1.12.2026</span>
                        </div>
                        <p className="text-xs font-semibold leading-relaxed opacity-95">
                          Linky <span className="font-bold text-amber-600 dark:text-amber-400">120/A, 120/B, 120/C1, 120/C2 a linka 219</span> jezdí <span className="underline font-black text-amber-500">výhradně v pracovních dnech</span>. O víkendech jsou tyto linky kvůli uzavírce Kostelní ulice <span className="underline font-black text-red-500">ZCELA ZRUŠENY</span>.
                        </p>
                        <div className="text-[10px] font-mono opacity-90 mt-2 p-2 bg-black/5 rounded space-y-1 border border-black/5">
                          <div>• <span className="text-red-500 font-bold">Víkendový provoz linek 120 a 219:</span> Zrušen z důvodu neprůjezdnosti Kostelní ulice.</div>
                          <div>• <span className="text-green-600 font-bold">Náhradní doprava o víkendech:</span> Využijte výhradně kyvadlovou linku <span className="font-black text-purple-600 dark:text-purple-400">120/ABx</span> (Staré náměstí ↔ Kounice) nebo odklonovou linku přes <span className="font-black text-orange-600 dark:text-orange-400">Haldu (víkendová trasa)</span>.</div>
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
                              ? "bg-sky-950/80 border-sky-500 text-white shadow-lg shadow-sky-950/30" 
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
                                {route.number === '219' && (
                                  <Badge className="bg-cyan-600 hover:bg-cyan-700 text-white font-black text-[10px]">POUZE V PRAC. DNECH</Badge>
                                )}
                                {route.id.endsWith('_REG') && (
                                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px]">BĚŽNÁ TRASA (V PRAC. DNECH)</Badge>
                                )}
                                {route.id.endsWith('_VYL') && (
                                  <Badge className="bg-amber-600 hover:bg-amber-700 text-black font-black text-[10px]">VÝLUKA (POUZE VÍKENDY)</Badge>
                                )}
                                {route.id === '120_ABX' && (
                                  <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px]">KYVADLOVÁ (POUZE VÍKENDY)</Badge>
                                )}
                                {route.id === '120_HALDA_WD' && (
                                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px]">HALDA (PRACOVNÍ DNY)</Badge>
                                )}
                                {route.id === '120_HALDA_WE' && (
                                  <Badge className="bg-orange-600 hover:bg-orange-700 text-white font-black text-[10px]">HALDA (VÍKENDY)</Badge>
                                )}
                                <Badge className="bg-amber-400 text-slate-950 font-black">{route.number}</Badge>
                              </div>
                            </div>
                            <div className={cn("flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold", currentRoute.id === route.id ? "text-white/80" : (isDarkMode ? "text-zinc-400" : "text-slate-500"))}>
                              <span>{route.stops.length} zastávek</span>
                              <span>•</span>
                              <span>{route.stops[route.stops.length-1].kmFromStart} km</span>
                              <span>•</span>
                              <span className={cn(currentRoute.id === route.id ? "text-amber-300" : (isDarkMode ? "text-amber-400/90" : "text-sky-700"))}>
                                Přenese: {route.stops[0].name} → {route.stops[route.stops.length-1].name}
                              </span>
                            </div>

                            {/* Informational Sub-text badge */}
                            {route.id.endsWith('_REG') && (
                              <div className="mt-2 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                ⚠️ O víkendech ZRUŠENO • Víkendová náhrada: 120/ABx (kyvadlová) a Halda (víkend)
                              </div>
                            )}
                            {route.id === '120_ABX' && (
                              <div className="mt-2 text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                                ℹ️ V provozu pouze o víkendech jako náhradní kyvadlová doprava
                              </div>
                            )}
                            {route.id === '120_HALDA_WE' && (
                              <div className="mt-2 text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                                ℹ️ Víkendová odklonová trasa přes Haldu (výluka do 1.12.2026)
                              </div>
                            )}
                            {route.id === '120_HALDA_WD' && (
                              <div className="mt-2 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                ℹ️ Trasa přes Haldu v pracovních dnech
                              </div>
                            )}
                            {route.number === '219' && (
                              <div className="mt-2 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                ⚠️ V provozu POUZE V PRACOVNÍCH DNECH • O víkendu zrušeno (uzavírka Kostelní ul.) • Náhrada: 120/ABx a Halda (víkend)
                              </div>
                            )}
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
                  <h3 className="text-amber-400 font-bold uppercase tracking-widest">Zprávy z dispečinku</h3>
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

              <TabsContent value="vehicle" className="flex-1 flex flex-col gap-3 mt-0 overflow-y-auto min-h-0 pb-12 lg:pb-0 scrollbar-none">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-3 min-h-0 flex-1"
                >
                  {/* Top Cockpit Status Bar */}
                  <div className={cn(
                    "p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 shrink-0 transition-colors shadow-xs",
                    isDarkMode ? "bg-slate-900/90 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                        <Bus size={22} />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black uppercase tracking-wider">IVECO CROSSWAY LE 12M</h3>
                          <Badge className="bg-amber-400 text-slate-950 font-black text-[9px] uppercase px-1.5 py-0.2 border-none">
                            VŮZ #4208
                          </Badge>
                          <span className="text-[9px] font-mono text-emerald-400 font-bold hidden sm:inline">CAN-BUS: OK</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Motor: FPT Cursor 9 (265 kW / 360 k) • Euro VI-e • Převodovka: ZF EcoLife 6AP
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-8 text-xs font-bold rounded-lg border transition-colors cursor-pointer",
                          isDarkMode ? "bg-slate-950 border-slate-800 text-slate-300 hover:text-white" : "bg-white border-slate-200 text-slate-700"
                        )}
                        onClick={() => {
                          playPaymentBeep(true);
                          handleActivity();
                        }}
                      >
                        <Zap size={13} className="text-amber-400 mr-1.5" />
                        Test kontrolek
                      </Button>

                      <div className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-mono",
                        isDarkMode ? "bg-slate-950 border-slate-800 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                      )}>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-bold">KAMERY ONLINE</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Grid: CCTV System (Left) & Instrument Cluster (Right) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 flex-1">
                    {/* LEFT: CCTV Security Cameras (7 cols) */}
                    <div className={cn(
                      "lg:col-span-7 flex flex-col gap-2 p-3 rounded-xl border shadow-xs min-h-[300px] lg:min-h-0 transition-colors",
                      isDarkMode ? "bg-slate-900/90 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                    )}>
                      <div className="flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                          <Camera size={16} className="text-amber-400" />
                          <span className="text-xs font-black uppercase tracking-wider">Kamerový systém vozu</span>
                        </div>
                        {isCameraActive && (
                          <div className="flex gap-1">
                            {[
                              { id: 'interior', label: 'Salón', num: '01' },
                              { id: 'door1', label: 'Dveře 1', num: '02' },
                              { id: 'door2', label: 'Dveře 2', num: '03' },
                              { id: 'rear', label: 'Couvání', num: '04' }
                            ].map(cam => (
                              <button
                                key={cam.id}
                                type="button"
                                className={cn(
                                  "px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer border",
                                  activeCamera === cam.id
                                    ? "bg-amber-500 border-amber-400 text-slate-950 font-black shadow-xs"
                                    : (isDarkMode ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-white" : "bg-slate-100 border-slate-200 text-slate-600")
                                )}
                                onClick={() => { setActiveCamera(cam.id as any); handleActivity(); }}
                              >
                                {cam.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* CCTV Viewport */}
                      <div className="flex-1 bg-black rounded-xl border border-slate-800 overflow-hidden relative group min-h-[220px] flex items-center justify-center">
                        {isCameraActive ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            {/* Realistic Simulated Video Backdrop */}
                            <div className={cn(
                              "absolute inset-0 bg-cover bg-center opacity-45 grayscale transition-all duration-700",
                              activeCamera === 'interior' && "bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80')]",
                              activeCamera === 'door1' && "bg-[url('https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1000&q=80')]",
                              activeCamera === 'door2' && "bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80')]",
                              activeCamera === 'rear' && "bg-[url('https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?auto=format&fit=crop&w=1000&q=80')]"
                            )} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />

                            {/* CCTV HUD Overlay */}
                            <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
                              <div className="flex items-center gap-1.5 bg-rose-600 px-2 py-0.5 rounded text-[9px] font-black text-white uppercase animate-pulse shadow-sm">
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                REC • CAM {activeCamera === 'interior' ? '01 - SALÓN' : activeCamera === 'door1' ? '02 - PŘEDNÍ DVEŘE' : activeCamera === 'door2' ? '03 - STŘEDNÍ DVEŘE' : '04 - ZADNÍ COUVACÍ'}
                              </div>
                              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-black/70 px-1.5 py-0.5 rounded border border-slate-800">
                                FPS: 25 • 1080p
                              </span>
                            </div>

                            <div className="absolute bottom-2 left-2 z-10 font-mono text-[10px] text-slate-300 bg-black/70 px-2 py-0.5 rounded border border-slate-800">
                              DPHS HORNÍ SLAVKOV • VŮZ #4208 • {formatTime(currentTime)}
                            </div>

                            {/* Scanlines Effect */}
                            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_3px]" />

                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="absolute top-2 right-2 text-white/60 hover:text-white hover:bg-black/40 z-20 cursor-pointer"
                              onClick={() => setIsCameraActive(false)}
                              title="Vypnout kamerový systém"
                            >
                              <X size={18} />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-3 text-slate-500 py-10">
                            <Camera size={40} className="opacity-40" />
                            <div className="text-center">
                              <p className="text-xs font-bold uppercase text-slate-400">Kamerový subsystém je v pohotovostním režimu</p>
                              <p className="text-[10px] text-slate-600">Klikněte pro zapnutí živých náhledů dveří a salónu</p>
                            </div>
                            <Button 
                              size="sm" 
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-lg cursor-pointer"
                              onClick={() => setIsCameraActive(true)}
                            >
                              Aktivovat kamery
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT: Virtual Instrument Cluster & Telemetry (5 cols) */}
                    <div className={cn(
                      "lg:col-span-5 flex flex-col gap-2.5 p-3 rounded-xl border shadow-xs min-h-0 transition-colors",
                      isDarkMode ? "bg-slate-900/90 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                    )}>
                      <div className="flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                          <Gauge size={16} className="text-amber-400" />
                          <span className="text-xs font-black uppercase tracking-wider">Digitální přístrojový panel</span>
                        </div>
                        <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          TELEMETRIE OK
                        </span>
                      </div>

                      {/* Primary Gauges Grid */}
                      <div className="grid grid-cols-2 gap-2 shrink-0">
                        {/* Speedometer */}
                        <div className={cn(
                          "p-2.5 rounded-xl border flex flex-col justify-between transition-colors",
                          isDarkMode ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
                        )}>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase text-slate-400">Rychlost</span>
                            <Gauge size={14} className="text-sky-400" />
                          </div>
                          <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-3xl font-black font-mono leading-none text-white">
                              {isDriving ? "46" : "0"}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">km/h</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-sky-400 h-full rounded-full transition-all duration-500" style={{ width: isDriving ? '46%' : '0%' }} />
                          </div>
                        </div>

                        {/* Engine Temp & RPM */}
                        <div className={cn(
                          "p-2.5 rounded-xl border flex flex-col justify-between transition-colors",
                          isDarkMode ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
                        )}>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase text-slate-400">Motor Cursor 9</span>
                            <Thermometer size={14} className="text-amber-400" />
                          </div>
                          <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-3xl font-black font-mono leading-none text-amber-400">
                              84
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">°C</span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-400 mt-1">
                            Otáčky: <strong className="text-slate-200">{isDriving ? '1 350' : '650'} RPM</strong>
                          </span>
                        </div>
                      </div>

                      {/* Pneumatic Brakes Dual Circuit Display */}
                      <div className={cn(
                        "p-2.5 rounded-xl border flex flex-col gap-1.5 transition-colors",
                        isDarkMode ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
                      )}>
                        <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                          <span>Tlak vzduchové soustavy (WABCO)</span>
                          <span className="text-emerald-400 font-bold">V POŘÁDKU</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800 flex justify-between items-center">
                            <span className="text-[9px] text-slate-400 uppercase">Okruh 1:</span>
                            <span className="font-black text-emerald-400">8.4 bar</span>
                          </div>
                          <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800 flex justify-between items-center">
                            <span className="text-[9px] text-slate-400 uppercase">Okruh 2:</span>
                            <span className="font-black text-emerald-400">8.5 bar</span>
                          </div>
                        </div>
                      </div>

                      {/* Fluid Levels & Transmission */}
                      <div className="grid grid-cols-3 gap-1.5 text-center shrink-0">
                        <div className={cn("p-2 rounded-xl border", isDarkMode ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200")}>
                          <span className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Palivo</span>
                          <span className="text-sm font-mono font-black text-amber-400">68%</span>
                        </div>
                        <div className={cn("p-2 rounded-xl border", isDarkMode ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200")}>
                          <span className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">AdBlue</span>
                          <span className="text-sm font-mono font-black text-sky-400">82%</span>
                        </div>
                        <div className={cn("p-2 rounded-xl border", isDarkMode ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200")}>
                          <span className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Převodovka</span>
                          <span className="text-sm font-mono font-black text-emerald-400">{isDriving ? 'D (Vpřed)' : 'N (Neutrál)'}</span>
                        </div>
                      </div>

                      {/* Door & Safety Indicators */}
                      <div className={cn(
                        "p-2.5 rounded-xl border flex flex-col gap-1.5 text-[9px] font-mono",
                        isDarkMode ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
                      )}>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 uppercase font-sans font-bold">Přední dveře (nástup):</span>
                          <span className="font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">ZAVŘENO / ZAJIŠTĚNO</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 uppercase font-sans font-bold">Střední dveře (výstup):</span>
                          <span className="font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">ZAVŘENO / ZAJIŠTĚNO</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 uppercase font-sans font-bold">Kneeling (ECAS snížení):</span>
                          <span className="font-bold text-slate-300">STANDARDNÍ VÝŠKA</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="history" className="flex-1 flex flex-col gap-3 mt-0 overflow-y-auto min-h-0 pb-12 lg:pb-0 scrollbar-none">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-3 min-h-0 flex-1"
                >
                  {/* Header & Shift Details */}
                  <div className={cn(
                    "p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 shrink-0 transition-colors shadow-xs",
                    isDarkMode ? "bg-slate-900/90 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                        <Receipt size={22} />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black uppercase tracking-wider">Vyúčtování směny & Pokladna</h3>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] uppercase font-bold">
                            POKLADNA OTEVŘENA
                          </Badge>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Řidič: {currentDriver?.name || 'Štěpán Stredni'} • Služba č. 402 • Vůz #4208 • DPHS Horní Slavkov
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        className="h-9 px-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                        onClick={() => setIsZReportOpen(true)}
                        title="Vytisknout denní finanční uzávěrku pokladny"
                      >
                        <Printer size={14} />
                        Uzávěrka směny (Z-Zpráva)
                      </Button>

                      {transactions.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-9 text-xs font-bold rounded-xl border transition-colors cursor-pointer",
                            isDarkMode ? "bg-slate-950 border-slate-800 text-rose-400 hover:bg-rose-500/10" : "bg-white border-slate-200 text-rose-600 hover:bg-rose-50"
                          )}
                          onClick={() => {
                            if (window.confirm("Opravdu si přejete smazat historii prodejů a zahájit novou směnu?")) {
                              setTransactions([]);
                              setPassengerCount(0);
                            }
                          }}
                        >
                          <Trash2 size={13} className="mr-1.5" />
                          Nová směna
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Summary Metric KPI Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
                    {/* Total Revenue */}
                    <div className={cn(
                      "p-3 rounded-xl border flex flex-col justify-between transition-colors shadow-xs",
                      isDarkMode ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
                    )}>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Celková tržba směny</span>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black font-mono leading-none text-amber-400 tabular-nums">
                          {transactions.filter(t => !t.storno).reduce((acc, t) => acc + t.price, 0)}
                        </span>
                        <span className="text-xs font-bold text-slate-400">Kč</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono mt-1">
                        Včetně 12% DPH
                      </span>
                    </div>

                    {/* Cash in Drawer */}
                    <div className={cn(
                      "p-3 rounded-xl border flex flex-col justify-between transition-colors shadow-xs",
                      isDarkMode ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
                    )}>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Hotovost v pokladně</span>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black font-mono leading-none text-emerald-400 tabular-nums">
                          {transactions.filter(t => !t.storno && (t.paymentMethod === 'HOTOVOST' || t.paymentMethod === 'CASH')).reduce((acc, t) => acc + t.price, 0)}
                        </span>
                        <span className="text-xs font-bold text-slate-400">Kč</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono mt-1">
                        K odvodu do trezoru
                      </span>
                    </div>

                    {/* Card & Mobile Payments */}
                    <div className={cn(
                      "p-3 rounded-xl border flex flex-col justify-between transition-colors shadow-xs",
                      isDarkMode ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
                    )}>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Karty & Mobil</span>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black font-mono leading-none text-sky-400 tabular-nums">
                          {transactions.filter(t => !t.storno && t.paymentMethod !== 'HOTOVOST' && t.paymentMethod !== 'CASH').reduce((acc, t) => acc + t.price, 0)}
                        </span>
                        <span className="text-xs font-bold text-slate-400">Kč</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono mt-1">
                        Bankovní zúčtování
                      </span>
                    </div>

                    {/* Sold Tickets & Passengers */}
                    <div className={cn(
                      "p-3 rounded-xl border flex flex-col justify-between transition-colors shadow-xs",
                      isDarkMode ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
                    )}>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Vydané doklady / Osoby</span>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black font-mono leading-none text-slate-100 tabular-nums">
                          {transactions.filter(t => !t.storno).length}
                        </span>
                        <span className="text-xs font-bold text-slate-400">ks / {transactions.filter(t => !t.storno).reduce((acc, t) => acc + (t.totalPassengers || 1), 0)} os.</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono mt-1">
                        Storna: {transactions.filter(t => t.storno).length} ks
                      </span>
                    </div>
                  </div>

                  {/* Filter Toolbar & Search */}
                  <div className={cn(
                    "p-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 shrink-0 transition-colors shadow-xs",
                    isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-slate-100 border-slate-200"
                  )}>
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Hledat doklad podle kódu, stanice nebo typu..."
                        value={historySearchQuery}
                        onChange={(e) => setHistorySearchQuery(e.target.value)}
                        className={cn(
                          "w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border focus:outline-none transition-colors",
                          isDarkMode ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-amber-500/50" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500"
                        )}
                      />
                      {historySearchQuery && (
                        <button
                          type="button"
                          onClick={() => setHistorySearchQuery("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[9px] font-bold">
                      {[
                        { id: 'all', label: 'Všechny platby' },
                        { id: 'cash', label: 'Hotovost' },
                        { id: 'card', label: 'Platební karta' },
                        { id: 'mobile', label: 'Mobil / QR' }
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setHistoryPaymentFilter(f.id as any)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg uppercase transition-all cursor-pointer border",
                            historyPaymentFilter === f.id
                              ? "bg-amber-500 border-amber-400 text-slate-950 font-black shadow-xs"
                              : (isDarkMode ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-white" : "bg-white border-slate-200 text-slate-600")
                          )}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Transactions Table / List */}
                  <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin min-h-0">
                    {transactions.length === 0 ? (
                      <div className={cn(
                        "h-full min-h-[220px] rounded-xl border flex flex-col items-center justify-center p-8 text-center gap-3 transition-colors",
                        isDarkMode ? "bg-slate-900/50 border-slate-800 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-400"
                      )}>
                        <Receipt size={40} className="opacity-40" />
                        <div>
                          <p className="text-sm font-bold uppercase text-slate-300">V této směně zatím nebyly vydány žádné jízdenky</p>
                          <p className="text-xs text-slate-500 mt-0.5">Jízdenky prodané v záložce „Prodej“ se zde automaticky zaevidují</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {transactions
                          .filter(t => {
                            if (historyPaymentFilter === 'cash') return t.paymentMethod === 'HOTOVOST' || t.paymentMethod === 'CASH';
                            if (historyPaymentFilter === 'card') return t.paymentMethod === 'CARD' || t.paymentMethod === 'KARTA';
                            if (historyPaymentFilter === 'mobile') return t.paymentMethod === 'MOBILE' || t.paymentMethod === 'MOBIL' || t.paymentMethod === 'QR';
                            return true;
                          })
                          .filter(t => {
                            if (!historySearchQuery) return true;
                            const q = historySearchQuery.toLowerCase();
                            return t.ticketCode.toLowerCase().includes(q) ||
                              t.fromStop.toLowerCase().includes(q) ||
                              t.toStop.toLowerCase().includes(q) ||
                              t.ticketType.toLowerCase().includes(q);
                          })
                          .map((t) => (
                            <div 
                              key={t.id} 
                              className={cn(
                                "p-3 rounded-xl border flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 transition-colors shadow-xs", 
                                isDarkMode ? "bg-slate-900/90 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900",
                                t.storno && "opacity-45 grayscale bg-slate-950/60"
                              )}
                            >
                              <div className="flex flex-col min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-black text-amber-400">
                                    {t.ticketCode}
                                  </span>
                                  <span className="font-bold text-sm truncate">
                                    {t.fromStop} → {t.toStop}
                                  </span>
                                  {t.storno && (
                                    <span className="bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                                      STORNO
                                    </span>
                                  )}
                                  {t.isMultilistek && (
                                    <span className="bg-amber-400 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded uppercase flex items-center gap-1 shadow-xs">
                                      <Ticket size={10} /> MULTILÍSTEK ({t.totalPassengers || 1} os.)
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1">
                                  <span>{t.ticketType}</span>
                                  <span>•</span>
                                  <span>{t.timestamp ? new Date(t.timestamp).toLocaleTimeString('cs-CZ') : ''}</span>
                                  <span>•</span>
                                  <span className={cn(
                                    "px-1.5 py-0.2 rounded font-bold uppercase text-[8px]",
                                    t.paymentMethod === 'HOTOVOST' || t.paymentMethod === 'CASH'
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : "bg-sky-500/20 text-sky-400"
                                  )}>
                                    {t.paymentMethod || 'HOTOVOST'}
                                  </span>
                                </div>

                                {t.note && (
                                  <span className="text-[10px] text-amber-400/80 font-bold italic mt-0.5">
                                    Poznámka: {t.note}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <div className="text-right mr-1">
                                  <span className={cn(
                                    "text-xl font-black font-mono leading-none block",
                                    t.storno ? "line-through text-slate-500" : "text-amber-400"
                                  )}>
                                    {t.storno ? 0 : t.price} Kč
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-mono">
                                    {t.storno ? "stornováno" : "uhrazeno"}
                                  </span>
                                </div>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={cn(
                                    "h-8 px-2.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer",
                                    isDarkMode ? "bg-slate-950 border-slate-800 text-slate-200 hover:text-white" : "bg-slate-100 border-slate-300 text-slate-800"
                                  )}
                                  onClick={() => {
                                    setPrintedTicketModalData(t);
                                    setIsTicketPreviewOpen(true);
                                  }}
                                  title="Zobrazit tiskový doklad na obrazovce"
                                >
                                  <Receipt size={13} className="mr-1 text-amber-400" /> Doklad
                                </Button>

                                {!t.storno && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 px-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-black cursor-pointer"
                                    onClick={() => {
                                      if (window.confirm(`Opravdu si přejete stornovat doklad ${t.ticketCode} (${t.price} Kč)?`)) {
                                        stornoTicket(t.id);
                                        playThermalPrinterSound();
                                      }
                                    }}
                                  >
                                    Storno
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
                <div className={cn(
                  "rounded-2xl border p-4 sm:p-5 relative flex-1 flex flex-col min-h-0 transition-colors shadow-sm",
                  isDarkMode ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
                )}>
                  <div className="flex flex-col gap-4 sm:gap-5 flex-1 justify-between">
                    {/* Top Status Bar with Weather simulation buttons */}
                    <div className={cn(
                      "flex flex-wrap justify-between items-center gap-2 border-b pb-3 shrink-0",
                      isDarkMode ? "border-slate-800" : "border-slate-200"
                    )}>
                      <div className="flex flex-col">
                        <h3 className={cn(
                          "font-bold uppercase tracking-wider leading-none mb-1 text-base",
                          isDarkMode ? "text-amber-400" : "text-slate-900"
                        )}>
                          Regulace Klimatizace & Větrání Iveco
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", hvac.auto ? "bg-emerald-400 animate-pulse" : "bg-slate-600")} />
                          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">
                            {hvac.auto ? "Automatický režim aktivní" : "Manuální dvouzónová regulace"}
                          </span>
                        </div>
                      </div>

                      {/* Weather preset simulation triggers & live readout */}
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "hidden sm:flex items-center gap-1 p-1 rounded-lg border",
                          isDarkMode ? "bg-slate-950/80 border-slate-800" : "bg-slate-100 border-slate-200"
                        )}>
                          <span className="text-[8px] text-slate-400 uppercase font-black px-1">Počasí:</span>
                          <button
                            type="button"
                            onClick={() => setHvac(prev => ({ ...prev, externalTemp: 32 }))}
                            className={cn("text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors", hvac.externalTemp >= 28 ? "bg-amber-500 text-slate-950 font-black" : "text-slate-400 hover:text-white")}
                            title="Nastavit letní horko 32°C"
                          >
                            ☀️ 32°C
                          </button>
                          <button
                            type="button"
                            onClick={() => setHvac(prev => ({ ...prev, externalTemp: 23 }))}
                            className={cn("text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors", hvac.externalTemp >= 20 && hvac.externalTemp <= 25 ? "bg-emerald-500 text-slate-950 font-black" : "text-slate-400 hover:text-white")}
                            title="Nastavit 23°C (ideální pro větrání okny Iveco bez AC)"
                          >
                            ⛅ 23°C (Větrání)
                          </button>
                          <button
                            type="button"
                            onClick={() => setHvac(prev => ({ ...prev, externalTemp: 10 }))}
                            className={cn("text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors", hvac.externalTemp >= 4 && hvac.externalTemp < 20 ? "bg-sky-500 text-white font-black" : "text-slate-400 hover:text-white")}
                            title="Nastavit chladno 10°C"
                          >
                            🌧️ 10°C
                          </button>
                          <button
                            type="button"
                            onClick={() => setHvac(prev => ({ ...prev, externalTemp: -2 }))}
                            className={cn("text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors", hvac.externalTemp < 4 ? "bg-blue-600 text-white font-black" : "text-slate-400 hover:text-white")}
                            title="Nastavit zimní mráz -2°C"
                          >
                            ❄️ -2°C
                          </button>
                        </div>

                        <div className="flex flex-col items-end">
                           <span className="text-[8px] text-slate-400 font-bold uppercase mb-0.5">Venku</span>
                           <span className={cn(
                             "font-mono text-base font-black px-2 py-0.5 rounded-lg border",
                             isDarkMode ? "bg-slate-950 text-amber-400 border-slate-800" : "bg-slate-100 text-slate-900 border-slate-200"
                           )}>
                             {hvac.externalTemp.toFixed(1)}°C
                           </span>
                        </div>
                      </div>
                    </div>

                    {/* Sub-View Switcher: HVAC Controls vs Iveco Windows & Roof Hatches Layout */}
                    <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800 shrink-0">
                      <button
                        type="button"
                        id="hvac-tab-controls-btn"
                        onClick={() => setHvacSubView('controls')}
                        className={cn(
                          "flex-1 py-1.5 px-3 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2",
                          hvacSubView === 'controls'
                            ? "bg-orange-500 text-black shadow-md font-black"
                            : "text-zinc-400 hover:text-white"
                        )}
                      >
                        <Sliders size={14} />
                        Klimatizace & Topení
                      </button>

                      <button
                        type="button"
                        id="hvac-tab-windows-btn"
                        onClick={() => setHvacSubView('windows')}
                        className={cn(
                          "flex-1 py-1.5 px-3 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2",
                          hvacSubView === 'windows'
                            ? "bg-emerald-500 text-black shadow-md font-black"
                            : "text-zinc-400 hover:text-white"
                        )}
                      >
                        <Wind size={14} className={openWindowCount > 0 ? "text-emerald-400 animate-pulse" : ""} />
                        <span>Půdorys Oken & Stropu Iveco</span>
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-mono font-bold", openWindowCount > 0 ? "bg-emerald-950 text-emerald-300 border border-emerald-700/50" : "bg-zinc-900 text-zinc-500")}>
                          {openWindowCount}/9 otevřeno
                        </span>
                      </button>
                    </div>

                    {hvacSubView === 'windows' ? (
                      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                        <IvecoWindowLayout
                          windows={busWindows}
                          setWindows={setBusWindows}
                          externalTemp={hvac.externalTemp}
                          passengerTemp={hvac.passengerTemp}
                          driverTemp={hvac.driverTemp}
                          isDriving={isDriving}
                          isDarkMode={isDarkMode}
                          acActive={hvac.ac}
                        />
                      </div>
                    ) : (
                      <>
                        {/* Main HVAC Control Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 flex-1 min-h-0 overflow-y-auto pr-1">
                      {/* Left: Driver Controls */}
                      <div className="md:col-span-3 flex flex-col gap-3 justify-between">
                         <div className="bg-zinc-900/40 p-3 sm:p-4 rounded-xl border border-zinc-800/50 flex flex-col gap-2.5 shadow-inner">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-orange-500 font-black uppercase tracking-widest">Zóna 1: Řidič</span>
                              <span className="text-[9px] font-mono font-bold text-orange-400 bg-orange-950/40 px-1.5 py-0.5 rounded border border-orange-800/40">
                                Reál: {hvac.driverTemp.toFixed(1)}°C
                              </span>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                               {/* Horizontal slider control */}
                               <div className="flex items-center gap-2">
                                  <Button 
                                    variant="ghost" 
                                    className="h-9 w-9 shrink-0 bg-zinc-950 border border-zinc-800 font-mono font-black text-lg hover:text-orange-500 rounded-lg active:scale-95 transition-transform" 
                                    onClick={() => setHvac(prev => ({ ...prev, targetDriverTemp: Math.max(16, prev.targetDriverTemp - 1) }))}
                                  >
                                    -
                                  </Button>
                                  
                                  {/* Slider Track with Dot Handle */}
                                  <div className="flex-1 py-3 relative">
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
                                    className="h-9 w-9 shrink-0 bg-zinc-950 border border-zinc-800 font-mono font-black text-lg hover:text-orange-500 rounded-lg active:scale-95 transition-transform" 
                                    onClick={() => setHvac(prev => ({ ...prev, targetDriverTemp: Math.min(28, prev.targetDriverTemp + 1) }))}
                                  >
                                    +
                                  </Button>
                               </div>
                               
                               {/* Display/Value */}
                               <div className="text-center bg-black/50 py-1.5 rounded border border-zinc-800/40 shadow-inner">
                                  <span className="text-[8px] text-zinc-500 uppercase block font-bold">Požadovaná teplota kabiny</span>
                                  <span className="text-2xl font-mono font-black text-orange-400">{hvac.targetDriverTemp}.0°C</span>
                                </div>
                            </div>
                         </div>

                         <Button 
                          variant="ghost" 
                          className={cn("h-14 border-2 flex flex-col gap-0.5 transition-all shadow-md mt-auto", hvac.frontDefrost ? "border-orange-500 text-orange-500 bg-orange-500/10" : "border-zinc-800 text-zinc-600")}
                          onClick={() => setHvac(prev => ({ ...prev, frontDefrost: !prev.frontDefrost }))}
                         >
                            <Wind size={20} />
                            <span className="text-[9px] font-black uppercase">Odmrazování čelního skla</span>
                         </Button>
                      </div>

                      {/* Middle: LCD & Real-Time Thermodynamics Monitor */}
                      <div className="md:col-span-6 bg-[#020202] border-2 border-zinc-800 rounded-xl relative overflow-hidden flex flex-col p-4 sm:p-5 shadow-[inset_0_0_40px_rgba(0,0,0,1)] justify-between min-h-[300px]">
                         <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(0,100,255,0.05),transparent)] z-10" />
                         
                         <div className="flex justify-between items-center mb-3 shrink-0">
                            <span className="text-[8px] text-zinc-500 font-mono tracking-[0.3em]">CROSSWAY_OIB_THERMAL_ENGINE</span>
                            <div className="flex items-center gap-3">
                               {hvac.ac && (
                                 <div className="flex items-center gap-1 text-cyan-400 text-[9px] font-bold">
                                   <Snowflake size={14} className="animate-spin-slow" />
                                   <span>CHLAZENÍ</span>
                                 </div>
                               )}
                               {hvac.webasto && (
                                 <div className="flex items-center gap-1 text-orange-500 text-[9px] font-bold">
                                   <Flame size={14} className="animate-pulse" />
                                   <span>WEBASTO</span>
                                 </div>
                               )}
                               {!hvac.ac && !hvac.webasto && hvac.externalTemp > 18 && (
                                 <div className="flex items-center gap-1 text-amber-500 text-[9px] font-bold animate-pulse">
                                   <Sun size={14} />
                                   <span>SKLENÍK</span>
                                 </div>
                               )}
                            </div>
                         </div>

                         {/* Real-Time Dual Temperatures Gauges */}
                         <div className="grid grid-cols-2 gap-3 py-2 border-y border-zinc-900 items-center min-h-0">
                            {/* Driver Cabin Real Temp */}
                            <div className="flex flex-col items-center justify-center border-r border-zinc-800/40 pr-2">
                               <div className="flex items-center gap-1 text-orange-400 mb-1">
                                 <Home size={12} />
                                 <span className="text-[9px] font-black uppercase tracking-wider">Kabina Řidič</span>
                               </div>
                               <span className="text-4xl sm:text-5xl font-mono font-black text-orange-400 tabular-nums drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                                 {hvac.driverTemp.toFixed(1)}°
                               </span>
                               <span className="text-[9px] text-zinc-500 font-mono mt-0.5">Cíl: {hvac.targetDriverTemp}°C</span>
                            </div>

                            {/* Passenger Salon Real Temp */}
                            <div className="flex flex-col items-center justify-center pl-2">
                               <div className="flex items-center gap-1 text-cyan-400 mb-1">
                                 <Users size={12} />
                                 <span className="text-[9px] font-black uppercase tracking-wider">Salón Cestující</span>
                               </div>
                               <span className="text-4xl sm:text-5xl font-mono font-black text-cyan-400 tabular-nums drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                                 {hvac.passengerTemp.toFixed(1)}°
                               </span>
                               <span className="text-[9px] text-zinc-500 font-mono mt-0.5">Cíl: {hvac.targetPassengerTemp}°C</span>
                            </div>
                         </div>

                         {/* Real-time Physics explanation message */}
                         <div className="my-2 bg-zinc-950 p-2 rounded border border-zinc-800/60 text-left">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
                              Fyzikální stav interiéru vozu:
                            </span>
                            <p className="text-[9px] font-mono leading-relaxed text-zinc-300">
                              {openWindowCount > 0 ? (
                                <span className="text-emerald-400">
                                  🍃 <strong>Přirozené větrání Iveco ({openWindowCount}/9 prvků):</strong> Otevřená okna a stropní poklopy vytváří {isDriving ? 'silné náporové větrání za jízdy' : 'přirozený průvan'}. Vzduch ({hvac.externalTemp.toFixed(1)}°C) ochlazuje interiér vozu bez nutnosti spouštět klimatizaci!
                                </span>
                              ) : !hvac.ac && !hvac.webasto && hvac.externalTemp > 18 ? (
                                <span className="text-amber-400">
                                  ☀️ <strong>Sluneční ohřev (skleníkový efekt):</strong> Okna i klimatizace jsou zavřené/vypnuté. Teplota stoupá ({hvac.externalTemp.toFixed(1)}°C venku). Pro úsporu paliva můžete <u>otevřít boční okna a stropní poklopy</u> místo zapínání klimatizace.
                                </span>
                              ) : hvac.ac ? (
                                <span className="text-cyan-400">
                                  ❄️ <strong>Aktivní klimatizace:</strong> Kompresor ochlazuje vzduch vozu směrem k nastaveným hodnotám ({hvac.targetDriverTemp}°C / {hvac.targetPassengerTemp}°C).
                                </span>
                              ) : hvac.webasto ? (
                                <span className="text-orange-400">
                                  🔥 <strong>Nezávislé topení Webasto:</strong> Intenzivní předehřev obou zón vozidla.
                                </span>
                              ) : (
                                <span className="text-emerald-400">
                                  🍃 <strong>Přirozené větrání:</strong> Standardní cirkulace vzduchu bez aktivního chlazení či topení.
                                </span>
                              )}
                            </p>

                            <button
                              type="button"
                              onClick={() => setHvacSubView('windows')}
                              className="mt-2 w-full py-1 px-2 rounded bg-emerald-950/70 border border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/80 text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Wind size={12} />
                              {openWindowCount > 0 
                                ? `Upravit otevřená okna a strop (${openWindowCount}/9)` 
                                : "Otevřít okna a stropní poklopy Iveco (při 23°C bez AC)"}
                            </button>
                         </div>

                         {/* Interactive Fan Speed Controller (Regulace foukání 0-7) */}
                         <div className="bg-zinc-950/90 p-2.5 rounded-lg border border-zinc-800 flex flex-col gap-2 shadow-inner">
                            <div className="flex justify-between items-center">
                               <div className="flex items-center gap-1.5 text-zinc-400">
                                 <Wind size={14} className={cn("text-emerald-400", hvac.fanSpeed > 0 && "animate-pulse")} />
                                 <span className="text-[9px] font-black uppercase tracking-wider">Výkon ventilátoru (Foukání)</span>
                               </div>
                               <div className="flex items-center gap-2">
                                 {hvac.auto && (
                                   <span className="text-[8px] bg-green-950/60 text-green-400 border border-green-800/40 px-1.5 py-0.5 rounded font-mono font-bold">
                                     AUTO
                                   </span>
                                 )}
                                 <span className="text-xs font-mono font-black text-emerald-400">
                                   {hvac.fanSpeed === 0 ? "VYPNUTO (0)" : `STUPEŇ ${hvac.fanSpeed} / 7`}
                                 </span>
                               </div>
                            </div>

                            {/* Clickable Step Bars and [-] [+] Buttons */}
                            <div className="flex items-center gap-2">
                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 className="h-8 w-8 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded font-black text-sm active:scale-95 shrink-0" 
                                 onClick={() => setHvac(prev => ({ 
                                   ...prev, 
                                   auto: false, 
                                   fanSpeed: Math.max(0, prev.fanSpeed - 1) 
                                 }))}
                                 title="Snížit výkon foukání"
                               >
                                 -
                               </Button>

                               {/* Interactive Step Blocks */}
                               <div className="flex-1 flex gap-1 items-center h-8 bg-black/60 p-1 rounded border border-zinc-900">
                                 <button
                                   type="button"
                                   onClick={() => setHvac(prev => ({ ...prev, auto: false, fanSpeed: 0 }))}
                                   className={cn(
                                     "px-1.5 h-full rounded text-[8px] font-black transition-all cursor-pointer select-none",
                                     hvac.fanSpeed === 0 
                                       ? "bg-red-950/80 text-red-400 border border-red-800/60 shadow-inner" 
                                       : "bg-zinc-900/60 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                                   )}
                                   title="Vypnout ventilátor (0)"
                                 >
                                   0
                                 </button>

                                 {[1, 2, 3, 4, 5, 6, 7].map(step => (
                                   <button
                                     key={step}
                                     type="button"
                                     onClick={() => setHvac(prev => ({ ...prev, auto: false, fanSpeed: step }))}
                                     className={cn(
                                       "flex-1 h-full rounded flex flex-col items-center justify-center transition-all cursor-pointer select-none relative group",
                                       step <= hvac.fanSpeed 
                                         ? step >= 6 
                                           ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.6)] font-black"
                                           : step >= 4
                                           ? "bg-emerald-500 text-black shadow-[0_0_8px_rgba(16,185,129,0.5)] font-black"
                                           : "bg-emerald-600/90 text-white font-bold"
                                         : "bg-zinc-900/70 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-400"
                                     )}
                                     title={`Nastavit foukání na stupeň ${step}`}
                                   >
                                     <span className="text-[8px] font-mono leading-none">{step}</span>
                                     <div 
                                       className={cn(
                                         "w-full h-1 rounded-full mt-0.5",
                                         step <= hvac.fanSpeed ? "bg-white/40" : "bg-zinc-800"
                                       )} 
                                     />
                                   </button>
                                 ))}
                               </div>

                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 className="h-8 w-8 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded font-black text-sm active:scale-95 shrink-0" 
                                 onClick={() => setHvac(prev => ({ 
                                   ...prev, 
                                   auto: false, 
                                   fanSpeed: Math.min(7, prev.fanSpeed + 1) 
                                 }))}
                                 title="Zvýšit výkon foukání"
                               >
                                 +
                               </Button>
                            </div>

                            {/* Quick intensity presets */}
                            <div className="flex items-center justify-between gap-1 text-[8px] font-bold">
                               <button
                                 type="button"
                                 onClick={() => setHvac(prev => ({ ...prev, auto: false, fanSpeed: 1 }))}
                                 className={cn(
                                   "flex-1 py-1 px-1 rounded border text-center transition-colors cursor-pointer",
                                   hvac.fanSpeed === 1 && !hvac.auto ? "bg-emerald-950 text-emerald-300 border-emerald-700" : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                                 )}
                               >
                                 🍃 Jemné (1)
                               </button>
                               <button
                                 type="button"
                                 onClick={() => setHvac(prev => ({ ...prev, auto: false, fanSpeed: 3 }))}
                                 className={cn(
                                   "flex-1 py-1 px-1 rounded border text-center transition-colors cursor-pointer",
                                   hvac.fanSpeed === 3 && !hvac.auto ? "bg-emerald-950 text-emerald-300 border-emerald-700" : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                                 )}
                               >
                                 💨 Střední (3)
                               </button>
                               <button
                                 type="button"
                                 onClick={() => setHvac(prev => ({ ...prev, auto: false, fanSpeed: 5 }))}
                                 className={cn(
                                   "flex-1 py-1 px-1 rounded border text-center transition-colors cursor-pointer",
                                   hvac.fanSpeed === 5 && !hvac.auto ? "bg-cyan-950 text-cyan-300 border-cyan-700" : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                                 )}
                               >
                                 ⚡ Silné (5)
                               </button>
                               <button
                                 type="button"
                                 onClick={() => setHvac(prev => ({ ...prev, auto: false, fanSpeed: 7 }))}
                                 className={cn(
                                   "flex-1 py-1 px-1 rounded border text-center transition-colors cursor-pointer",
                                   hvac.fanSpeed === 7 && !hvac.auto ? "bg-cyan-900 text-cyan-200 border-cyan-500 font-black shadow-[0_0_8px_rgba(6,182,212,0.4)]" : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                                 )}
                               >
                                 ❄️ TURBO (7)
                               </button>
                            </div>
                         </div>

                         {/* Volume slider */}
                         <div className="mt-2 bg-zinc-900/30 p-2.5 rounded-lg border border-zinc-800/50 flex flex-col gap-1.5 shrink-0">
                            <div className="flex justify-between items-center text-[9px] font-black uppercase text-zinc-500">
                               <span>Hlasitost Hlášení ve Voze</span>
                               <span className="text-amber-400 font-mono">{busStats.volume}%</span>
                            </div>
                            <div className="flex items-center gap-3">
                               <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white" onClick={() => setBusStats(prev => ({ ...prev, volume: Math.max(0, prev.volume - 5) }))}>-</Button>
                               <div className="flex-1 h-2 bg-black rounded-full overflow-hidden border border-zinc-800">
                                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${busStats.volume}%` }} />
                                </div>
                               <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white" onClick={() => setBusStats(prev => ({ ...prev, volume: Math.min(100, prev.volume + 5) }))}>+</Button>
                            </div>
                         </div>
                      </div>

                      {/* Right: Passenger Controls */}
                      <div className="md:col-span-3 flex flex-col gap-3 justify-between">
                         <div className="bg-zinc-900/40 p-3 sm:p-4 rounded-xl border border-zinc-800/50 flex flex-col gap-2.5 shadow-inner">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Zóna 2: Salón</span>
                              <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">
                                Reál: {hvac.passengerTemp.toFixed(1)}°C
                              </span>
                            </div>

                            <div className="flex flex-col gap-2">
                               {/* Horizontal slider control */}
                               <div className="flex items-center gap-2">
                                  <Button 
                                    variant="ghost" 
                                    className="h-9 w-9 shrink-0 bg-zinc-950 border border-zinc-800 font-mono font-black text-lg hover:text-blue-500 rounded-lg active:scale-95 transition-transform" 
                                    onClick={() => setHvac(prev => ({ ...prev, targetPassengerTemp: Math.max(16, prev.targetPassengerTemp - 1) }))}
                                  >
                                    -
                                  </Button>
                                  
                                  {/* Slider Track with Dot Handle */}
                                  <div className="flex-1 py-3 relative">
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
                                    className="h-9 w-9 shrink-0 bg-zinc-950 border border-zinc-800 font-mono font-black text-lg hover:text-blue-500 rounded-lg active:scale-95 transition-transform" 
                                    onClick={() => setHvac(prev => ({ ...prev, targetPassengerTemp: Math.min(28, prev.targetPassengerTemp + 1) }))}
                                  >
                                    +
                                  </Button>
                               </div>
                               
                               {/* Display/Value */}
                               <div className="text-center bg-black/50 py-1.5 rounded border border-zinc-800/40 shadow-inner">
                                  <span className="text-[8px] text-zinc-500 uppercase block font-bold">Požadovaná teplota salónu</span>
                                  <span className="text-2xl font-mono font-black text-cyan-400">{hvac.targetPassengerTemp}.0°C</span>
                               </div>
                            </div>
                         </div>

                         <Button 
                          variant="ghost" 
                          className={cn("h-14 border-2 flex flex-col gap-0.5 transition-all shadow-md mt-auto", hvac.recirculation ? "border-yellow-600 text-yellow-500 bg-yellow-500/10" : "border-zinc-800 text-zinc-600")}
                          onClick={() => setHvac(prev => ({ ...prev, recirculation: !prev.recirculation }))}
                         >
                            <RefreshCw size={20} />
                            <span className="text-[9px] font-black uppercase">Vnitřní recirkulace</span>
                         </Button>
                      </div>
                    </div>
                      </>
                    )}

                    {/* Bottom Action Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0 pt-3 border-t border-zinc-900/60">
                        <Button 
                          className={cn("h-14 font-black uppercase text-xs border-2 transition-all active:scale-95", hvac.ac ? "bg-cyan-900/40 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]" : "bg-black border-zinc-800 text-zinc-500")}
                          onClick={() => setHvac(prev => ({ ...prev, ac: !prev.ac }))}
                        >
                          <Snowflake size={16} className="mr-1.5" />
                          {hvac.ac ? "Klimatizace: ZAP" : "Klimatizace: VYP"}
                        </Button>
                        <Button 
                          className={cn("h-14 font-black uppercase text-xs border-2 transition-all active:scale-95", hvac.webasto ? "bg-orange-900/40 border-orange-500 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.2)]" : "bg-black border-zinc-800 text-zinc-500")}
                          onClick={() => setHvac(prev => ({ ...prev, webasto: !prev.webasto }))}
                        >
                          <Flame size={16} className="mr-1.5" />
                          {hvac.webasto ? "Webasto: ZAP" : "Webasto: VYP"}
                        </Button>
                        <Button 
                          className={cn("h-14 font-black uppercase text-xs border-2 transition-all active:scale-95", hvac.auto ? "bg-green-900/40 border-green-500 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]" : "bg-black border-zinc-800 text-zinc-500")}
                          onClick={() => setHvac(prev => ({ ...prev, auto: !prev.auto }))}
                        >
                          <RefreshCw size={16} className="mr-1.5" />
                          {hvac.auto ? "Automatika: ZAP" : "Automatika: VYP"}
                        </Button>
                        <Button 
                          className={cn(
                            "h-14 font-black uppercase text-xs border-2 transition-all active:scale-95",
                            hvacSubView === 'windows' || openWindowCount > 0
                              ? "bg-emerald-950/60 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                              : "bg-black border-zinc-800 text-zinc-400 hover:text-white"
                          )}
                          onClick={() => setHvacSubView(prev => prev === 'windows' ? 'controls' : 'windows')}
                        >
                          <Wind size={16} className="mr-1.5" />
                          {hvacSubView === 'windows' ? "Zpět na Regulaci" : `Okna Iveco (${openWindowCount}/9)`}
                        </Button>
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
                  className="flex flex-col gap-4 min-h-0 p-2"
                >
                  <div className={cn(
                    "rounded-2xl border p-5 relative shadow-sm transition-colors",
                    isDarkMode ? "bg-slate-900/90 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                  )}>
                    <div className="flex flex-col gap-6">
                      {/* Top Status Bar */}
                      <div className={cn("flex justify-between items-center border-b pb-4", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                            <h3 className="text-amber-500 font-bold uppercase tracking-wider text-base">Crossway OIB System Settings</h3>
                          </div>
                          <span className={cn("text-xs font-mono font-medium text-left mt-0.5", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                            Systémová konfigurace a diagnostika vozidla Iveco Crossway
                          </span>
                        </div>
                        <Button 
                          variant="destructive" 
                          className="bg-red-600/90 hover:bg-red-600 text-white font-bold uppercase text-xs tracking-wider px-4 py-2 rounded-xl shadow-sm transition-all"
                          onClick={() => setIsLoggedIn(false)}
                        >
                          ODHLÁSIT ŘIDIČE
                        </Button>
                      </div>

                      {/* Settings Details Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-2 text-left">
                        {/* Left: General Settings */}
                        <div className={cn(
                          "p-4 rounded-xl border flex flex-col gap-5",
                          isDarkMode ? "bg-slate-950/60 border-slate-800/80" : "bg-slate-50 border-slate-200"
                        )}>
                          <span className="text-xs text-amber-500 font-bold uppercase tracking-wider">ZVUKY A DISPLEJ</span>
                          
                          <div className={cn(
                            "p-3.5 rounded-xl border flex flex-col gap-3",
                            isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
                          )}>
                            <div className="flex justify-between items-center text-xs font-bold uppercase">
                               <span className={isDarkMode ? "text-slate-300" : "text-slate-700"}>Celková Hlasitost Hlášení</span>
                               <span className="text-amber-500 font-mono font-bold">{busStats.volume}%</span>
                            </div>
                            <div className="flex items-center gap-3">
                               <Button variant="ghost" size="icon" className={cn("h-8 w-8 rounded-lg border font-bold text-sm", isDarkMode ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-700 hover:bg-slate-100")} onClick={() => setBusStats(prev => ({ ...prev, volume: Math.max(0, prev.volume - 5) }))}>-</Button>
                               <div className={cn("flex-1 h-2 rounded-full overflow-hidden border", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-200 border-slate-300")}>
                                  <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${busStats.volume}%` }} />
                               </div>
                               <Button variant="ghost" size="icon" className={cn("h-8 w-8 rounded-lg border font-bold text-sm", isDarkMode ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-700 hover:bg-slate-100")} onClick={() => setBusStats(prev => ({ ...prev, volume: Math.min(100, prev.volume + 5) }))}>+</Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between px-1">
                            <span className={cn("text-xs font-bold uppercase", isDarkMode ? "text-slate-300" : "text-slate-700")}>Hlas hlášení zastávek</span>
                            <div className={cn("flex gap-1.5 p-1 rounded-xl border", isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-200 border-slate-300")}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn("px-4 uppercase font-bold text-xs h-8 rounded-lg transition-all", selectedVoiceType === 'male' ? "bg-amber-500 text-slate-950 shadow-sm" : isDarkMode ? "text-slate-400 hover:text-slate-100" : "text-slate-600 hover:text-slate-950")}
                                onClick={() => setSelectedVoiceType('male')}
                              >Muž</Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn("px-4 uppercase font-bold text-xs h-8 rounded-lg transition-all", selectedVoiceType === 'female' ? "bg-amber-500 text-slate-950 shadow-sm" : isDarkMode ? "text-slate-400 hover:text-slate-100" : "text-slate-600 hover:text-slate-950")}
                                onClick={() => setSelectedVoiceType('female')}
                              >Žena</Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between px-1">
                            <span className={cn("text-xs font-bold uppercase", isDarkMode ? "text-slate-300" : "text-slate-700")}>Vzhled rozhraní</span>
                            <Button 
                              variant="outline"
                              className={cn("h-9 px-4 font-bold uppercase text-xs rounded-xl border transition-all", isDarkMode ? "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800" : "bg-white border-slate-300 text-slate-800 hover:bg-slate-100")}
                              onClick={() => setIsDarkMode(!isDarkMode)}
                            >{isDarkMode ? '🌙 Tmavý režim' : '☀️ Světlý režim'}</Button>
                          </div>
                        </div>

                        {/* Right: Deviation Calibration */}
                        <div className={cn(
                          "p-4 rounded-xl border flex flex-col gap-4 justify-between",
                          isDarkMode ? "bg-slate-950/60 border-slate-800/80" : "bg-slate-50 border-slate-200"
                        )}>
                          <span className="text-xs text-sky-500 font-bold uppercase tracking-wider">KALIBRACE JÍZDNÍHO ŘÁDU</span>
                          
                          <div className={cn(
                            "p-4 rounded-xl border flex items-center justify-between gap-6",
                            isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
                          )}>
                            <div className="flex flex-col items-start">
                              <span className={cn("text-[10px] font-bold uppercase mb-1", isDarkMode ? "text-slate-400" : "text-slate-500")}>Odchylka od JŘ</span>
                              <div className={cn("text-4xl font-mono font-bold tabular-nums", deviation === 0 ? "text-emerald-500" : deviation > 0 ? "text-amber-500" : "text-sky-500")}>
                                 {formatDeviation(deviation)}
                              </div>
                            </div>
                            <div className="flex gap-2">
                               <Button variant="outline" className={cn("h-12 px-5 border rounded-xl font-bold text-sm", isDarkMode ? "border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100" : "border-slate-300 bg-white hover:bg-slate-100 text-slate-800")} onClick={() => setDeviation(prev => prev - 15)}>-15s</Button>
                               <Button variant="outline" className={cn("h-12 px-5 border rounded-xl font-bold text-sm", isDarkMode ? "border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100" : "border-slate-300 bg-white hover:bg-slate-100 text-slate-800")} onClick={() => setDeviation(prev => prev + 15)}>+15s</Button>
                            </div>
                          </div>

                          <span className={cn("text-[11px] text-left leading-relaxed", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                            Doporučení: Odchylka se kalibruje automaticky na neregistrovaných zastávkách dle GPS lokace. V případě potřeby proveďte manuální korekci.
                          </span>
                        </div>
                      </div>

                      <div className={cn(
                        "p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4",
                        isDarkMode ? "bg-slate-950/40 border-slate-800/60" : "bg-slate-100/70 border-slate-200"
                      )}>
                         <div className="flex flex-col items-start">
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider mb-0.5", isDarkMode ? "text-slate-400" : "text-slate-500")}>STAV PALUBNÍHO INFORMAČNÍHO SYSTÉMU (OIB)</span>
                            <span className={cn("text-xs font-mono font-bold", isDarkMode ? "text-emerald-400" : "text-emerald-600")}>TELMAX TRANS_NET_OIB_v5 • READY</span>
                         </div>
                         <div className="flex flex-col items-center md:items-end gap-1.5">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10 text-xs font-bold uppercase h-8 px-3 rounded-lg">Totální reset OIB</Button>
                              </DialogTrigger>
                              <DialogContent className={isDarkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white text-slate-900"}>
                                <DialogHeader><DialogTitle className="text-red-500 uppercase font-bold">Potvrdit restart?</DialogTitle></DialogHeader>
                                <p className="text-sm opacity-70">Varování: Tato akce vymaže veškeré tržby a aktuální směnu z paměti terminálu.</p>
                                <div className="flex gap-4 mt-6">
                                  <Button variant="outline" className="flex-1 h-12 font-bold rounded-xl" onClick={() => handleActivity()}>Zrušit</Button>
                                  <Button variant="destructive" className="flex-1 h-12 font-bold rounded-xl" onClick={handleReset}>SMAZAT VŠE</Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <span className={cn("text-[9px] font-mono", isDarkMode ? "text-slate-500" : "text-slate-400")}>FW: v5.0.42_IVC_XWAY • BUILD_OIB_2026</span>
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
        "h-10 flex items-stretch border-t shrink-0 z-10 transition-colors shadow-md",
        isDarkMode ? "border-slate-800 bg-slate-950 text-slate-200" : "border-slate-200 bg-white text-slate-800"
      )}>
        {/* Modular Status Blocks */}
        <div className="flex-1 grid grid-cols-6 divide-x divide-slate-800/40 dark:divide-slate-800">
          {/* Time & Temp */}
          <div className="flex flex-col items-center justify-center px-2">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-none mb-0.5">Venku / Salón</span>
            <div className="flex items-baseline gap-1.5 select-none">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400" title="Venkovní teplota">{hvac.externalTemp}°C</span>
              <span className="text-xs font-mono font-bold text-sky-500" title="Vnitřní teplota salónu">{hvac.passengerTemp.toFixed(1)}°C</span>
            </div>
          </div>

          {/* Signals */}
          <div className="flex items-center justify-around px-3">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5 items-end h-3">
                {[1,2,3,4].map(i => <div key={i} className={cn("w-1 rounded-sm", i <= 3 ? "bg-emerald-500" : isDarkMode ? "bg-slate-800" : "bg-slate-200", i === 1 ? "h-1.5" : i === 2 ? "h-2" : i === 3 ? "h-2.5" : "h-3")} />)}
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-400">4G</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono font-bold text-slate-400">GPS</span>
            </div>
          </div>

          {/* Revenue */}
          <div className="col-span-2 flex flex-col items-center justify-center px-2">
             <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-none mb-0.5">Dnešní tržba</span>
             <span className="text-base font-bold font-mono leading-none text-emerald-500">
               {transactions.filter(t => !t.storno).reduce((acc, t) => acc + t.price, 0).toLocaleString('cs-CZ')} <span className="text-xs font-normal">Kč</span>
             </span>
          </div>

          {/* System Info */}
          <div className="flex flex-col items-center justify-center px-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500 leading-none mb-0.5">TELMAX OIB</span>
            <span className="text-[8px] font-mono font-semibold text-slate-400">v5.0.42 STABLE</span>
          </div>

          {/* Service Buttons Trigger */}
          <Button 
            variant="ghost" 
            className="h-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-none flex items-center justify-center gap-2 cursor-pointer select-none transition-colors"
            onClick={() => setIsServiceMenuOpen(true)}
          >
            <Settings size={16} />
            <span className="text-xs uppercase tracking-wider">Menu</span>
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
            <div className="bg-slate-950/95 text-amber-400 px-10 py-8 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center gap-4 border-2 border-slate-700/80 relative min-w-[320px] backdrop-blur-xl">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-4">
                 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                 <div className="w-2 h-2 rounded-full bg-sky-400" />
              </div>
              <div className="text-center mt-4">
                <span className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400 mb-2 block">System Diagnostic</span>
                <span className="text-8xl font-mono font-black block leading-none text-amber-400">{saverCountdown}</span>
                <div className="mt-4 flex flex-col items-center">
                   <div className="h-1.5 w-48 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                      <motion.div 
                        className="h-full bg-amber-400"
                        animate={{ width: [`${(saverCountdown/10)*100}%`, '0%'] }}
                        transition={{ duration: 10, ease: "linear" }}
                      />
                   </div>
                   <span className="text-[12px] uppercase font-black tracking-widest mt-3 text-amber-400 animate-pulse">ÚSPORNÝ REŽIM AKTIVNÍ</span>
                </div>
              </div>
              <div className="w-full h-px bg-slate-800 my-2" />
              <div className="flex justify-between w-full text-[9px] font-mono text-slate-400 uppercase font-bold">
                 <span>Batt: 26.4V</span>
                 <span>Air: 8.2 Bar</span>
                 <span>OIB: OK</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Driver Toast for Seamless Ticket Printing */}
      <AnimatePresence>
        {recentSaleToast.visible && recentSaleToast.ticket && (
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.95 }} 
            animate={{ y: 0, opacity: 1, scale: 1 }} 
            exit={{ y: 40, opacity: 0, scale: 0.95 }} 
            className="fixed bottom-12 right-3 sm:right-6 z-[160] max-w-sm w-[92vw] sm:w-auto bg-slate-900 border-2 border-emerald-500/80 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 text-slate-100 select-none backdrop-blur-md"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <Printer size={18} />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Jízdenka vytištěna</span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">{recentSaleToast.ticket.ticketCode}</span>
                </div>
                <span className="text-xs font-bold truncate text-slate-200">
                  {recentSaleToast.ticket.ticketType} • <strong className="text-amber-400 font-mono font-black">{recentSaleToast.ticket.price} Kč</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                className="h-8 px-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-lg cursor-pointer transition-all shadow-xs"
                onClick={() => {
                  setPrintedTicketModalData(recentSaleToast.ticket);
                  setIsTicketPreviewOpen(true);
                  setRecentSaleToast(prev => ({ ...prev, visible: false }));
                }}
              >
                Doklad
              </Button>
              <button
                type="button"
                onClick={() => setRecentSaleToast(prev => ({ ...prev, visible: false }))}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Printing & Payments Error Overlay (Only on true hardware/network failure) */}
      <AnimatePresence>
        {isPrinting && paymentProgressState === 'payment_error' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md p-6 rounded-2xl border flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden bg-rose-950/60 border-rose-900/50">
              {/* Dynamic Animated Icon */}
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500 animate-bounce">
                <AlertOctagon size={36} className="text-red-500" />
              </div>

              {/* Status Header & Description */}
              <div className="text-center w-full flex flex-col gap-1">
                <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase text-rose-400">
                  NEÚSPĚŠNÁ PLATBA
                </span>
                <h2 className="text-xl font-black uppercase tracking-wide text-red-400">
                  Transakce zamítnuta
                </h2>
                
                <div className="mt-4 p-4 rounded-lg border font-mono text-xs font-bold uppercase tracking-wider text-center leading-relaxed bg-red-950/40 border-red-900/50 text-red-300 shadow-inner">
                  {paymentStatusText || "CHYBA TERMINÁLU NEBO KARTY"}
                </div>
              </div>

              {/* Error Actions Button */}
              <Button 
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-sm rounded-xl cursor-pointer"
                onClick={() => {
                  setIsPrinting(false);
                  setPaymentProgressState('idle');
                }}
              >
                ZPĚT K PRODEJI
              </Button>
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
                <div className="font-extrabold text-center uppercase tracking-widest text-amber-400">TELMAX OIB - BOOTLOADER v5.0.42</div>
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
        <DialogContent className={cn("max-w-md max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl border shadow-2xl", isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900")}>
          <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shrink-0">
            <h2 className="text-amber-400 font-black uppercase tracking-tight text-lg flex items-center gap-2">
              <Settings size={22} /> SLUŽEBNÍ MENU
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setIsServiceMenuOpen(false)} className="text-slate-400 hover:text-white hover:bg-slate-800">
              <LogOut size={20} />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3">
             <div className="grid grid-cols-2 gap-2 pb-10">
              <Button 
                variant="outline" 
                className={cn("h-24 flex flex-col gap-2 border-2 transition-all active:scale-95", isDarkMode ? "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800" : "bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100")} 
                onClick={() => { handleStartTrip(); setIsServiceMenuOpen(false); }}
              >
                <Clock size={32} className="text-green-500" />
                <span className="text-[10px] font-black uppercase">Zahájit jízdu</span>
              </Button>
              <Button 
                variant="outline" 
                className={cn("h-24 flex flex-col gap-2 border-2 transition-all active:scale-95", isDarkMode ? "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800" : "bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100")} 
                onClick={() => { setTripStartTime(null); setIsServiceMenuOpen(false); }}
              >
                <Clock size={32} className="text-red-500" />
                <span className="text-[10px] font-black uppercase">Zrušit jízdu</span>
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn("h-24 flex flex-col gap-2 border-2 transition-all active:scale-95", isDarkMode ? "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800" : "bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100")}
                  >
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
                  <Button 
                    variant="outline" 
                    className={cn("h-24 flex flex-col gap-2 border-2 transition-all active:scale-95", isDarkMode ? "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800" : "bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100")}
                  >
                    <Megaphone size={32} className="text-orange-500" />
                    <span className="text-[10px] font-black uppercase">Doplňkové hlášení</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className={cn("max-w-xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0", isDarkMode ? "bg-[#1a1a1a] border-[#3a3a3a] text-white" : "bg-white text-black")}>
                  {/* Header */}
                  <div className="bg-orange-500 text-black px-4 py-3 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                      <Megaphone size={22} className="text-black" />
                      <div>
                        <DialogTitle className="text-base font-black uppercase tracking-tight text-black m-0">
                          Služební a doplňková hlášení
                        </DialogTitle>
                        <span className="text-[10px] font-bold text-black/70">
                          Celkem 50 hlášení pro linky, bezpečnost a výluky
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsAnnouncementsOpen(false)} className="text-black hover:bg-black/10">
                      <X size={20} />
                    </Button>
                  </div>

                  {/* Search and Category Filter */}
                  <div className="p-3 bg-slate-100 dark:bg-black/40 border-b border-slate-200 dark:border-white/10 flex flex-col gap-2 shrink-0">
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Hledat hlášení (např. výluka, kola, jízdenky, zpoždění)..."
                        value={announcementSearchQuery}
                        onChange={(e) => setAnnouncementSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                      {announcementSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setAnnouncementSearchQuery("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="flex gap-1 overflow-x-auto scrollbar-none text-[8px] font-bold">
                      {[
                        { id: 'all', label: `Vše (${SERVICE_ANNOUNCEMENTS.length})` },
                        { id: 'bezpecnost', label: `Bezpečnost (${SERVICE_ANNOUNCEMENTS.filter(a => a.category === 'bezpecnost').length})` },
                        { id: 'jizdenky', label: `Jízdenky (${SERVICE_ANNOUNCEMENTS.filter(a => a.category === 'jizdenky').length})` },
                        { id: 'vyluka', label: `Výluky & Trasa (${SERVICE_ANNOUNCEMENTS.filter(a => a.category === 'vyluka').length})` },
                        { id: 'provoz', label: `Provoz (${SERVICE_ANNOUNCEMENTS.filter(a => a.category === 'provoz').length})` },
                        { id: 'pohodli', label: `Pohodlí (${SERVICE_ANNOUNCEMENTS.filter(a => a.category === 'pohodli').length})` },
                      ].map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setAnnouncementCategoryFilter(cat.id)}
                          className={cn(
                            "px-2 py-1 rounded uppercase font-black transition-colors whitespace-nowrap cursor-pointer",
                            announcementCategoryFilter === cat.id
                              ? "bg-orange-500 text-black shadow-xs"
                              : "bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700"
                          )}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* List of Announcements */}
                  <div className="flex-1 overflow-y-auto p-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-700">
                    <div className="flex flex-col gap-2">
                      {SERVICE_ANNOUNCEMENTS.filter(msg => {
                        const matchesCat = announcementCategoryFilter === 'all' || msg.category === announcementCategoryFilter;
                        const matchesQuery = !announcementSearchQuery ||
                          msg.label.toLowerCase().includes(announcementSearchQuery.toLowerCase()) ||
                          msg.text.toLowerCase().includes(announcementSearchQuery.toLowerCase());
                        return matchesCat && matchesQuery;
                      }).map(msg => (
                        <div
                          key={msg.id}
                          className="p-2 rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-orange-500/50 transition-all flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="font-bold text-sm text-slate-900 dark:text-white leading-tight truncate">
                              {msg.label}
                            </span>
                            <span className={cn(
                              "text-[7.5px] font-mono font-black uppercase px-1.5 py-0.5 rounded shrink-0",
                              msg.category === 'bezpecnost' ? "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30" :
                              msg.category === 'jizdenky' ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30" :
                              msg.category === 'vyluka' ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30" :
                              msg.category === 'provoz' ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30" :
                              "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            )}>
                              {msg.category === 'bezpecnost' ? 'BEZPEČNOST' :
                               msg.category === 'jizdenky' ? 'JÍZDENKY' :
                               msg.category === 'vyluka' ? 'VÝLUKA' :
                               msg.category === 'provoz' ? 'PROVOZ' : 'POHODLÍ'}
                            </span>
                          </div>

                          <Button
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-black font-black uppercase tracking-wider text-xs gap-1.5 shrink-0 px-3 cursor-pointer shadow-xs active:scale-95"
                            onClick={() => {
                              playAnnouncement(msg.text);
                              setIsAnnouncementsOpen(false);
                              setIsServiceMenuOpen(false);
                            }}
                          >
                            <Volume2 size={16} />
                            Přehrát
                          </Button>
                        </div>
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

              <Button 
                variant="outline" 
                className={cn("h-24 flex flex-col gap-2 border-2 transition-all active:scale-95", isDarkMode ? "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800" : "bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100")} 
                onClick={() => { setActiveTab("vehicle"); setIsServiceMenuOpen(false); handleActivity(); }}
              >
                <Camera size={24} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase">Kamery</span>
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn("h-24 flex flex-col gap-2 border-2 transition-all active:scale-95", isDarkMode ? "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800" : "bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100")}
                  >
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
                  <Button variant="outline" className={cn("h-24 flex flex-col gap-2 border-2 transition-all active:scale-95", isDarkMode ? "bg-red-900/20 border-red-500/30 text-red-400 hover:bg-red-900/30" : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100")}>
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
          
          <div className={cn("p-4 border-t shrink-0 flex gap-2 transition-colors", isDarkMode ? "border-zinc-800 bg-zinc-900" : "border-slate-200 bg-slate-100")}>
            <Button 
              variant="outline" 
              className={cn("flex-1 h-14 font-bold border transition-colors", isDarkMode ? "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700" : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50")} 
              onClick={() => setIsLoggedIn(false)}
            >
              Konec Směny
            </Button>
            <Button 
              variant="outline" 
              className={cn("h-14 w-14 border transition-colors", isDarkMode ? "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700" : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50")} 
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Přepnout na denní režim" : "Přepnout na noční režim"}
            >
              {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MULTILÍSTEK BUILDER MODAL */}
      <Dialog open={isMultilistekBuilderOpen} onOpenChange={setIsMultilistekBuilderOpen}>
        <DialogContent className={cn("max-w-lg", isDarkMode ? "bg-[#0a192f] text-white border-amber-500/30" : "bg-white text-slate-900")}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-500 font-black uppercase tracking-wider text-base">
              <Ticket size={20} className="text-amber-500" />
              <span>Generátor Multilístku (Skupinová Jízdenka)</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            {/* Route & Stop Info */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-md flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Trasa & Cíl:</span>
                <p className="font-black text-sm">{currentStop.name} (Z{currentStop.zone}) → {destinationStop.name} (Z{destinationStop.zone})</p>
              </div>
              <Badge className="bg-amber-500 text-black font-black uppercase border-none">
                Linka {currentRoute.number}
              </Badge>
            </div>

            {/* Quick Presets inside Builder */}
            <div>
              <label className="text-[10px] font-bold uppercase opacity-70 mb-1 block">Rychlé šablony (Presets):</label>
              <div className="grid grid-cols-3 gap-1">
                <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold cursor-pointer" onClick={() => applyMultilistekPreset('rodina')}>
                  👨‍👩‍👧‍👦 Rodina (2+2)
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold cursor-pointer" onClick={() => applyMultilistekPreset('dvojice')}>
                  👥 2x Dospělý
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold cursor-pointer" onClick={() => applyMultilistekPreset('skola')}>
                  🎒 Školní výlet (10+2)
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold cursor-pointer" onClick={() => applyMultilistekPreset('studenti')}>
                  🎓 Skupina Studentů (4x)
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold cursor-pointer" onClick={() => applyMultilistekPreset('pes')}>
                  🐕 Cestující + Pes
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold cursor-pointer" onClick={() => applyMultilistekPreset('kola')}>
                  🚲 Turisté + Kola (2+2)
                </Button>
              </div>
            </div>

            {/* Item selector grid with +/- counters */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold uppercase opacity-70">Složení skupinové jízdenky:</label>
                <div className="flex gap-1 overflow-x-auto text-[7.5px] font-bold">
                  {[
                    { id: 'all', label: 'Vše' },
                    { id: 'basic', label: 'Základní' },
                    { id: 'time', label: 'Časové' },
                    { id: 'group', label: 'Skupiny' },
                    { id: 'luggage', label: 'Zavazadla' },
                    { id: 'special', label: 'Doplňkové' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setBuilderModalCategoryFilter(cat.id as any)}
                      className={cn(
                        "px-1.5 py-0.5 rounded uppercase font-black transition-colors cursor-pointer",
                        builderModalCategoryFilter === cat.id
                          ? "bg-sky-600 text-white shadow-sm"
                          : "bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-zinc-700"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {TICKET_TYPES.filter(t => builderModalCategoryFilter === 'all' || t.category === builderModalCategoryFilter).map(type => {
                  const currentItem = cart.find(c => c.type.id === type.id);
                  const count = currentItem ? currentItem.count : 0;
                  const price = calculatePrice(currentStop, destinationStop, type);

                  return (
                    <div key={type.id} className="p-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="font-bold text-[10px] leading-tight">{type.name}</span>
                        <span className="text-[9px] text-blue-600 dark:text-blue-400 font-mono">
                          {price === 0 ? 'ZDARMA' : `${price} Kč / ks`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 text-red-500 p-0 cursor-pointer"
                          onClick={() => removeFromCart(type.id)}
                          disabled={count === 0}
                        >
                          <Minus size={12} />
                        </Button>
                        <span className="w-5 text-center font-black text-xs font-mono">{count}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 text-green-600 p-0 cursor-pointer"
                          onClick={() => addToCart(type)}
                        >
                          <Plus size={12} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Note input */}
            <div>
              <label className="text-[10px] font-bold uppercase opacity-70 mb-0.5 block">Poznámka / Název skupiny (volitelné):</label>
              <input
                type="text"
                placeholder="např. Školní výlet 5.A, Svatba, Rodina..."
                value={multilistekNote}
                onChange={(e) => setMultilistekNote(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border rounded bg-slate-50 dark:bg-white/5 dark:border-white/10"
              />
            </div>

            {/* Summary box */}
            <div className="p-2 bg-slate-100 dark:bg-white/10 rounded border flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold opacity-60">Celkem položek / cestujících:</span>
                <p className="font-black text-lg text-amber-600 dark:text-amber-400">{cart.reduce((a,b) => a+b.count, 0)} ks</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold opacity-60">Celková cena Multilístku:</span>
                <p className="font-black text-2xl text-sky-600 dark:text-sky-400">{cartTotal} Kč</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 font-bold cursor-pointer" onClick={() => setIsMultilistekBuilderOpen(false)}>
              Zrušit
            </Button>
            <Button
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-black uppercase cursor-pointer"
              onClick={() => {
                setIsMultilistekBuilderOpen(false);
                setIsMultilistekMode(true);
                handleSellTicket();
              }}
              disabled={cart.length === 0}
            >
              <Printer size={16} className="mr-1.5" />
              Vydat Multilístek ({cartTotal} Kč)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PRINTED TICKET / MULTILÍSTEK RECEIPT PREVIEW MODAL */}
      <Dialog open={isTicketPreviewOpen} onOpenChange={setIsTicketPreviewOpen}>
        <DialogContent className="max-w-md max-h-[88vh] flex flex-col p-3 sm:p-4 bg-slate-950 text-slate-100 border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[210]">
          <DialogHeader className="shrink-0 pb-2 border-b border-slate-800 flex flex-row items-center justify-between">
            <DialogTitle className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Printer size={15} />
              <span>Doklad o zaplacení jízdenky</span>
              {printedTicketModalData?.isMultilistek && (
                <span className="bg-amber-400 text-slate-950 font-black text-[9px] uppercase px-1.5 py-0.5 rounded-full">MULTILÍSTEK</span>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* THERMAL PAPER TICKET SIMULATION - SCROLLABLE BODY */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 my-1.5 scrollbar-thin">
            <div className="bg-[#fffefa] text-black font-mono text-[9.5px] leading-tight p-3.5 rounded shadow-2xl border-t-4 border-b-4 border-dashed border-zinc-400 select-none">
              {/* Background Watermark/Header */}
              <div className="text-center font-bold text-[11px] uppercase tracking-tighter border-b border-black pb-1 mb-1">
                <div>DOPRAVNÍ PODNIK HORNÍ SLAVKOV s.r.o.</div>
                <div className="text-[7.5px] font-normal opacity-80">IČO: 28014820 • DIČ: CZ28014820 • ODBAVENÍ TELMAX OIB</div>
                <div className="text-[7.5px] font-normal opacity-80">Tarif IDS Karlovarského Kraje</div>
              </div>

              <div className="bg-amber-100/90 p-1 text-center font-black text-xs uppercase my-1 border border-amber-300 rounded-xs tracking-tight">
                {printedTicketModalData?.isMultilistek ? "*** MULTILÍSTEK / HROMADNÝ DOKLAD ***" : "*** JÍZDNÍ DOKLAD - JEDNORÁZOVÝ ***"}
              </div>

              <div className="space-y-0.5 my-1 text-[9px]">
                <div className="flex justify-between">
                  <span>Kód dokladu:</span>
                  <span className="font-bold font-mono">{printedTicketModalData?.ticketCode || 'ML-2026-90214'}</span>
                </div>
                <div className="flex justify-between opacity-80">
                  <span>Vydáno (Datum / Čas):</span>
                  <span>{printedTicketModalData?.timestamp ? new Date(printedTicketModalData.timestamp).toLocaleString('cs-CZ') : new Date().toLocaleString('cs-CZ')}</span>
                </div>
                <div className="flex justify-between opacity-80">
                  <span>Provozovna / Vůz:</span>
                  <span>Garáže H.Slavkov / Vůz #4208</span>
                </div>
                <div className="flex justify-between opacity-80">
                  <span>Služba / Řidič:</span>
                  <span>č. 402 / {currentDriver?.name || 'Štěpán Stredni'}</span>
                </div>
                <div className="flex justify-between opacity-80">
                  <span>Linka / Spoj:</span>
                  <span>{currentRoute.number} / {currentRoute.name}</span>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-black/40 py-1 my-1 space-y-0.5">
                <div className="flex justify-between items-baseline font-bold uppercase text-[10px]">
                  <span>Nástup: {printedTicketModalData?.fromStop}</span>
                  <span className="text-[8.5px] opacity-70">Zóna {currentStop.zone}</span>
                </div>
                <div className="flex justify-between items-baseline font-bold uppercase text-[10px] text-blue-900">
                  <span>Cíl: {printedTicketModalData?.toStop}</span>
                  <span className="text-[8.5px] opacity-70">Zóna {destinationStop.zone}</span>
                </div>
                <div className="text-[8px] opacity-80 flex justify-between pt-0.5 border-t border-black/10">
                  <span>Časová platnost: 120 minut</span>
                  <span>Přestupní: ANO</span>
                </div>
              </div>

              {/* ITEMS BREAKDOWN */}
              <div className="my-1.5 space-y-0.5">
                <div className="font-bold text-[8.5px] uppercase border-b border-black/20 pb-0.5 flex justify-between">
                  <span>Rozpis tarifních položek:</span>
                  <span>Cena</span>
                </div>
                {printedTicketModalData?.isMultilistek && printedTicketModalData.multilistekItems ? (
                  printedTicketModalData.multilistekItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[9px]">
                      <span>{item.count}x {item.type.name} ({item.unitPrice} Kč/ks)</span>
                      <span className="font-bold">{item.totalPrice} Kč</span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between text-[9px]">
                    <span>{printedTicketModalData?.ticketType}</span>
                    <span className="font-bold">{printedTicketModalData?.price} Kč</span>
                  </div>
                )}
              </div>

              {printedTicketModalData?.note && (
                <div className="bg-amber-50 p-1 rounded text-[8.5px] italic mb-1 border border-amber-200">
                  Poznámka ke skupině: {printedTicketModalData.note}
                </div>
              )}

              <div className="border-t border-black pt-1 mt-1 flex justify-between items-baseline font-black">
                <span className="text-[10px]">CELKEM (vč. DPH):</span>
                <span className="text-base text-blue-950">{printedTicketModalData?.price} Kč</span>
              </div>

              <div className="text-[7.5px] space-y-0.5 opacity-80 mt-1 pt-1 border-t border-black/10">
                <div className="flex justify-between">
                  <span>Základ DPH (12%):</span>
                  <span>{((printedTicketModalData?.price || 0) / 1.12).toFixed(2)} Kč</span>
                </div>
                <div className="flex justify-between">
                  <span>DPH (12%):</span>
                  <span>{((printedTicketModalData?.price || 0) - ((printedTicketModalData?.price || 0) / 1.12)).toFixed(2)} Kč</span>
                </div>
                <div className="flex justify-between font-bold pt-0.5">
                  <span>Způsob úhrady:</span>
                  <span>{printedTicketModalData?.paymentMethod || 'HOTOVOST'}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Počet přepravovaných osob:</span>
                  <span>{printedTicketModalData?.totalPassengers || 1} os.</span>
                </div>
              </div>

              {/* REALISTIC REVIZOR QR CODE & SECURITY STAMP */}
              <div className="mt-2 text-center pt-1.5 border-t border-dashed border-black/30 flex flex-col items-center">
                <div className="flex items-center gap-3 w-full justify-center my-0.5">
                  {/* SVG Aztec/QR Code Graphic */}
                  <div className="p-1 bg-white border border-black/40 rounded shrink-0">
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                      <rect x="2" y="2" width="6" height="6" fill="black" />
                      <rect x="16" y="2" width="6" height="6" fill="black" />
                      <rect x="2" y="16" width="6" height="6" fill="black" />
                      <rect x="10" y="10" width="4" height="4" fill="black" />
                      <line x1="10" y1="2" x2="14" y2="2" />
                      <line x1="10" y1="6" x2="14" y2="6" />
                      <line x1="2" y1="10" x2="6" y2="10" />
                      <line x1="18" y1="10" x2="22" y2="10" />
                      <line x1="10" y1="18" x2="14" y2="18" />
                      <line x1="18" y1="18" x2="22" y2="22" fill="black" />
                    </svg>
                  </div>
                  <div className="text-left text-[7px] font-mono leading-tight opacity-90 space-y-0.5">
                    <div className="font-bold text-[7.5px]">KONTROLNÍ KÓD (REVIZOR):</div>
                    <div>FIK: e6a421-9012-4c8a-921d-7801a2</div>
                    <div>BKP: 42F80A21-11A0B21C-90214C8D</div>
                    <div>Odbavení #2026-00482</div>
                  </div>
                </div>
                <div className="text-[7px] opacity-60 mt-1">
                  Jízdenka je nepřenosná a platná pouze pro uvedený spoj a úsek. Šťastnou cestu!
                </div>
              </div>
            </div>
          </div>

          {/* STICKY FOOTER BUTTONS - ALWAYS VISIBLE */}
          <div className="flex gap-2 pt-2 border-t border-slate-800 shrink-0">
            <Button
              variant="outline"
              className="flex-1 h-10 border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              onClick={() => setIsTicketPreviewOpen(false)}
            >
              Zavřít doklad
            </Button>
            <Button
              className="flex-1 h-10 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl cursor-pointer shadow-sm"
              onClick={() => {
                setReprintingEffect(true);
                playThermalPrinterSound();
                setTimeout(() => setReprintingEffect(false), 800);
              }}
            >
              <Printer size={14} className="mr-1.5" />
              {reprintingEffect ? "Tisk..." : "Tisknout Duplikát"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SHIFT FINANCIAL CLOSURE (Z-REPORT) THERMAL MODAL */}
      <Dialog open={isZReportOpen} onOpenChange={setIsZReportOpen}>
        <DialogContent className="max-w-md max-h-[88vh] flex flex-col p-3 sm:p-4 bg-slate-950 text-slate-100 border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[210]">
          <DialogHeader className="shrink-0 pb-2 border-b border-slate-800 flex flex-row items-center justify-between">
            <DialogTitle className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Printer size={15} />
              <span>Finanční uzávěrka směny (Z-Zpráva)</span>
              <span className="bg-amber-400 text-slate-950 font-black text-[9px] uppercase px-1.5 py-0.5 rounded-full">UZÁVĚRKA Z</span>
            </DialogTitle>
          </DialogHeader>

          {/* Thermal Paper Simulation for Z-Report */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 my-1.5 scrollbar-thin">
            <div className="bg-[#fffefa] text-black font-mono text-[9.5px] leading-tight p-3.5 rounded shadow-2xl border-t-4 border-b-4 border-dashed border-zinc-400 select-none">
              <div className="text-center font-bold text-[11px] uppercase tracking-tighter border-b border-black pb-1 mb-1">
                <div>DOPRAVNÍ PODNIK HORNÍ SLAVKOV s.r.o.</div>
                <div className="text-[7.5px] font-normal opacity-80">IČO: 28014820 • DIČ: CZ28014820 • ODBAVENÍ TELMAX OIB</div>
                <div className="text-[8px] font-bold mt-1 text-slate-900">*** DENNÍ FINANČNÍ UZÁVĚRKA SMĚNY ***</div>
                <div className="text-[7.5px] font-normal opacity-80">Typ zprávy: Z-UZÁVĚRKA (NULOVACÍ)</div>
              </div>

              <div className="space-y-0.5 my-1 text-[9px]">
                <div className="flex justify-between">
                  <span>Datum a čas uzávěrky:</span>
                  <span className="font-bold">{new Date().toLocaleString('cs-CZ')}</span>
                </div>
                <div className="flex justify-between opacity-80">
                  <span>Provozovna / Vůz:</span>
                  <span>Garáže H.Slavkov / Vůz #4208</span>
                </div>
                <div className="flex justify-between opacity-80">
                  <span>Služba / Řidič:</span>
                  <span>č. 402 / {currentDriver?.name || 'Štěpán Stredni'}</span>
                </div>
                <div className="flex justify-between opacity-80">
                  <span>Linka:</span>
                  <span>{currentRoute.number} - {currentRoute.name}</span>
                </div>
                <div className="flex justify-between opacity-80">
                  <span>Číslo uzávěrky:</span>
                  <span className="font-mono font-bold">Z-2026-0012</span>
                </div>
              </div>

              {/* Financial Recap Table */}
              <div className="border-t border-b border-dashed border-black/40 py-1.5 my-1.5 space-y-1">
                <div className="font-bold text-[9px] uppercase border-b border-black/20 pb-0.5 flex justify-between">
                  <span>Položka tržby:</span>
                  <span>Částka</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span>Tržba HOTOVOST:</span>
                  <span className="font-bold">{transactions.filter(t => !t.storno && (t.paymentMethod === 'HOTOVOST' || t.paymentMethod === 'CASH')).reduce((a, t) => a + t.price, 0)} Kč</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span>Tržba KARTY & MOBIL:</span>
                  <span className="font-bold">{transactions.filter(t => !t.storno && t.paymentMethod !== 'HOTOVOST' && t.paymentMethod !== 'CASH').reduce((a, t) => a + t.price, 0)} Kč</span>
                </div>
                <div className="flex justify-between text-[9px] opacity-70">
                  <span>Stornované doklady ({transactions.filter(t => t.storno).length}x):</span>
                  <span>-{transactions.filter(t => t.storno).reduce((a, t) => a + t.price, 0)} Kč</span>
                </div>
              </div>

              {/* Total & Tax Breakdown */}
              <div className="border-t border-black pt-1 mt-1 flex justify-between items-baseline font-black">
                <span className="text-[10px]">CELKOVÁ TRŽBA SMĚNY:</span>
                <span className="text-base text-blue-950 font-mono">
                  {transactions.filter(t => !t.storno).reduce((a, t) => a + t.price, 0)} Kč
                </span>
              </div>

              <div className="text-[7.5px] space-y-0.5 opacity-80 mt-1 pt-1 border-t border-black/10">
                <div className="flex justify-between">
                  <span>Základ DPH (12%):</span>
                  <span>{((transactions.filter(t => !t.storno).reduce((a, t) => a + t.price, 0)) / 1.12).toFixed(2)} Kč</span>
                </div>
                <div className="flex justify-between">
                  <span>DPH (12%):</span>
                  <span>{((transactions.filter(t => !t.storno).reduce((a, t) => a + t.price, 0)) - ((transactions.filter(t => !t.storno).reduce((a, t) => a + t.price, 0)) / 1.12)).toFixed(2)} Kč</span>
                </div>
                <div className="flex justify-between font-bold pt-0.5">
                  <span>Celkem vydáno platných jízdenek:</span>
                  <span>{transactions.filter(t => !t.storno).length} ks</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Celkem přepraveno osob:</span>
                  <span>{transactions.filter(t => !t.storno).reduce((a, t) => a + (t.totalPassengers || 1), 0)} os.</span>
                </div>
              </div>

              {/* Fiscal Seal / Codes */}
              <div className="mt-2 text-center pt-1.5 border-t border-dashed border-black/30 text-[7px] font-mono leading-tight opacity-80 space-y-0.5">
                <div>FIK: 48f90a-281b-4190-b192-91024bcde</div>
                <div>BKP: 9021F80A-28B104A1-C18290FA</div>
                <div>DENNÍ REGISTR POKLADNY BYL ÚSPĚŠNĚ UZAVŘEN</div>
              </div>
            </div>
          </div>

          {/* Sticky Buttons */}
          <div className="flex gap-2 pt-2 border-t border-slate-800 shrink-0">
            <Button
              variant="outline"
              className="flex-1 h-10 border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              onClick={() => setIsZReportOpen(false)}
            >
              Zavřít
            </Button>
            <Button
              className="flex-1 h-10 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl cursor-pointer shadow-sm"
              onClick={() => {
                setReprintingEffect(true);
                playThermalPrinterSound();
                setTimeout(() => setReprintingEffect(false), 900);
              }}
            >
              <Printer size={14} className="mr-1.5" />
              {reprintingEffect ? "Tiskne se..." : "Vytisknout uzávěrku"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
