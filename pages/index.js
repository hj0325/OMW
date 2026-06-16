import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { 
  Clock, 
  MapPin, 
  Navigation, 
  Play, 
  Pause, 
  Info, 
  Calendar, 
  Database, 
  Server,
  ZoomIn,
  ZoomOut,
  Sliders,
  Eye,
  EyeOff
} from 'lucide-react';

// Pre-defined popular stations in Seoul with real coordinates and realistic route IDs
const PREDEFINED_STATIONS = [
  { id: "ST_GANGNAM", name: "강남역 정류소", lat: 37.4979, lng: 127.0276, routes: ["M2341", "3412번", "140번", "N13번"], arsId: "22010" },
  { id: "ST_HONGDAE", name: "홍대입구역 정류소", lat: 37.5575, lng: 126.9244, routes: ["273번", "7612번", "602번", "N62번"], arsId: "14015" },
  { id: "ST_MYEONGDONG", name: "명동역 정류소", lat: 37.5609, lng: 126.9861, routes: ["104번", "7011번", "M5107", "N13번"], arsId: "02150" },
  { id: "ST_SEOUL_STN", name: "서울역 버스환승센터", lat: 37.5546, lng: 126.9706, routes: ["150번", "501번", "M4101", "N13번"], arsId: "02004" },
  { id: "ST_YEOUIDO", name: "여의도역 정류소", lat: 37.5216, lng: 126.9242, routes: ["162번", "5618번", "M7111", "N62번"], arsId: "19155" },
  { id: "ST_JONGNO", name: "종로3가역 정류소", lat: 37.5704, lng: 126.9922, routes: ["273번", "143번", "720번", "N13번"], arsId: "01183" },
  { id: "ST_SINCHON", name: "신촌역 정류소", lat: 37.5552, lng: 126.9369, routes: ["273번", "7713번", "5714번", "N62번"], arsId: "13022" },
  { id: "ST_JAMSIL", name: "잠실역 정류소", lat: 37.5133, lng: 127.1001, routes: ["3413번", "301번", "M2341", "N13번"], arsId: "24018" },
  { id: "ST_DONGDAEMUN", name: "동대문역 정류소", lat: 37.5714, lng: 127.0092, routes: ["144번", "720번", "273번", "N13번"], arsId: "01233" },
  { id: "ST_CHEONGNYANGNI", name: "청량리역 환승센터", lat: 37.5802, lng: 127.0448, routes: ["147번", "273번", "1213번", "720번"], arsId: "06015" },
  { id: "ST_GWANGHWAMUN", name: "광화문역 정류소", lat: 37.5716, lng: 126.9768, routes: ["720번", "109번", "1020번", "N62번"], arsId: "01119" },
  { id: "ST_HYEHWA", name: "혜화역 대학로 정류소", lat: 37.5822, lng: 127.0019, routes: ["273번", "301번", "2112번", "N13번"], arsId: "01229" },
  { id: "ST_HUFS", name: "한국외대 정문", lat: 37.5973, lng: 127.0578, routes: ["273번", "147번", "1222번", "N13번"], arsId: "06124" },
  { id: "ST_KYUNGHEE", name: "경희대후문", lat: 37.5954, lng: 127.0524, routes: ["273번", "147번", "1222번", "N13번"], arsId: "06282" },
  { id: "ST_DOLGOTI", name: "돌곶이역 2번 출구", lat: 37.6105, lng: 127.0565, routes: ["120번", "147번", "1111번", "N62번"], arsId: "08139" },
  { id: "ST_SINIMUN", name: "신이문역 정류소", lat: 37.6018, lng: 127.0615, routes: ["120번", "147번", "1122번", "N62번"], arsId: "06232" },
  { id: "ST_SEOKGWAN", name: "석관동주민센터", lat: 37.6062, lng: 127.0622, routes: ["120번", "147번", "1111번", "N13번"], arsId: "08141" }
];

// Route details with types and colors
const ROUTE_DETAILS = {
  // 지선버스 (Green)
  "120번": { name: "120번", type: "지선", color: "emerald", hex: "#10b981", rgb: "16, 185, 129", interval: 10 },
  "1111번": { name: "1111번", type: "지선", color: "emerald", hex: "#10b981", rgb: "16, 185, 129", interval: 11 },
  "1122번": { name: "1122번", type: "지선", color: "emerald", hex: "#10b981", rgb: "16, 185, 129", interval: 12 },
  "1213번": { name: "1213번", type: "지선", color: "emerald", hex: "#10b981", rgb: "16, 185, 129", interval: 10 },
  "1222번": { name: "1222번", type: "지선", color: "emerald", hex: "#10b981", rgb: "16, 185, 129", interval: 13 },
  "2112번": { name: "2112번", type: "지선", color: "emerald", hex: "#10b981", rgb: "16, 185, 129", interval: 12 },
  "3412번": { name: "3412번", type: "지선", color: "emerald", hex: "#10b981", rgb: "16, 185, 129", interval: 11 },
  "3413번": { name: "3413번", type: "지선", color: "emerald", hex: "#10b981", rgb: "16, 185, 129", interval: 9 },
  "5618번": { name: "5618번", type: "지선", color: "emerald", hex: "#10b981", rgb: "16, 185, 129", interval: 12 },
  "7011번": { name: "7011번", type: "지선", color: "emerald", hex: "#10b981", rgb: "16, 185, 129", interval: 10 },
  "7612번": { name: "7612번", type: "지선", color: "emerald", hex: "#10b981", rgb: "16, 185, 129", interval: 9 },
  "7713번": { name: "7713번", type: "지선", color: "emerald", hex: "#10b981", rgb: "16, 185, 129", interval: 11 },

  // 간선버스 (Blue)
  "104번": { name: "104번", type: "간선", color: "sky", hex: "#0ea5e9", rgb: "14, 165, 233", interval: 8 },
  "109번": { name: "109번", type: "간선", color: "sky", hex: "#0ea5e9", rgb: "14, 165, 233", interval: 10 },
  "140번": { name: "140번", type: "간선", color: "sky", hex: "#0ea5e9", rgb: "14, 165, 233", interval: 7 },
  "143번": { name: "143번", type: "간선", color: "sky", hex: "#0ea5e9", rgb: "14, 165, 233", interval: 6 },
  "144번": { name: "144번", type: "간선", color: "sky", hex: "#0ea5e9", rgb: "14, 165, 233", interval: 8 },
  "147번": { name: "147번", type: "간선", color: "sky", hex: "#0ea5e9", rgb: "14, 165, 233", interval: 8 },
  "150번": { name: "150번", type: "간선", color: "sky", hex: "#0ea5e9", rgb: "14, 165, 233", interval: 9 },
  "162번": { name: "162번", type: "간선", color: "sky", hex: "#0ea5e9", rgb: "14, 165, 233", interval: 10 },
  "273번": { name: "273번", type: "간선", color: "sky", hex: "#0ea5e9", rgb: "14, 165, 233", interval: 9 },
  "301번": { name: "301번", type: "간선", color: "sky", hex: "#0ea5e9", rgb: "14, 165, 233", interval: 8 },
  "501번": { name: "501번", type: "간선", color: "sky", hex: "#0ea5e9", rgb: "14, 165, 233", interval: 9 },
  "5714번": { name: "5714번", type: "간선", color: "sky", hex: "#0ea5e9", rgb: "14, 165, 233", interval: 8 },
  "602번": { name: "602번", type: "간선", color: "sky", hex: "#0ea5e9", rgb: "14, 165, 233", interval: 10 },
  "720번": { name: "720번", type: "간선", color: "sky", hex: "#0ea5e9", rgb: "14, 165, 233", interval: 11 },
  "1020번": { name: "1020번", type: "간선", color: "sky", hex: "#0ea5e9", rgb: "14, 165, 233", interval: 12 },

  // 광역버스 (Red)
  "M2341": { name: "M2341", type: "광역", color: "rose", hex: "#ef4444", rgb: "239, 68, 68", interval: 15 },
  "M4101": { name: "M4101", type: "광역", color: "rose", hex: "#ef4444", rgb: "239, 68, 68", interval: 12 },
  "M5107": { name: "M5107", type: "광역", color: "rose", hex: "#ef4444", rgb: "239, 68, 68", interval: 10 },
  "M7111": { name: "M7111", type: "광역", color: "rose", hex: "#ef4444", rgb: "239, 68, 68", interval: 14 },

  // 순환버스 (Yellow)
  "01번": { name: "01번", type: "순환", color: "amber", hex: "#f59e0b", rgb: "245, 158, 11", interval: 12 },
  "02번": { name: "02번", type: "순환", color: "amber", hex: "#f59e0b", rgb: "245, 158, 11", interval: 15 },

  // 심야버스 (Navy)
  "N13번": { name: "N13번", type: "심야", color: "indigo", hex: "#3730a3", rgb: "55, 48, 163", interval: 25 },
  "N62번": { name: "N62번", type: "심야", color: "indigo", hex: "#3730a3", rgb: "55, 48, 163", interval: 30 }
};

// Seoul & Gyeonggi neighborhoods for dynamic naming of clicked locations
const NEIGHBORHOODS = [
  { name: "서초동", lat: 37.49, lng: 127.01 },
  { name: "삼성동", lat: 37.51, lng: 127.06 },
  { name: "여의도동", lat: 37.52, lng: 126.92 },
  { name: "상암동", lat: 37.58, lng: 126.89 },
  { name: "이태원동", lat: 37.53, lng: 126.99 },
  { name: "인사동", lat: 37.57, lng: 126.98 },
  { name: "성수동", lat: 37.54, lng: 127.05 },
  { name: "이문동", lat: 37.59, lng: 127.06 },
  { name: "신촌동", lat: 37.55, lng: 126.93 },
  { name: "목동", lat: 37.53, lng: 126.87 },
  { name: "대학로", lat: 37.58, lng: 127.00 },
  { name: "잠실동", lat: 37.51, lng: 127.08 },
  { name: "청량리동", lat: 37.58, lng: 127.04 },
  { name: "압구정동", lat: 37.52, lng: 127.03 },
  { name: "합정동", lat: 37.54, lng: 126.91 },
  { name: "화도읍 마석우리", lat: 37.65, lng: 127.31 },
  { name: "평내동", lat: 37.63, lng: 127.24 },
  { name: "호평동", lat: 37.64, lng: 127.25 },
  { name: "금곡동", lat: 37.63, lng: 127.21 },
  { name: "다산동", lat: 37.62, lng: 127.16 },
  { name: "구리시 수택동", lat: 37.59, lng: 127.14 },
  { name: "하남시 신장동", lat: 37.54, lng: 127.22 }
];

const formatDisplayTime = (date) => {
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'UTC' });
};

// Beautiful HTML/CSS & SVG Glowing Liquid Gradient Bus Card Background (High Performance Fallback)
const WebGLBusCard = ({ hex, highlightHex, isDot }) => {
  // Boost base and highlight colors to saturate them for a much punchier neon look
  const getSaturatedColor = (colorHex) => {
    // Basic color mapping for boosted neon punch
    const boostMap = {
      "#10b981": "#00ff87", // Vivid electric mint
      "#0ea5e9": "#00d2ff", // Hyper cyan
      "#ef4444": "#ff1a40", // High-intensity crimson
      "#f59e0b": "#ffbf00", // Bright warm gold
      "#3730a3": "#635bff"  // Luminous indigo
    };
    return boostMap[colorHex] || colorHex;
  };

  const saturatedHex = getSaturatedColor(hex);
  const saturatedHighlight = getSaturatedColor(highlightHex);

  return (
    <div 
      className="absolute inset-0 rounded-2xl overflow-hidden z-0"
      style={{
        background: `linear-gradient(135deg, ${saturatedHex}, ${saturatedHex}dd)`,
        animation: 'transition-vibe-glow 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      {/* Animated Liquid Flow Effect (Pure CSS/SVG - incredibly smooth & robust) */}
      <div 
        className="absolute inset-0 opacity-50 mix-blend-overlay animate-pulse"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${saturatedHighlight}, transparent 60%),
                       radial-gradient(circle at 70% 70%, ${saturatedHighlight}, transparent 60%)`,
          animationDuration: '6s',
          filter: 'blur(8px)',
          transition: 'background 0.5s ease'
        }}
      />
      {/* Subtle shining light beam sweep */}
      <div 
        className="absolute inset-y-0 w-1/3 -skew-x-12 opacity-25 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
          animation: 'shining-beam 4s infinite ease-in-out'
        }}
      />
      
      {/* Soft dynamic inner glowing pulse edge - narrower glow margin */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          boxShadow: `inset 0 0 10px ${saturatedHighlight}`,
          animation: 'inner-glow-pulse 3s infinite ease-in-out',
          mixBlendMode: 'screen',
          opacity: 0.95,
          transition: 'box-shadow 0.5s ease'
        }}
      />
      
      {/* Glow highlight border - subtle borders */}
      <div className="absolute inset-0 border border-white/10 rounded-2xl" />

      <style jsx global>{`
        @keyframes shining-beam {
          0% { transform: translateX(-150%) skewX(-12deg); }
          50% { transform: translateX(250%) skewX(-12deg); }
          100% { transform: translateX(250%) skewX(-12deg); }
        }
        @keyframes inner-glow-pulse {
          0% {
            box-shadow: inset 0 0 6px var(--glow-color, rgba(255,255,255,0.4)),
                        inset 0 0 12px var(--glow-fallback, ${saturatedHighlight}dd);
            opacity: 0.75;
          }
          50% {
            box-shadow: inset 0 0 12px var(--glow-color, rgba(255,255,255,0.7)),
                        inset 0 0 20px var(--glow-fallback, ${saturatedHighlight});
            opacity: 1.0;
          }
          100% {
            box-shadow: inset 0 0 6px var(--glow-color, rgba(255,255,255,0.4)),
                        inset 0 0 12px var(--glow-fallback, ${saturatedHighlight}dd);
            opacity: 0.75;
          }
        }
        @keyframes transition-vibe-glow {
          0% {
            filter: saturate(2.5) brightness(1.6) contrast(1.2);
            box-shadow: 0 0 20px ${saturatedHighlight}55, inset 0 0 16px ${saturatedHighlight};
            transform: scale(1.05);
          }
          20% {
            filter: saturate(2.0) brightness(1.3) contrast(1.1);
            transform: scale(1.02);
          }
          100% {
            filter: saturate(1) brightness(1) contrast(1);
            box-shadow: 0 0 12px ${saturatedHighlight}33, inset 0 0 10px ${saturatedHighlight}77;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

// Beautiful front-facing bus icon
const BusIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="3" width="16" height="15" rx="2" />
    <path d="M4 11h16" />
    <path d="M8 15h.01" />
    <path d="M16 15h.01" />
    <path d="M6 18v2" />
    <path d="M18 18v2" />
  </svg>
);

export default function Home() {
  // Selected Station & Map States
  const [stations, setStations] = useState(PREDEFINED_STATIONS);
  const [selectedStationId, setSelectedStationId] = useState("ST_SEOKGWAN"); // Default: Seokgwan (석관동주민센터)
  const [userLocation, setUserLocation] = useState(null);
  const [targetTime, setTargetTime] = useState(new Date("2026-06-15T14:19:00Z")); // Matches screenshot time
  const [dataSource, setDataSource] = useState("checking"); // 'api' | 'local'
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(3); // 1: 전광판, 2: 4개역, 3: 7개역, 4: 11개역, 5: 모든역
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(true);

  const playIntervalRef = useRef(null);

  const selectedStation = stations.find(s => s.id === selectedStationId) || stations[0];

  // Check backend connection on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch("http://localhost:8000/");
        if (res.ok) {
          setDataSource("api");
        } else {
          setDataSource("local");
        }
      } catch (e) {
        setDataSource("local");
      }
    };
    checkBackend();
  }, []);

  // Get User Location on Mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userCoords = [latitude, longitude];
          setUserLocation(userCoords);

          // Dynamically create a station at user's exact location
          const userStationId = `ST_USER_${Date.now()}`;
          
          let neighborhoodName = "내 위치";
          let minDistance = Infinity;
          NEIGHBORHOODS.forEach(nb => {
            const dist = Math.sqrt(Math.pow(nb.lat - latitude, 2) + Math.pow(nb.lng - longitude, 2));
            if (dist < minDistance) {
              minDistance = dist;
              neighborhoodName = nb.name;
            }
          });
          
          const userStationName = `${neighborhoodName} 내 위치 정류소`;
          
          // Assign 3-4 routes deterministically based on coordinates
          const allRouteKeys = Object.keys(ROUTE_DETAILS);
          const seed = Math.floor((latitude + longitude) * 1000);
          const shuffledRoutes = [...allRouteKeys].sort(() => 0.5 - ((seed % 10) / 10));
          const assignedRoutes = shuffledRoutes.slice(0, 3 + (seed % 2));
          
          const userStation = {
            id: userStationId,
            name: userStationName,
            lat: latitude,
            lng: longitude,
            routes: assignedRoutes
          };
          
          setStations(prev => {
            const filtered = prev.filter(s => !s.id.startsWith("ST_USER_"));
            return [...filtered, userStation];
          });
          setSelectedStationId(userStationId);

          // Fetch real name via Nominatim reverse geocoding
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ko`, {
            headers: {
              'User-Agent': 'BusArrivalPredictionPrototype/1.0'
            }
          })
            .then(res => res.json())
            .then(data => {
              const addr = data.address;
              const realName = addr.neighbourhood || addr.suburb || addr.village || addr.town || addr.city_district || neighborhoodName;
              const updatedName = `${realName} 내 위치 정류소`;
              
              setStations(prev => prev.map(s => {
                if (s.id === userStationId) {
                  return { ...s, name: updatedName };
                }
                return s;
              }));
            })
            .catch(err => console.error("Nominatim user location error:", err));
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
        }
      );
    }
  }, []);

  // Handle Canvas Click to Create Station
  const handleMapClick = async (lat, lng) => {
    let closestNb = NEIGHBORHOODS[0];
    let minDistance = Infinity;
    
    NEIGHBORHOODS.forEach(nb => {
      const dist = Math.sqrt(Math.pow(nb.lat - lat, 2) + Math.pow(nb.lng - lng, 2));
      if (dist < minDistance) {
        minDistance = dist;
        closestNb = nb;
      }
    });

    const newStationId = `ST_CLICK_${Date.now()}`;
    const newStationName = `${closestNb.name} 가상 정류소`;
    
    // Deterministically assign 3-4 routes based on coordinates
    const allRouteKeys = Object.keys(ROUTE_DETAILS);
    const seed = Math.floor((lat + lng) * 1000);
    const shuffledRoutes = [...allRouteKeys].sort(() => 0.5 - ((seed % 10) / 10));
    const assignedRoutes = shuffledRoutes.slice(0, 3 + (seed % 2)); // 3 or 4 routes

    const newStation = {
      id: newStationId,
      name: newStationName,
      lat,
      lng,
      routes: assignedRoutes
    };

    setStations(prev => [...prev, newStation]);
    setSelectedStationId(newStationId);
    
    // Fetch real name via Nominatim reverse geocoding
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ko`, {
      headers: {
        'User-Agent': 'BusArrivalPredictionPrototype/1.0'
      }
    })
      .then(res => res.json())
      .then(data => {
        const addr = data.address;
        const realName = addr.neighbourhood || addr.suburb || addr.village || addr.town || addr.city_district || closestNb.name;
        const updatedName = `${realName} 가상 정류소`;
        
        setStations(prev => prev.map(s => {
          if (s.id === newStationId) {
            return { ...s, name: updatedName };
          }
          return s;
        }));
      })
      .catch(err => console.error("Nominatim click error:", err));
  };

  // Move to User Location
  const handleMoveToUserLocation = () => {
    if (userLocation) {
      // Find the user station in the list
      const userSt = stations.find(s => s.id.startsWith("ST_USER_"));
      if (userSt) {
        setSelectedStationId(userSt.id);
        setZoomLevel(1); // Zoom in to electronic board
      } else {
        alert("내 위치 정류소를 생성하는 중입니다. 잠시만 기다려주세요.");
      }
    } else {
      alert("사용자의 현재 위치를 가져오는 중이거나 권한이 거부되었습니다.");
    }
  };

  // Play/Pause Simulation Effect
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setTargetTime(prev => new Date(prev.getTime() + 60 * 1000)); // Add 1 minute
      }, 1000); // 1 second real-time = 1 minute simulation
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // Slider change (minutes of the day)
  const handleSliderChange = (e) => {
    const minutes = parseInt(e.target.value);
    const newTime = new Date(targetTime);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    newTime.setUTCHours(hours, mins, 0, 0);
    setTargetTime(newTime);
  };

  const getMinutesOfDay = (date) => {
    return date.getUTCHours() * 60 + date.getUTCMinutes();
  };

  const getDynamicInterval = (route, minutes) => {
    const baseInterval = route.interval;
    
    // Dawn / Early Morning (04:00 - 06:30)
    if (minutes >= 240 && minutes < 390) {
      return baseInterval * 2.0; // 2x longer interval at dawn
    }
    // Early Morning Transition (06:30 - 07:30)
    if (minutes >= 390 && minutes < 450) {
      return baseInterval * 1.4; // 1.4x longer interval
    }
    // Rush Hour (07:30 - 09:30)
    if (minutes >= 450 && minutes < 570) {
      return baseInterval * 0.85; // Slightly more frequent during morning rush hour
    }
    // Evening Rush Hour (17:30 - 19:30)
    if (minutes >= 1050 && minutes < 1170) {
      return baseInterval * 0.85; // Slightly more frequent during evening rush hour
    }
    // Late Night (21:00 - 23:00)
    if (minutes >= 1260 && minutes < 1380) {
      return baseInterval * 1.5; // 1.5x longer interval late at night
    }
    
    return baseInterval;
  };

  // Deterministic Multi-Route Simulation Engine
  const getSimulatedBusesForStation = (station) => {
    if (!station) return {};
    
    const minutesOfDay = getMinutesOfDay(targetTime);
    const isRushHour = (minutesOfDay >= 450 && minutesOfDay <= 570) || (minutesOfDay >= 1050 && minutesOfDay <= 1170); // 07:30-09:30, 17:30-19:30
    const isNightHour = (minutesOfDay >= 1380 || minutesOfDay < 240); // 23:00-04:00
    
    const results = {};
    
    station.routes.forEach(routeId => {
      const route = ROUTE_DETAILS[routeId];
      if (!route) return;
      
      // Night hour rules
      const isNightRoute = route.type === "심야";
      if (isNightHour && !isNightRoute) {
        results[routeId] = [];
        return;
      }
      if (!isNightHour && isNightRoute) {
        results[routeId] = [];
        return;
      }
      
      // Seed offset based on routeId and station ID
      let seed = 0;
      const seedStr = `${routeId}_${station.id}`;
      for (let i = 0; i < seedStr.length; i++) {
        seed += seedStr.charCodeAt(i);
      }
      
      const offset = seed % route.interval;
      
      // Generate scheduled arrival times
      const arrivals = [];
      let currentArrival = offset;
      while (currentArrival < 1440) {
        arrivals.push(currentArrival);
        const dynamicInterval = getDynamicInterval(route, currentArrival);
        currentArrival += Math.max(5, Math.round(dynamicInterval)); // Ensure interval is at least 5 mins
      }
      
      const activeBuses = [];
      
      arrivals.forEach((arrivalTime, index) => {
        let diff = arrivalTime - minutesOfDay;
        if (diff < -1400) diff += 1440; // wrap around day boundary
        
        if (diff >= -3 && diff <= 15) {
          let minutesLeft = diff;
          let status = "NORMAL";
          
          if (isRushHour) {
            status = "CROWDED";
            const delaySeed = (index + seed) % 3;
            if (diff >= 0) {
              minutesLeft = Math.min(15, minutesLeft + delaySeed);
            }
          }
          
          activeBuses.push({
            id: `${routeId}_BUS_${index}`,
            minutesLeft: Math.round(minutesLeft),
            status,
            routeId,
            route
          });
        }
      });
      
      activeBuses.sort((a, b) => a.minutesLeft - b.minutesLeft);
      results[routeId] = activeBuses;
    });
    
    return results;
  };

  const getActiveBusesForStation = (station) => {
    if (!station) return [];
    const simulated = getSimulatedBusesForStation(station);
    const allBuses = [];
    station.routes.forEach(routeId => {
      const busesForRoute = simulated[routeId] || [];
      busesForRoute.forEach(bus => {
        allBuses.push(bus);
      });
    });
    return allBuses.sort((a, b) => a.minutesLeft - b.minutesLeft);
  };

  // Mouse wheel zoom handler
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault(); // Prevent default page scrolling
      if (Math.abs(e.deltaY) > 10) {
        if (e.deltaY > 0) {
          // Scroll down -> Zoom Out (increase zoomLevel up to 5)
          setZoomLevel(prev => Math.min(5, prev + 1));
        } else {
          // Scroll up -> Zoom In (decrease zoomLevel down to 1)
          setZoomLevel(prev => Math.max(1, prev - 1));
        }
      }
    };

    const container = document.getElementById('art-canvas-container');
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  const formatStationNameForSvg = (name, total) => {
    let cleanName = name.replace(" 정류소", "").replace(" 환승센터", "").replace(" 가상정류소", "").replace(" 가상 정류소", "");
    if (total > 8 && cleanName.length > 6) {
      cleanName = cleanName.slice(0, 5) + "..";
    }
    return cleanName;
  };

  // Helper to get closest stations centered around the selected station depending on zoom level
  const getActiveStations = () => {
    // Center around selectedStation to allow dynamic exploration of different map areas
    const centerLat = selectedStation.lat;
    const centerLng = selectedStation.lng;
    
    const stationsWithDistance = stations.map(st => {
      const dist = Math.sqrt(
        Math.pow(st.lat - centerLat, 2) + 
        Math.pow(st.lng - centerLng, 2)
      );
      return { ...st, dist };
    });
    
    // Sort by distance
    const sortedByDist = stationsWithDistance.sort((a, b) => a.dist - b.dist);
    
    // Number of stations to show based on zoom level (2 to 5)
    let count = 7;
    if (zoomLevel <= 2) count = 4;
    else if (zoomLevel === 3) count = 7;
    else if (zoomLevel === 4) count = 11;
    else if (zoomLevel === 5) count = stations.length;
    
    const closest = sortedByDist.slice(0, count);
    
    // Sort by longitude (west to east) so they are rendered in geographic order on the X-axis
    return closest.sort((a, b) => a.lng - b.lng);
  };

  const activeStations = getActiveStations();

  // Find all unique routes passing through any of the active 6 stations
  const getActiveRoutes = () => {
    const activeRoutesSet = new Set();
    activeStations.forEach(st => {
      st.routes.forEach(r => activeRoutesSet.add(r));
    });
    return Array.from(activeRoutesSet).sort((a, b) => {
      const typeA = ROUTE_DETAILS[a]?.type || "";
      const typeB = ROUTE_DETAILS[b]?.type || "";
      return typeA.localeCompare(typeB); // Group by type beautifully
    });
  };

  const activeRoutes = getActiveRoutes();

  // Handle SVG Canvas Click to add virtual station
  const handleSvgCanvasClick = (e) => {
    // Ignore if clicked an interactive element like a node or text
    if (e.target.closest('.interactive-node') || e.target.closest('.control-btn')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Linear mapping from SVG coordinates to Seoul lat/lng bounds
    const LAT_MIN = 37.49;
    const LAT_MAX = 37.62;
    const LNG_MIN = 127.01;
    const LNG_MAX = 127.11;

    const lng = LNG_MIN + (x / rect.width) * (LNG_MAX - LNG_MIN);
    const lat = LAT_MAX - (y / rect.height) * (LAT_MAX - LAT_MIN);

    handleMapClick(lat, lng);
  };

  // Render Zoom Out View: Artistic SVG Route Map
  const renderSvgMap = () => {
    const S = activeStations.length;
    const R = activeRoutes.length;

    // Dynamic Station X spacing based on total active stations to prevent overlapping
    const getStationX = (index) => {
      let startX = 180;
      let endX = 660;
      
      if (S <= 4) {
        startX = 220;
        endX = 780;
      } else if (S <= 7) {
        startX = 140;
        endX = 860;
      } else if (S <= 11) {
        startX = 100;
        endX = 900;
      } else {
        startX = 60;
        endX = 940;
      }
      
      return startX + index * ((endX - startX) / (S - 1 || 1));
    };

    const getRouteY = (index) => 140 + index * (410 / (R - 1 || 1));
    const lineStartX = zoomLevel === 5 ? 15 : 50;

    return (
      <svg 
        className="w-full h-full select-none bg-black" 
        viewBox="0 0 1000 600"
      >
        {/* Definitions for Glow Filters and Gradients */}
        <defs>
          <filter id="neon-glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neon-glow-sky" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neon-glow-rose" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neon-glow-amber" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neon-glow-indigo" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="selected-column-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0)" />
            <stop offset="50%" stopColor="rgba(99, 102, 241, 0.12)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
          </linearGradient>
        </defs>

        {/* Cyber Grid Background */}
        <g stroke="rgba(255, 255, 255, 0.015)" strokeWidth="1">
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`v-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={600} />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={`h-${i}`} x1={0} y1={i * 50} x2={1000} y2={i * 50} />
          ))}
        </g>

        {/* Selected Station Scanner Beam */}
        {activeStations.map((st, index) => {
          if (st.id !== selectedStationId) return null;
          const x = getStationX(index);
          return (
            <g key="scanner-beam">
              <rect 
                x={x - 22} 
                y={80} 
                width={44} 
                height={480} 
                rx={12} 
                fill="url(#selected-column-grad)" 
                stroke="rgba(99, 102, 241, 0.25)" 
                strokeWidth={1.5} 
                strokeDasharray="4 4" 
              />
              <line 
                x1={x} 
                y1={80} 
                x2={x} 
                y2={560} 
                stroke="rgba(99, 102, 241, 0.4)" 
                strokeWidth={1} 
                strokeDasharray="2 6" 
              />
            </g>
          );
        })}

        {/* Station Vertical Columns (Subtle background guide lines) */}
        {activeStations.map((st, index) => {
          const x = getStationX(index);
          return (
            <line 
              key={`st-line-${st.id}`} 
              x1={x} 
              y1={120} 
              x2={x} 
              y2={520} 
              stroke="rgba(255, 255, 255, 0.03)" 
              strokeWidth={1} 
              strokeDasharray="2 2" 
            />
          );
        })}

        {/* Glowing Bus Route Lines (Cascade curves on the right) */}
        {activeRoutes.map((routeId, index) => {
          const r = ROUTE_DETAILS[routeId] || { color: "sky", hex: "#0ea5e9" };
          const y = getRouteY(index);
          const filterId = `url(#neon-glow-${r.color})`;

          const lastStationX = getStationX(S - 1);
          const curveStart = Math.min(960, lastStationX + 25 + (index * 4));
          const curveEnd = Math.min(985, curveStart + 15);

          let pathD = "";
          if (index < R / 3) {
            // Top routes curve upwards
            pathD = `M ${lineStartX},${y} L ${curveStart},${y} Q ${curveEnd},${y} ${curveEnd},${y - 40} L ${curveEnd},45`;
          } else if (index >= R / 3 && index < 2 * R / 3) {
            // Middle routes go straight
            pathD = `M ${lineStartX},${y} L 980,${y}`;
          } else {
            // Bottom routes curve downwards
            pathD = `M ${lineStartX},${y} L ${curveStart},${y} Q ${curveEnd},${y} ${curveEnd},${y + 40} L ${curveEnd},555`;
          }

          return (
            <g key={`route-line-${routeId}`}>
              {/* Neon Glow Outer Line */}
              <path 
                d={pathD} 
                stroke={r.hex} 
                strokeWidth={18} 
                fill="none" 
                opacity={0.35} 
                filter={filterId} 
              />
              {/* Sharp Inner Line */}
              <path 
                d={pathD} 
                stroke={r.hex} 
                strokeWidth={8} 
                fill="none" 
              />
            </g>
          );
        })}

        {/* Route Labels on the Left Side */}
        {zoomLevel < 5 && activeRoutes.map((routeId, index) => {
          const r = ROUTE_DETAILS[routeId] || { color: "sky", hex: "#0ea5e9" };
          const y = getRouteY(index);
          return (
            <g key={`label-left-${routeId}`}>
              <rect 
                x={20} 
                y={y - 10} 
                width={50} 
                height={20} 
                rx={6} 
                fill="rgba(0, 0, 0, 0.85)" 
                stroke={r.hex} 
                strokeWidth={1.5} 
              />
              <text 
                x={45} 
                y={y + 4} 
                className="text-[10px] font-black font-mono tracking-tight" 
                fill="white" 
                textAnchor="middle"
              >
                {routeId.replace("번", "")}
              </text>
            </g>
          );
        })}

        {/* Route Labels at the curve ends (Vertical text) */}
        {zoomLevel < 5 && activeRoutes.map((routeId, index) => {
          const r = ROUTE_DETAILS[routeId] || { color: "sky", hex: "#0ea5e9" };
          const y = getRouteY(index);
          const lastStationX = getStationX(S - 1);
          const curveStart = Math.min(960, lastStationX + 25 + (index * 4));
          const curveEnd = Math.min(985, curveStart + 15);

          if (index < R / 3) {
            // Top routes (Vertical text at the top)
            return (
              <text 
                key={`label-end-${routeId}`}
                x={curveEnd} 
                y={30} 
                transform={`rotate(-90, ${curveEnd}, 30)`} 
                className="text-[8px] font-extrabold font-mono" 
                fill={r.hex} 
                textAnchor="end"
                opacity={0.8}
              >
                {routeId}
              </text>
            );
          } else if (index >= 2 * R / 3) {
            // Bottom routes (Vertical text at the bottom)
            return (
              <text 
                key={`label-end-${routeId}`}
                x={curveEnd} 
                y={570} 
                transform={`rotate(-90, ${curveEnd}, 570)`} 
                className="text-[8px] font-extrabold font-mono" 
                fill={r.hex} 
                textAnchor="start"
                opacity={0.8}
              >
                {routeId}
              </text>
            );
          } else {
            // Straight middle routes (Horizontal text at the right edge)
            return (
              <text 
                key={`label-end-${routeId}`}
                x={Math.min(980, curveEnd + 10)} 
                y={y + 3} 
                className="text-[8px] font-extrabold font-mono" 
                fill={r.hex} 
                textAnchor="start"
                opacity={0.8}
              >
                {routeId}
              </text>
            );
          }
        })}

        {/* Station Nodes (Intersections) */}
        {activeStations.map((st, sIdx) => {
          const x = getStationX(sIdx);
          const isSelectedStation = st.id === selectedStationId;

          return (
            <g key={`st-nodes-${st.id}`} className="interactive-node">
              {activeRoutes.map((routeId, rIdx) => {
                const hasRoute = st.routes.includes(routeId);
                if (!hasRoute) return null;

                const r = ROUTE_DETAILS[routeId] || { color: "sky", hex: "#0ea5e9" };
                const y = getRouteY(rIdx);

                // Deterministic direction arrow
                let arrow = "→";
                const stopsAt = activeStations.filter(s => s.routes.includes(routeId));
                const currentStopIdx = stopsAt.findIndex(s => s.id === st.id);
                if (currentStopIdx !== -1 && currentStopIdx < stopsAt.length - 1) {
                  const nextStop = stopsAt[currentStopIdx + 1];
                  const nextStIdx = activeStations.findIndex(s => s.id === nextStop.id);
                  arrow = nextStIdx > sIdx ? "→" : "←";
                } else {
                  // Fallback based on route index
                  arrow = rIdx % 2 === 0 ? "→" : "←";
                }

                return (
                  <g 
                    key={`node-${st.id}-${routeId}`} 
                    className="cursor-pointer group"
                    onClick={() => {
                      setSelectedStationId(st.id);
                      setZoomLevel(1); // Zoom in to electronic board
                    }}
                  >
                    {/* Pulsing Highlight for Selected Station Nodes */}
                    {isSelectedStation && (
                      <circle 
                        cx={x} 
                        cy={y} 
                        r={24} 
                        fill={r.hex} 
                        opacity={0.2} 
                        className="animate-ping" 
                      />
                    )}

                    {/* Outer Node Circle */}
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={isSelectedStation ? 15 : 11} 
                      fill={isSelectedStation ? r.hex : "#000000"} 
                      stroke={isSelectedStation ? "white" : r.hex} 
                      strokeWidth={isSelectedStation ? 2.5 : 3} 
                      className="transition-all duration-300 group-hover:scale-125"
                    />

                    {/* Direction Arrow */}
                    <text 
                      x={x} 
                      y={isSelectedStation ? y + 4 : y + 3.5} 
                      className={`font-black text-center select-none ${
                        isSelectedStation ? "text-[12px]" : "text-[9px]"
                      }`} 
                      fill={isSelectedStation ? "white" : r.hex} 
                      textAnchor="middle"
                    >
                      {arrow}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Station Labels (Rotated at the top of columns) */}
        {activeStations.map((st, index) => {
          const x = getStationX(index);
          const isSelected = st.id === selectedStationId;
          return (
            <g 
              key={`label-st-${st.id}`} 
              className="cursor-pointer"
              onClick={() => {
                setSelectedStationId(st.id);
                setZoomLevel(1); // Zoom in to electronic board
              }}
            >
              {/* Vertical Station Name */}
              <text 
                x={x} 
                y={115} 
                transform={`rotate(-90, ${x}, 115)`} 
                className={`font-black tracking-tight transition-all duration-300 ${
                  isSelected 
                    ? "text-[12px] fill-indigo-400 font-extrabold" 
                    : "text-[10px] fill-slate-400 font-bold hover:fill-slate-200"
                }`} 
                textAnchor="end"
              >
                {formatStationNameForSvg(st.name, S)}
              </text>

              {/* Glowing Indicator Dot */}
              <circle 
                cx={x} 
                y={125} 
                r={isSelected ? 4 : 2.5} 
                fill={isSelected ? "#818cf8" : "#475569"} 
                className={isSelected ? "animate-pulse" : ""}
                stroke={isSelected ? "white" : "none"}
                strokeWidth={0.5}
              />
            </g>
          );
        })}
      </svg>
    );
  };

  // Render Zoom In View: Multi-Track Neon Dashboard (Second Image)
  const renderMultiTrackDashboard = () => {
    if (!selectedStation) return null;

    return (
      <div className="h-full w-full">
        <div className="h-full w-full flex flex-col gap-4 p-4">
          {activeStations.map(st => {
            const isSelected = st.id === selectedStationId;
            const rawBuses = getActiveBusesForStation(st).slice(0, 8);

            // Calculate adjusted non-overlapping positions
            const adjustedBuses = [];
            rawBuses.forEach((bus, index) => {
              const leftPercent = 6 + ((15 - bus.minutesLeft) / 15) * 84; // 6% ~ 90%
              
              // Determine approximate width percent of the card
              let widthPercent = 6;
              if (bus.minutesLeft <= 1) {
                widthPercent = 35; // Hero card: w-72 sm:w-[420px] -> ~35%
              } else if (bus.minutesLeft < 5) {
                widthPercent = 22; // Rect card: w-52 sm:w-60 -> ~22%
              } else if (bus.minutesLeft < 11) {
                widthPercent = 8;  // Square card: w-16 -> ~8%
              } else {
                widthPercent = 6;  // Dot card: w-12 -> ~6%
              }
              
              let adjustedLeft = leftPercent;
              
              if (index > 0) {
                const prevBus = adjustedBuses[index - 1];
                // The previous bus is further to the right (larger adjustedLeftPercent)
                // The minimum distance between their centers is (widthPercent_prev + widthPercent_curr) / 2 + gap
                const minDistance = (prevBus.widthPercent + widthPercent) / 2 + 1.5; // 1.5% extra gap
                
                // If the current bus is too close to the previous bus, push it to the left
                if (adjustedLeft > prevBus.adjustedLeftPercent - minDistance) {
                  adjustedLeft = prevBus.adjustedLeftPercent - minDistance;
                }
              }
              
              adjustedBuses.push({
                ...bus,
                widthPercent,
                originalLeftPercent: leftPercent,
                adjustedLeftPercent: adjustedLeft
              });
            });

            return (
              <div
                key={`station-track-${st.id}`}
                className={`relative flex-1 min-h-[132px] rounded-3xl overflow-hidden border shadow-[inset_0_0_0_1px_rgba(2,6,23,0.35)] ${
                  isSelected ? 'border-indigo-500/35' : 'border-slate-900/70'
                }`}
              >
                {/* Track Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#050713] via-[#050A16] to-[#050713]" />
                <div className="absolute inset-0 opacity-70" style={{
                  backgroundImage:
                    'linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0) 18%, rgba(0,0,0,0) 82%, rgba(255,255,255,0.04))'
                }} />
                <div className={`absolute inset-0 ${isSelected ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`} style={{
                  backgroundImage:
                    'radial-gradient(600px 180px at 70% 50%, rgba(99,102,241,0.18), rgba(99,102,241,0) 60%)'
                }} />

                {/* Content */}
                <div className="relative h-full w-full flex items-center">
                  {/* Main Lane */}
                  <div className="relative flex-1 h-full px-8">
                    {/* Station Label */}
                    <div className="absolute left-6 top-3 flex items-center gap-2">
                      <span className={`text-[10px] font-black tracking-widest uppercase ${
                        isSelected ? 'text-indigo-300/90' : 'text-slate-500'
                      }`}>
                        {isSelected ? 'SELECTED' : 'NEARBY'}
                      </span>
                      <span className={`text-[11px] font-black ${
                        isSelected ? 'text-slate-100' : 'text-slate-300/90'
                      }`}>
                        {st.name.replace(" 정류소", "")}
                      </span>
                    </div>

                    {/* Center Lane Line */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-slate-900/80" />
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px border-t border-dashed border-slate-800/60" />

                    {/* Bus Cards */}
                    <div className="relative h-full w-full">
                      {adjustedBuses.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center opacity-35 pointer-events-none">
                          <span className="text-[11px] text-slate-500 font-black italic tracking-wide">이 시간대 운행 버스 없음</span>
                        </div>
                      ) : (
                        adjustedBuses.map(bus => {
                          const isCrowded = bus.status === 'CROWDED';
                          const r = bus.route || { color: "sky", hex: "#0ea5e9", rgb: "14, 165, 233", name: bus.routeId };

                          // Position (15m => left, 0m => right)
                          const leftPercent = bus.adjustedLeftPercent;

                          const isHero = bus.minutesLeft <= 1;      // very near/arrived: huge rectangle
                          const isRect = bus.minutesLeft < 5;       // near: rectangle
                          const isSquare = bus.minutesLeft < 11;    // mid: square
                          const isDot = bus.minutesLeft >= 11;      // far: circle

                          let cardClass = "";
                          let inner = null;
                          let glowStyle = {};

                          let posStyle = {};

                          if (isHero) {
                            // Let the hero card slide off the right edge completely without clamping on the right side!
                            posStyle = {
                              left: `${leftPercent}%`,
                              top: "50%",
                              transform: "translate(-50%, -50%)",
                              zIndex: 80 - bus.minutesLeft,
                              opacity: bus.minutesLeft < 0 ? Math.max(0, 1 + bus.minutesLeft * 0.3) : 1, // Smooth fade out as it slides off!
                            };
                          } else {
                            posStyle = {
                              left: `${leftPercent}%`,
                              top: "50%",
                              transform: "translate(-50%, -50%)",
                              zIndex: 50 - bus.minutesLeft
                            };
                          }

                          if (isHero) {
                            cardClass = "w-72 sm:w-[420px] h-20 rounded-2xl border border-white/10";
                            inner = (
                              <div className="flex items-center justify-center w-full h-full pointer-events-auto">
                                <span className="text-[28px] sm:text-[34px] font-semibold tracking-tight leading-none text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.15)]">
                                  {r.name}
                                </span>
                              </div>
                            );
                          } else if (isRect) {
                            // Rectangle (2~4m): wide card
                            cardClass = "w-52 sm:w-60 h-16 rounded-2xl border border-white/5";
                            inner = (
                              <div className="flex items-center justify-between w-full h-full px-5 pointer-events-auto">
                                <div className="flex flex-col items-start justify-center">
                                  <span className="text-[16px] font-extrabold leading-none tracking-tight text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)]">
                                    {r.name}
                                  </span>
                                  <span className="text-[11px] font-bold opacity-95 text-white/90 mt-1.5">
                                    {bus.minutesLeft}분전
                                  </span>
                                </div>
                                {isCrowded && (
                                  <span className="text-[9px] bg-white text-rose-600 px-1.5 py-0.5 rounded font-black shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                                    혼잡
                                  </span>
                                )}
                              </div>
                            );
                          } else if (isSquare) {
                            // Square (5~10m): square-ish tile
                            cardClass = "w-16 h-16 rounded-2xl border border-white/5";
                            inner = (
                              <div className="flex flex-col items-center justify-center w-full h-full pointer-events-auto">
                                <span className="text-[12px] font-extrabold tracking-tight leading-none text-white">
                                  {r.name.replace("번", "")}
                                </span>
                                <span className="text-[9px] font-bold opacity-90 text-white/90 mt-1.5">
                                  {bus.minutesLeft}분전
                                </span>
                              </div>
                            );
                          } else if (isDot) {
                            // Circle (11~15m): dot
                            cardClass = "w-12 h-12 rounded-full border border-white/5";
                            inner = (
                              <div className="flex flex-col items-center justify-center w-full h-full pointer-events-auto">
                                <span className="text-[10px] font-bold font-mono tracking-tight leading-none text-white">
                                  {r.name.replace("번", "")}
                                </span>
                                <span className="text-[8px] font-medium opacity-85 text-white/80 mt-1">
                                  {bus.minutesLeft}m
                                </span>
                              </div>
                            );
                          }

                          // Get beautiful, vibrant highlight colors matching each route type
                          let highlightHex = "#6366f1"; // Default purple
                          if (isCrowded) {
                            highlightHex = "#f87171"; // Fiery red highlight
                          } else {
                            switch (r.color) {
                              case "emerald":
                                highlightHex = "#34d399"; // Bright neon mint
                                break;
                              case "sky":
                                highlightHex = "#38bdf8"; // Electric cyan
                                break;
                              case "rose":
                                highlightHex = "#f87171"; // Vibrant neon red/pink
                                break;
                              case "amber":
                                highlightHex = "#fbbf24"; // Radiant yellow/gold
                                break;
                              case "indigo":
                                highlightHex = "#818cf8"; // Deep neon indigo
                                break;
                            }
                          }

                          const currentTypeKey = isHero ? 'hero' : isRect ? 'rect' : isSquare ? 'square' : 'dot';

                          return (
                            <div
                              key={`${st.id}-${bus.id}`}
                              className="absolute transition-all duration-1000 ease-in-out"
                              style={posStyle}
                            >
                              <div className={`${cardClass} relative overflow-visible transition-all duration-1000 ease-in-out`}>
                                <WebGLBusCard 
                                  key={`${bus.id}-${currentTypeKey}`}
                                  hex={r.hex}
                                  highlightHex={highlightHex}
                                  isDot={isDot}
                                />
                                <div className="absolute inset-0 z-10 flex items-center justify-center w-full h-full pointer-events-none">
                                  {inner}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden">
      <Head>
        <title>Bus Arrival Prediction Art</title>
      </Head>

      {/* Futuristic Header */}
      <header className="border-b border-slate-900/60 bg-black/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <Navigation className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-md font-black tracking-tight bg-gradient-to-r from-indigo-300 via-purple-400 to-pink-300 bg-clip-text text-transparent">
              Bus Arrival Prediction Art
            </h1>
            <p className="text-[9px] text-slate-500 font-bold tracking-wider">서울시 버스 가상화 타임라인 및 예술적 노선도 시뮬레이터</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Active Status Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full text-[9px] font-bold bg-emerald-500/5 text-emerald-400 border border-emerald-500/15">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            <span>예측 시뮬레이션 활성화</span>
          </div>

          {/* Backend Connection Badge */}
          <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[9px] font-bold border ${
            dataSource === 'api' 
              ? 'bg-indigo-500/5 text-indigo-400 border-indigo-500/15' 
              : dataSource === 'local'
              ? 'bg-amber-500/5 text-amber-400 border-amber-500/15'
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}>
            {dataSource === 'api' ? (
              <>
                <Server className="h-2.5 w-2.5 text-indigo-400" />
                <span>FastAPI 연동</span>
              </>
            ) : dataSource === 'local' ? (
              <>
                <Database className="h-2.5 w-2.5 text-amber-400" />
                <span>로컬 모드</span>
              </>
            ) : (
              <span>연결 확인 중...</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Interactive Canvas Area */}
      <main className="flex-1 relative w-full mx-auto p-6 flex flex-col justify-center items-center">
        
        {/* Collapsible Floating Left Info Panel */}
        <div className={`fixed top-24 left-6 z-40 w-80 transition-all duration-500 ease-in-out ${
          isInfoPanelOpen ? 'translate-x-0 opacity-100' : '-translate-x-96 opacity-0 pointer-events-none'
        }`}>
          <div className="backdrop-blur-xl bg-slate-950/75 border border-slate-900/80 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-900">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                <span>선택된 정류소 정보</span>
              </h2>
              <button 
                onClick={() => setIsInfoPanelOpen(false)}
                className="text-[9px] text-slate-500 hover:text-slate-300 font-bold uppercase tracking-wider control-btn"
              >
                접기
              </button>
            </div>

            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4 space-y-3">
              <div>
                <span className="text-[8px] text-indigo-400 font-black uppercase tracking-wider block mb-0.5">정류소명</span>
                <h3 className="text-sm font-black text-slate-100 tracking-tight">{selectedStation.name}</h3>
                <span className="text-[9px] text-slate-500 font-mono block mt-1">
                  위도: {selectedStation.lat.toFixed(4)} • 경도: {selectedStation.lng.toFixed(4)}
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">경유 노선 ({selectedStation.routes.length}개)</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {selectedStation.routes.map(rId => {
                    const r = ROUTE_DETAILS[rId] || { name: rId, type: "지선", color: "emerald" };
                    return (
                      <div 
                        key={rId} 
                        className="px-2 py-1 rounded-lg bg-black/40 border border-slate-900 flex items-center justify-between"
                      >
                        <span className="text-[10px] font-black text-slate-200">{r.name}</span>
                        <span className={`text-[8px] px-1 rounded font-black border ${
                          r.type === '지선' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/15' :
                          r.type === '광역' ? 'bg-rose-500/5 text-rose-400 border-rose-500/15' :
                          r.type === '간선' ? 'bg-sky-500/5 text-sky-400 border-sky-500/15' :
                          'bg-indigo-500/5 text-indigo-400 border-indigo-500/15'
                        }`}>
                          {r.type[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Guide Info */}
            <div className="text-[9px] text-slate-500 space-y-1 leading-relaxed">
              <p className="font-extrabold text-indigo-400 flex items-center space-x-1">
                <Info className="h-3 w-3" />
                <span>인터랙션 가이드</span>
              </p>
              <p>• <b>마우스 휠</b>을 굴려 줌 인/아웃을 조절할 수 있습니다.</p>
              <p>• <b>줌 아웃(노선도)</b>: 노선도 상의 <b>원형 노드</b>를 클릭해 정류소를 선택하세요. 빈 공간을 클릭하면 <b>가상 정류소</b>가 생성됩니다.</p>
              <p>• <b>줌 인(전광판)</b>: 노선별로 다가오는 버스들을 네온 전광판으로 확인하세요.</p>
            </div>
          </div>
        </div>

        {/* Info Panel Toggle Button when closed */}
        {!isInfoPanelOpen && (
          <button 
            onClick={() => setIsInfoPanelOpen(true)}
            className="fixed top-24 left-6 z-40 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-900 text-[10px] font-black text-indigo-400 hover:text-indigo-300 shadow-xl flex items-center space-x-1.5 transition-all duration-300 control-btn"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>정류소 정보 열기</span>
          </button>
        )}

        {/* Main Art Canvas Container */}
        <div 
          id="art-canvas-container"
          className="w-full max-w-7xl h-[650px] relative rounded-3xl border border-slate-900 bg-black overflow-hidden shadow-2xl"
        >
          {/* Zoom Out View (SVG Map) */}
          <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            zoomLevel > 1 ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
          }`}>
            {renderSvgMap()}
          </div>

          {/* Zoom In View (Multi-Track Dashboard) */}
          <div className={`absolute inset-0 transition-all duration-700 ease-in-out overflow-hidden p-0 ${
            zoomLevel === 1 ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-105 pointer-events-none'
          }`}>
            {renderMultiTrackDashboard()}
          </div>

          {/* Canvas Overlay Instructions */}
          <div className="absolute top-4 right-4 pointer-events-none text-[8px] font-black text-slate-600 tracking-widest uppercase flex items-center space-x-2">
            <span>Scroll Wheel to Zoom</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
          </div>
        </div>

        {/* Floating Bottom Right Premium Control Bar */}
        <div className="fixed bottom-6 right-6 z-40 w-full max-w-xs sm:max-w-sm">
          <div className="backdrop-blur-xl bg-slate-950/75 border border-slate-900/80 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              {/* Cyber Clock */}
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-lg font-mono font-black text-transparent bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text select-none">
                  {formatDisplayTime(targetTime)}
                </span>
              </div>

              {/* Play/Pause Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-[9px] font-black transition-all border shadow control-btn ${
                  isPlaying 
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/5 animate-pulse' 
                    : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 shadow-indigo-500/5 hover:bg-indigo-500/15'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-3 w-3 fill-current" />
                    <span>정지</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 fill-current" />
                    <span>재생</span>
                  </>
                )}
              </button>
            </div>

            {/* Time Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[8px] text-slate-600 font-black font-mono">
                <span>00:00</span>
                <span className="text-indigo-500/40">12:00</span>
                <span>24:00</span>
              </div>
              <input
                type="range"
                min="0"
                max="1439"
                value={getMinutesOfDay(targetTime)}
                onChange={handleSliderChange}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-slate-950 focus:outline-none control-btn"
              />
            </div>

            {/* Zoom and Navigation Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-900">
              {/* Zoom toggle buttons */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setZoomLevel(prev => Math.min(5, prev + 1))}
                  disabled={zoomLevel === 5}
                  className={`p-1.5 rounded-lg border transition-all control-btn ${
                    zoomLevel === 5 
                      ? 'opacity-40 cursor-not-allowed text-slate-600 border-slate-950' 
                      : 'bg-slate-900/40 text-slate-400 border-slate-900 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  title="줌 아웃 (영역 확장)"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(1, prev - 1))}
                  disabled={zoomLevel === 1}
                  className={`p-1.5 rounded-lg border transition-all control-btn ${
                    zoomLevel === 1 
                      ? 'opacity-40 cursor-not-allowed text-slate-600 border-slate-950' 
                      : 'bg-slate-900/40 text-slate-400 border-slate-900 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  title="줌 인 (영역 축소 / 전광판 진입)"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider pl-1 font-mono">
                  {zoomLevel === 1 ? "전광판 뷰" :
                   zoomLevel === 2 ? "근접 노선도 (4개역)" :
                   zoomLevel === 3 ? "일반 노선도 (7개역)" :
                   zoomLevel === 4 ? "광역 노선도 (11개역)" :
                   "전체 노선도 (모든역)"}
                </span>
              </div>

              {/* Move to User Location Button */}
              <button
                onClick={handleMoveToUserLocation}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-[9px] font-black border border-indigo-500/20 hover:border-indigo-500/30 transition flex items-center space-x-1 shadow shadow-indigo-600/5 control-btn"
              >
                <MapPin className="h-3 w-3" />
                <span>내 위치</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 bg-black py-6 text-center text-[10px] text-slate-600 font-bold space-y-1">
        <p>© 2026 Interactive Bus Arrival Prediction Art. All rights reserved.</p>
        <p className="text-slate-700">High-fidelity dark cyber-board for seamless route predictions.</p>
      </footer>
    </div>
  );
}
