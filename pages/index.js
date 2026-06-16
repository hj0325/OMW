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
  Server
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
  "120번": { name: "120번", type: "지선", color: "emerald", hex: "#10b981", interval: 10 },
  "1111번": { name: "1111번", type: "지선", color: "emerald", hex: "#10b981", interval: 11 },
  "1122번": { name: "1122번", type: "지선", color: "emerald", hex: "#10b981", interval: 12 },
  "1213번": { name: "1213번", type: "지선", color: "emerald", hex: "#10b981", interval: 10 },
  "1222번": { name: "1222번", type: "지선", color: "emerald", hex: "#10b981", interval: 13 },
  "2112번": { name: "2112번", type: "지선", color: "emerald", hex: "#10b981", interval: 12 },
  "3412번": { name: "3412번", type: "지선", color: "emerald", hex: "#10b981", interval: 11 },
  "3413번": { name: "3413번", type: "지선", color: "emerald", hex: "#10b981", interval: 9 },
  "5618번": { name: "5618번", type: "지선", color: "emerald", hex: "#10b981", interval: 12 },
  "7011번": { name: "7011번", type: "지선", color: "emerald", hex: "#10b981", interval: 10 },
  "7612번": { name: "7612번", type: "지선", color: "emerald", hex: "#10b981", interval: 9 },
  "7713번": { name: "7713번", type: "지선", color: "emerald", hex: "#10b981", interval: 11 },

  // 간선버스 (Blue)
  "104번": { name: "104번", type: "간선", color: "sky", hex: "#0ea5e9", interval: 8 },
  "109번": { name: "109번", type: "간선", color: "sky", hex: "#0ea5e9", interval: 10 },
  "140번": { name: "140번", type: "간선", color: "sky", hex: "#0ea5e9", interval: 7 },
  "143번": { name: "143번", type: "간선", color: "sky", hex: "#0ea5e9", interval: 6 },
  "144번": { name: "144번", type: "간선", color: "sky", hex: "#0ea5e9", interval: 8 },
  "147번": { name: "147번", type: "간선", color: "sky", hex: "#0ea5e9", interval: 8 },
  "150번": { name: "150번", type: "간선", color: "sky", hex: "#0ea5e9", interval: 9 },
  "162번": { name: "162번", type: "간선", color: "sky", hex: "#0ea5e9", interval: 10 },
  "273번": { name: "273번", type: "간선", color: "sky", hex: "#0ea5e9", interval: 9 },
  "301번": { name: "301번", type: "간선", color: "sky", hex: "#0ea5e9", interval: 8 },
  "501번": { name: "501번", type: "간선", color: "sky", hex: "#0ea5e9", interval: 9 },
  "5714번": { name: "5714번", type: "간선", color: "sky", hex: "#0ea5e9", interval: 8 },
  "602번": { name: "602번", type: "간선", color: "sky", hex: "#0ea5e9", interval: 10 },
  "720번": { name: "720번", type: "간선", color: "sky", hex: "#0ea5e9", interval: 11 },
  "1020번": { name: "1020번", type: "간선", color: "sky", hex: "#0ea5e9", interval: 12 },

  // 광역버스 (Red)
  "M2341": { name: "M2341", type: "광역", color: "rose", hex: "#ef4444", interval: 15 },
  "M4101": { name: "M4101", type: "광역", color: "rose", hex: "#ef4444", interval: 12 },
  "M5107": { name: "M5107", type: "광역", color: "rose", hex: "#ef4444", interval: 10 },
  "M7111": { name: "M7111", type: "광역", color: "rose", hex: "#ef4444", interval: 14 },

  // 순환버스 (Yellow)
  "01번": { name: "01번", type: "순환", color: "amber", hex: "#f59e0b", interval: 12 },
  "02번": { name: "02번", type: "순환", color: "amber", hex: "#f59e0b", interval: 15 },

  // 심야버스 (Navy)
  "N13번": { name: "N13번", type: "심야", color: "indigo", hex: "#3730a3", interval: 25 },
  "N62번": { name: "N62번", type: "심야", color: "indigo", hex: "#3730a3", interval: 30 }
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
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
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
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState("checking"); // 'api' | 'local'
  const [isPlaying, setIsPlaying] = useState(false);

  const mapRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);
  const playIntervalRef = useRef(null);

  const selectedStation = stations.find(s => s.id === selectedStationId);

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

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load Leaflet script dynamically
    const script = document.createElement('script');
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    
    script.onload = () => {
      const L = window.L;
      if (!L) return;

      // Initialize map centered on Seoul (around Seokgwan for default view)
      const map = L.map('map', {
        zoomControl: true,
        attributionControl: true
      }).setView([37.6062, 127.0622], 14);

      mapRef.current = map;

      // CartoDB Dark Matter Tile Layer (Modern dark theme map)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // Render Station Markers
      renderStationMarkers();

      // Click on Map to Create Station
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        handleMapClick(lat, lng);
      });

      // Get User Location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const userCoords = [latitude, longitude];
            setUserLocation(userCoords);

            // Add User Location Marker
            const userIcon = L.divIcon({
              className: 'custom-user-icon',
              html: `
                <div class="relative flex items-center justify-center w-6 h-6">
                  <div class="absolute w-6 h-6 rounded-full bg-indigo-500 opacity-40 animate-ping"></div>
                  <div class="relative w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white shadow-md"></div>
                </div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });

            if (userMarkerRef.current) {
              userMarkerRef.current.remove();
            }
            userMarkerRef.current = L.marker(userCoords, { icon: userIcon }).addTo(map);

            // Smooth fly to user location
            map.flyTo(userCoords, 15);

            // Dynamically create a station at user's exact location
            const userStationId = `ST_USER_${Date.now()}`;
            
            // Fallback neighborhood name from local list
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
            // Default fly to Seokgwan
            map.flyTo([37.6062, 127.0622], 14);
          }
        );
      } else {
        map.flyTo([37.6062, 127.0622], 14);
      }
    };

    document.head.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      script.remove();
    };
  }, []);

  // Render Station Markers
  const renderStationMarkers = () => {
    const L = window.L;
    if (!L || !mapRef.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    stations.forEach(st => {
      const isSelected = st.id === selectedStationId;
      
      const stationIcon = L.divIcon({
        className: isSelected ? 'custom-station-selected' : 'custom-station',
        html: isSelected 
          ? `<div class="w-9 h-9 rounded-full bg-indigo-600 border-2 border-white shadow-[0_0_15px_rgba(79,70,229,0.6)] flex items-center justify-center text-white font-extrabold text-sm animate-bounce ring-4 ring-indigo-500/20">📍</div>`
          : `<div class="w-6.5 h-6.5 rounded-full bg-slate-800 border-2 border-indigo-400 shadow-md flex items-center justify-center text-white font-extrabold text-[10px] hover:scale-115 hover:border-indigo-300 transition-all duration-200">📍</div>`,
        iconSize: isSelected ? [36, 36] : [26, 26],
        iconAnchor: isSelected ? [18, 18] : [13, 13]
      });

      const marker = L.marker([st.lat, st.lng], { icon: stationIcon })
        .addTo(mapRef.current)
        .on('click', () => {
          setSelectedStationId(st.id);
          mapRef.current.flyTo([st.lat, st.lng], 16);
        });
      
      markersRef.current[st.id] = marker;
    });
  };

  // Re-render markers when selectedStationId or stations list changes
  useEffect(() => {
    renderStationMarkers();
  }, [selectedStationId, stations]);

  // Handle Map Click to Create Station
  const handleMapClick = async (lat, lng) => {
    // Find closest neighborhood for a realistic name
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
    
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 16);
    }

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

  // Move Map to User Location
  const handleMoveToUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo(userLocation, 16);
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

  // Deterministic Multi-Route Simulation Engine
  const getSimulatedBuses = () => {
    if (!selectedStation) return {};
    
    const minutesOfDay = getMinutesOfDay(targetTime);
    const isRushHour = (minutesOfDay >= 450 && minutesOfDay <= 570) || (minutesOfDay >= 1050 && minutesOfDay <= 1170); // 07:30-09:30, 17:30-19:30
    const isNightHour = (minutesOfDay >= 1380 || minutesOfDay < 240); // 23:00-04:00
    
    const results = {};
    
    selectedStation.routes.forEach(routeId => {
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
      const seedStr = `${routeId}_${selectedStation.id}`;
      for (let i = 0; i < seedStr.length; i++) {
        seed += seedStr.charCodeAt(i);
      }
      
      const offset = seed % route.interval;
      
      // Generate scheduled arrival times
      const arrivals = [];
      let currentArrival = offset;
      while (currentArrival < 1440) {
        arrivals.push(currentArrival);
        currentArrival += route.interval;
      }
      
      const activeBuses = [];
      
      arrivals.forEach((arrivalTime, index) => {
        let diff = arrivalTime - minutesOfDay;
        if (diff < -1400) diff += 1440; // wrap around day boundary
        
        if (diff >= 0 && diff <= 15) {
          let minutesLeft = diff;
          let status = "NORMAL";
          
          if (isRushHour) {
            status = "CROWDED";
            const delaySeed = (index + seed) % 3;
            minutesLeft = Math.min(15, minutesLeft + delaySeed);
          }
          
          activeBuses.push({
            id: `${routeId}_BUS_${index}`,
            minutesLeft: Math.round(minutesLeft),
            status
          });
        }
      });
      
      activeBuses.sort((a, b) => a.minutesLeft - b.minutesLeft);
      results[routeId] = activeBuses;
    });
    
    return results;
  };

  const simulatedBuses = getSimulatedBuses();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      <Head>
        <title>Bus Arrival Prediction Pro</title>
        {/* Leaflet CSS from CDN */}
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
      </Head>

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/85 backdrop-blur-xl sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
            <Navigation className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-300 via-purple-400 to-pink-300 bg-clip-text text-transparent">
              Bus Arrival Prediction Pro
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wide">서울시 버스 가상화 타임라인 및 도착 예측 시뮬레이터</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Active Status Badge */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-emerald-500/5 text-emerald-400 border border-emerald-500/15">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>예측 시뮬레이션 모드 활성화</span>
          </div>

          {/* Backend Connection Badge */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border ${
            dataSource === 'api' 
              ? 'bg-indigo-500/5 text-indigo-400 border-indigo-500/15' 
              : dataSource === 'local'
              ? 'bg-amber-500/5 text-amber-400 border-amber-500/15'
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}>
            {dataSource === 'api' ? (
              <>
                <Server className="h-3 w-3 text-indigo-400" />
                <span>FastAPI 서버 연동됨</span>
              </>
            ) : dataSource === 'local' ? (
              <>
                <Database className="h-3 w-3 text-amber-400" />
                <span>로컬 단독 모드</span>
              </>
            ) : (
              <span>연결 확인 중...</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Premium Control Sidebar (col-span-4) */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 self-start">
          
          {/* 1. Selected Station Info Card */}
          <div className="bg-slate-900/40 border border-slate-900/80 rounded-3xl p-6 backdrop-blur-xl shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/40">
              <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-indigo-400" />
                <span>선택된 정류소 정보</span>
              </h2>
              {selectedStation && (
                <span className="text-[9px] bg-indigo-500/10 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                  ARS ID {selectedStation.arsId}
                </span>
              )}
            </div>

            {selectedStation ? (
              <div className="space-y-5">
                <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900/50 border border-indigo-500/10 rounded-2xl p-4">
                  <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider block mb-1">현재 활성화된 정류소</span>
                  <h3 className="text-base font-extrabold text-slate-100 tracking-tight">{selectedStation.name}</h3>
                  <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-500 font-mono font-medium">
                    <span>위도: {selectedStation.lat.toFixed(4)}</span>
                    <span className="text-slate-700">•</span>
                    <span>경도: {selectedStation.lng.toFixed(4)}</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[11px] font-bold text-slate-400 tracking-wide uppercase block">경유 버스 노선 ({selectedStation.routes.length}개)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedStation.routes.map(rId => {
                      const r = ROUTE_DETAILS[rId] || { name: rId, type: "지선", color: "emerald", hex: "#10b981" };
                      return (
                        <div
                          key={rId}
                          className="px-3 py-2 rounded-xl bg-slate-950/50 border border-slate-900 flex items-center justify-between hover:border-slate-800 transition"
                        >
                          <span className="text-xs font-extrabold text-slate-200">{r.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold border shrink-0 ${
                            r.type === '지선' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/15' :
                            r.type === '광역' ? 'bg-rose-500/5 text-rose-400 border-rose-500/15' :
                            r.type === '간선' ? 'bg-sky-500/5 text-sky-400 border-sky-500/15' :
                            r.type === '순환' ? 'bg-amber-500/5 text-amber-400 border-amber-500/15' :
                            'bg-indigo-500/5 text-indigo-400 border-indigo-500/15'
                          }`}>
                            {r.type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-600 text-xs">
                <Info className="h-8 w-8 mx-auto mb-2 text-slate-700" />
                <p className="font-semibold text-slate-400">선택된 정류소가 없습니다.</p>
                <p className="text-slate-500 mt-1">지도에서 정류장을 클릭하세요.</p>
              </div>
            )}
          </div>

          {/* 2. Time Control Center Card */}
          <div className="bg-slate-900/40 border border-slate-900/80 rounded-3xl p-6 backdrop-blur-xl shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/40">
              <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-400" />
                <span>시간 제어 및 예측 타임라인</span>
              </h2>
              
              {/* Play/Pause Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all border shadow ${
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

            {/* Display Target Time (Cyber Clock Style) */}
            <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-900/80 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
              <div className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest mb-1.5">예측 대상 시뮬레이션 시간</div>
              <div className="text-3xl font-mono font-extrabold text-transparent bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text tracking-tight select-none">
                {formatDisplayTime(targetTime)}
              </div>
              <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-center space-x-1.5 font-medium">
                <Calendar className="h-3 w-3 text-slate-500" />
                <span>2026년 6월 15일 (월요일)</span>
              </div>
            </div>

            {/* Time Slider */}
            <div className="space-y-2 mt-5">
              <div className="flex justify-between text-[10px] text-slate-500 font-bold font-mono">
                <span>00:00</span>
                <span className="text-indigo-400/80">12:00</span>
                <span>24:00</span>
              </div>
              <div className="relative group">
                <input
                  type="range"
                  min="0"
                  max="1439"
                  value={getMinutesOfDay(targetTime)}
                  onChange={handleSliderChange}
                  className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Visual Dashboard Content (col-span-8) */}
        <section className="lg:col-span-8 flex flex-col space-y-8">
          
          {/* Leaflet Map Card */}
          <div className="bg-slate-900/40 border border-slate-900/80 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col h-[400px] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <h2 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">
                  서울 실시간 버스 정류장 지도
                </h2>
              </div>
              <button
                onClick={handleMoveToUserLocation}
                className="px-3.5 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-[11px] font-extrabold border border-indigo-500/20 hover:border-indigo-500/30 transition flex items-center space-x-1.5 shadow shadow-indigo-600/5"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>내 위치로 이동</span>
              </button>
            </div>
            
            <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-900/90 shadow-inner">
              <div id="map" className="w-full h-full z-10" />
              
              <div className="absolute bottom-4 left-4 bg-slate-950/90 border border-slate-900 px-4 py-3 rounded-2xl z-20 pointer-events-none text-[10px] text-slate-300 max-w-xs shadow-xl backdrop-blur-md space-y-1">
                <p className="font-extrabold text-indigo-400 flex items-center space-x-1 mb-1">
                  <Info className="h-3 w-3 shrink-0" />
                  <span>스마트 맵 사용 가이드</span>
                </p>
                <p>• 지도 상의 📍 마커를 클릭해 정류소를 즉시 선택하세요.</p>
                <p>• 아무 위치나 클릭하면 즉시 새로운 <span className="text-indigo-300 font-bold">가상 정류소</span>가 생성되어 운행을 예측 시뮬레이션합니다.</p>
              </div>
            </div>
          </div>

          {/* 3. Interactive Multi-Route Unified Timeline Track Card (통합 띠지 시각화) */}
          <div className="bg-slate-900/40 border border-slate-900/80 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between min-h-[420px] transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/40">
                <h2 className="text-sm font-extrabold text-slate-200 flex items-center space-x-2">
                  <span className="w-3.5 h-3.5 rounded bg-indigo-500 animate-pulse" />
                  <span>실시간 버스 통합 타임라인 전광판 (통합 띠지)</span>
                </h2>
                {selectedStation && (
                  <div className="text-xs text-indigo-300 font-bold bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full shadow">
                    📍 {selectedStation.name}
                  </div>
                )}
              </div>

              {!selectedStation ? (
                <div className="flex flex-col items-center justify-center py-24 text-center text-slate-500">
                  <Info className="h-12 w-12 mb-3 text-indigo-500/20 animate-bounce" />
                  <p className="text-sm font-extrabold text-slate-300">정류장을 선택해주세요</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed font-semibold">지도에서 정류장 마커를 선택하거나, 원하는 지도 영역을 클릭해 신규 정류소를 추가하세요.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* 통합 타임라인 자 (Unified Grid / Scale Header) */}
                  <div className="flex items-center">
                    {/* Fixed space for Route Badge on the left */}
                    <div className="w-24 shrink-0 pr-4 text-right">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">노선 목록</span>
                    </div>
                    {/* Shared timeline labels grid */}
                    <div className="flex-1 relative flex justify-between text-[10px] font-extrabold text-slate-500 px-5 select-none font-mono">
                      <span className="w-12 text-left">15분 전</span>
                      <span className="w-12 text-center -translate-x-3">12분 전</span>
                      <span className="w-12 text-center -translate-x-2">9분 전</span>
                      <span className="w-12 text-center -translate-x-1">6분 전</span>
                      <span className="w-12 text-center">3분 전</span>
                      <span className="w-12 text-right text-indigo-400">도착지</span>
                    </div>
                  </div>

                  {/* Single Unified Grid Timeline Board */}
                  <div className="relative border border-slate-900 rounded-3xl bg-slate-950/70 overflow-hidden divide-y divide-slate-900/60 shadow-inner">
                    
                    {/* Background Vertical Grid Lines - spanning from top to bottom through all lanes */}
                    <div className="absolute inset-0 pointer-events-none flex justify-between pl-24 pr-5 py-4 z-0">
                      {/* LeftPercent mapped: 15m to 0m => 5% to 95% */}
                      <div className="absolute left-[calc(24px+5%)] top-0 bottom-0 border-l border-slate-900/40 border-dashed" />
                      <div className="absolute left-[calc(24px+23%)] top-0 bottom-0 border-l border-slate-900/40 border-dashed" />
                      <div className="absolute left-[calc(24px+41%)] top-0 bottom-0 border-l border-slate-900/40 border-dashed" />
                      <div className="absolute left-[calc(24px+59%)] top-0 bottom-0 border-l border-slate-900/40 border-dashed" />
                      <div className="absolute left-[calc(24px+77%)] top-0 bottom-0 border-l border-slate-900/40 border-dashed" />
                      
                      {/* Red glowing Arrival Destination line */}
                      <div className="absolute left-[calc(24px+95%)] top-0 bottom-0 border-l-2 border-indigo-500/40" />
                    </div>

                    {/* Render lanes within this single track board */}
                    {selectedStation.routes.map(routeId => {
                      const route = ROUTE_DETAILS[routeId] || { name: routeId, type: "지선", color: "emerald", hex: "#10b981", interval: 10 };
                      const activeBusesForRoute = simulatedBuses[routeId] || [];

                      return (
                        <div key={routeId} className="flex items-center h-20 relative z-10 hover:bg-slate-900/10 transition duration-150">
                          {/* Left Column: Route Label Badge */}
                          <div className="w-24 shrink-0 pl-4 pr-2 flex flex-col justify-center border-r border-slate-900/40 h-full bg-slate-950/30">
                            <span className="text-xxs text-slate-500 font-bold mb-0.5 tracking-tighter">배차 {route.interval}분</span>
                            <span className="text-[11px] font-black px-2 py-0.5 rounded-lg text-white shadow-sm flex items-center justify-center space-x-1" style={{ backgroundColor: route.hex }}>
                              <BusIcon className="w-3 h-3 shrink-0" />
                              <span className="font-mono tracking-tighter">{route.name}</span>
                            </span>
                          </div>

                          {/* Right Column: Lane Track */}
                          <div className="flex-1 h-full relative flex items-center pl-4 pr-5">
                            {/* Bus Nodes gliding on the Track */}
                            {activeBusesForRoute.length === 0 ? (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                                <span className="text-[10px] text-slate-500 font-bold italic tracking-wide">이 시간대에 버스 운행 일정 없음</span>
                              </div>
                            ) : (
                              activeBusesForRoute.map(bus => {
                                // Maps 15min window perfectly: 15m (5%) to 0m (95%)
                                const leftPercent = ((15 - bus.minutesLeft) / 15) * 90 + 5;
                                const isCrowded = bus.status === 'CROWDED';

                                return (
                                  <div
                                    key={bus.id}
                                    className="absolute -translate-x-1/2 transition-all duration-1000 ease-in-out z-20 flex flex-col items-center"
                                    style={{ left: `${leftPercent}%` }}
                                  >
                                    {/* Bus Node Card */}
                                    <div
                                      className={`px-2.5 py-1 rounded-xl border flex flex-col items-center justify-center shadow-md hover:scale-105 transition-all duration-300 cursor-pointer ${
                                        isCrowded 
                                          ? 'bg-gradient-to-b from-rose-500 to-rose-600 text-white border-rose-400 shadow-rose-500/10' 
                                          : 'text-white shadow-black/30 hover:brightness-110'
                                      }`}
                                      style={{ 
                                        backgroundColor: isCrowded ? undefined : route.hex,
                                        borderColor: isCrowded ? undefined : `${route.hex}cc`
                                      }}
                                    >
                                      <div className="flex items-center space-x-0.5">
                                        <BusIcon className="w-2.5 h-2.5 shrink-0" />
                                        <span className="text-[9px] font-black tracking-tight font-mono">{route.name}</span>
                                      </div>
                                      <span className="text-[8px] font-extrabold opacity-95 mt-0.5 whitespace-nowrap flex items-center space-x-0.5 font-mono">
                                        <span>{bus.minutesLeft === 0 ? "도착" : `${bus.minutesLeft}분전`}</span>
                                        {isCrowded && <span className="text-[7px] bg-white text-rose-600 px-0.5 py-0.1 rounded font-black">혼잡</span>}
                                      </span>
                                    </div>
                                    
                                    {/* Point indicator dot */}
                                    <div className={`w-1.5 h-1.5 rounded-full border mt-1 shadow-sm ${
                                      isCrowded ? 'bg-rose-400 border-slate-950 animate-pulse' : 'bg-white border-slate-950'
                                    }`} />
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Legend Footer */}
            <div className="border-t border-slate-900/60 pt-4 mt-6 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-4">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>선택된 정류소의 경유 버스들이 하나의 <b>통합형 띠지 보드</b>에서 동시에 움직이며 한눈에 비교 예측이 가능합니다.</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0 text-[10px] font-bold">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span className="text-slate-400">지선 (연두)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                  <span className="text-slate-400">광역 (빨강)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0ea5e9]" />
                  <span className="text-slate-400">간선 (하늘)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                  <span className="text-slate-400">순환 (노랑)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#3730a3]" />
                  <span className="text-slate-400">심야 (남색)</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500 font-medium space-y-1">
        <p>© 2026 Interactive Bus Arrival Prediction Pro. All rights reserved.</p>
        <p className="text-slate-600 font-semibold">High-fidelity dark control board for seamless route predictions.</p>
      </footer>
    </div>
  );
}
