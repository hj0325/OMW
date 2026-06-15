import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { 
  Clock, 
  MapPin, 
  Navigation, 
  Play, 
  Pause, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Search, 
  Calendar, 
  ArrowRight, 
  TrendingUp, 
  Database, 
  Server
} from 'lucide-react';

// Pre-defined popular stations in Seoul with real coordinates
const PREDEFINED_STATIONS = [
  { id: "ST_GANGNAM", name: "강남역 정류소", lat: 37.4979, lng: 127.0276, routes: ["M2341", "01번", "N62번", "147번"] },
  { id: "ST_HONGDAE", name: "홍대입구역 정류소", lat: 37.5575, lng: 126.9244, routes: ["273번", "01번", "N62번", "65번"] },
  { id: "ST_MYEONGDONG", name: "명동역 정류소", lat: 37.5609, lng: 126.9861, routes: ["147번", "65번", "01번", "N13번"] },
  { id: "ST_SEOUL_STN", name: "서울역 버스환승센터", lat: 37.5546, lng: 126.9706, routes: ["720번", "120번", "M2341", "N13번"] },
  { id: "ST_YEOUIDO", name: "여의도역 정류소", lat: 37.5216, lng: 126.9242, routes: ["M2341", "720번", "01번", "N62번"] },
  { id: "ST_JONGNO", name: "종로3가역 정류소", lat: 37.5704, lng: 126.9922, routes: ["273번", "147번", "720번", "N13번"] },
  { id: "ST_SINCHON", name: "신촌역 정류소", lat: 37.5552, lng: 126.9369, routes: ["273번", "65번", "01번", "N62번"] },
  { id: "ST_JAMSIL", name: "잠실역 정류소", lat: 37.5133, lng: 127.1001, routes: ["M2341", "65번", "01번", "N13번"] },
  { id: "ST_DONGDAEMUN", name: "동대문역 정류소", lat: 37.5714, lng: 127.0092, routes: ["147번", "720번", "273번", "N13번"] },
  { id: "ST_CHEONGNYANGNI", name: "청량리역 환승센터", lat: 37.5802, lng: 127.0448, routes: ["147번", "273번", "120번", "720번"] },
  { id: "ST_GWANGHWAMUN", name: "광화문역 정류소", lat: 37.5716, lng: 126.9768, routes: ["720번", "147번", "01번", "N62번"] },
  { id: "ST_HYEHWA", name: "혜화역 대학로 정류소", lat: 37.5822, lng: 127.0019, routes: ["273번", "120번", "01번", "N13번"] },
  { id: "ST_HUFS", name: "한국외대 정문", lat: 37.5973, lng: 127.0578, routes: ["65번", "273번", "147번", "N13번"] },
  { id: "ST_KYUNGHEE", name: "경희대후문", lat: 37.5954, lng: 127.0524, routes: ["65번", "147번", "120번", "N13번"] },
  { id: "ST_DOLGOTI", name: "돌곶이역 2번 출구", lat: 37.6105, lng: 127.0565, routes: ["120번", "147번", "M2341", "01번", "N62번"] },
  { id: "ST_SINIMUN", name: "신이문역 정류소", lat: 37.6018, lng: 127.0615, routes: ["65번", "120번", "147번", "N62번"] },
  { id: "ST_SEOKGWAN", name: "석관동주민센터", lat: 37.6062, lng: 127.0622, routes: ["120번", "147번", "65번", "N13번"] }
];

// Route details with types and colors
const ROUTE_DETAILS = {
  "65번": { name: "65번", type: "지선", color: "emerald", hex: "#10b981", interval: 10 },
  "120번": { name: "120번", type: "지선", color: "emerald", hex: "#10b981", interval: 12 },
  "147번": { name: "147번", type: "간선", color: "sky", hex: "#0ea5e9", interval: 8 },
  "273번": { name: "273번", type: "간선", color: "sky", hex: "#0ea5e9", interval: 9 },
  "720번": { name: "720번", type: "간선", color: "sky", hex: "#0ea5e9", interval: 11 },
  "M2341": { name: "M2341", type: "광역", color: "rose", hex: "#ef4444", interval: 15 },
  "01번": { name: "01번", type: "순환", color: "amber", hex: "#f59e0b", interval: 12 },
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
  // 경기도 및 남양주/마석 주변 추가 (사용자 실제 위치 대응)
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

export default function Home() {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Selected Station & Map States
  const [stations, setStations] = useState(PREDEFINED_STATIONS);
  const [selectedStationId, setSelectedStationId] = useState("ST_HUFS"); // Default: HUFS
  const [userLocation, setUserLocation] = useState(null);
  const [targetTime, setTargetTime] = useState(new Date("2026-06-15T18:30:00Z"));
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState("checking"); // 'api' | 'local'
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Destination Finder States
  const [destStationId, setDestStationId] = useState("ST_DOLGOTI");
  const [destHour, setDestHour] = useState("18");
  const [destMinute, setDestMins] = useState("30");
  const [finderResult, setFinderResult] = useState(null);

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

      // Initialize map centered on Seoul
      const map = L.map('map', {
        zoomControl: true,
        attributionControl: true
      }).setView([37.5665, 126.9780], 12);

      mapRef.current = map;

      // CartoDB Dark Matter Tile Layer
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
                  <div class="absolute w-6 h-6 rounded-full bg-sky-500 opacity-40 animate-ping"></div>
                  <div class="relative w-3.5 h-3.5 rounded-full bg-sky-500 border-2 border-white shadow-md"></div>
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
            // Default fly to HUFS to show zoom-in effect
            map.flyTo([37.5973, 127.0578], 14);
          }
        );
      } else {
        map.flyTo([37.5973, 127.0578], 14);
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
          ? `<div class="w-8 h-8 rounded-full bg-indigo-500 border-2 border-white shadow-xl flex items-center justify-center text-white font-extrabold text-xs animate-bounce shadow-indigo-500/50 ring-4 ring-indigo-500/30">📍</div>`
          : `<div class="w-6 h-6 rounded-full bg-indigo-600 border-2 border-slate-100 shadow-lg flex items-center justify-center text-white font-extrabold text-[10px] hover:scale-110 transition-transform shadow-indigo-500/30">📍</div>`,
        iconSize: isSelected ? [32, 32] : [24, 24],
        iconAnchor: isSelected ? [16, 16] : [12, 12]
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
  const handleMapClick = (lat, lng) => {
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

  // Map search handler
  const handleMapSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    performSearch(searchQuery);
  };

  const handleQuickSearch = (landmark) => {
    setSearchQuery(landmark);
    performSearch(landmark);
  };

  const performSearch = (query) => {
    // 1. Search in predefined stations
    const matchedStation = stations.find(s => s.name.includes(query));
    if (matchedStation) {
      setSelectedStationId(matchedStation.id);
      if (mapRef.current) {
        mapRef.current.flyTo([matchedStation.lat, matchedStation.lng], 16);
      }
      return;
    }

    // 2. Search in neighborhoods
    const matchedNb = NEIGHBORHOODS.find(nb => nb.name.includes(query));
    if (matchedNb) {
      if (mapRef.current) {
        mapRef.current.flyTo([matchedNb.lat, matchedNb.lng], 15);
      }
      return;
    }

    alert(`'${query}'에 해당하는 정류장이나 지역을 찾지 못했습니다. 다른 키워드로 검색해보세요.`);
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

  // Presets
  const setPresetTime = (hour, minute) => {
    const newTime = new Date(targetTime);
    newTime.setUTCHours(hour, minute, 0, 0);
    setTargetTime(newTime);
  };

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

  // Destination Finder Logic
  const handleFindRoute = () => {
    if (!selectedStation) {
      setFinderResult({ error: "출발지 정류장을 먼저 선택해주세요." });
      return;
    }
    
    const destStation = stations.find(s => s.id === destStationId);
    if (!destStation) {
      setFinderResult({ error: "목적지 정류장을 찾을 수 없습니다." });
      return;
    }
    
    if (selectedStation.id === destStationId) {
      setFinderResult({ error: "출발지와 목적지가 같습니다." });
      return;
    }
    
    // Find common routes
    const commonRoutes = selectedStation.routes.filter(r => destStation.routes.includes(r));
    if (commonRoutes.length === 0) {
      setFinderResult({ error: "두 정류장을 동시에 경유하는 직통 노선이 없습니다." });
      return;
    }
    
    // Target arrival time in minutes of the day
    const targetArrivalMins = parseInt(destHour) * 60 + parseInt(destMinute);
    
    let bestRouteId = null;
    let bestBoardTimeMins = null;
    let bestArrivalTimeMins = null;
    
    commonRoutes.forEach(routeId => {
      const route = ROUTE_DETAILS[routeId];
      if (!route) return;
      
      // Deterministic scheduled arrivals at destination station
      let destSeed = 0;
      const destSeedStr = `${routeId}_${destStation.id}`;
      for (let i = 0; i < destSeedStr.length; i++) {
        destSeed += destSeedStr.charCodeAt(i);
      }
      const destOffset = destSeed % route.interval;
      
      let bestArrival = null;
      let minDiff = Infinity;
      
      for (let currentArrival = destOffset; currentArrival < 1440; currentArrival += route.interval) {
        const diff = targetArrivalMins - currentArrival;
        if (diff >= 0 && diff < minDiff) {
          minDiff = diff;
          bestArrival = currentArrival;
        }
      }
      
      if (bestArrival !== null) {
        // Travel time based on coordinate distance
        const latDiff = destStation.lat - selectedStation.lat;
        const lngDiff = destStation.lng - selectedStation.lng;
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
        const travelTimeMins = Math.max(3, Math.round(distance * 120)); // approx 120 mins per degree, min 3 mins
        
        const boardTimeMins = bestArrival - travelTimeMins;
        
        if (boardTimeMins >= 0) {
          if (bestArrivalTimeMins === null || bestArrival > bestArrivalTimeMins) {
            bestRouteId = routeId;
            bestBoardTimeMins = boardTimeMins;
            bestArrivalTimeMins = bestArrival;
          }
        }
      }
    });
    
    if (bestRouteId) {
      const route = ROUTE_DETAILS[bestRouteId];
      
      const boardTime = new Date(targetTime);
      boardTime.setUTCHours(Math.floor(bestBoardTimeMins / 60), bestBoardTimeMins % 60, 0, 0);
      
      const arrivalTime = new Date(targetTime);
      arrivalTime.setUTCHours(Math.floor(bestArrivalTimeMins / 60), bestArrivalTimeMins % 60, 0, 0);
      
      setFinderResult({
        bus: {
          busId: `${route.type === '지선' ? 'G' : route.type === '간선' ? 'B' : route.type === '광역' ? 'R' : route.type === '순환' ? 'Y' : 'N'}${String(bestBoardTimeMins).padStart(4, '0')}`,
          busName: route.name,
          status: (bestBoardTimeMins >= 1080 && bestBoardTimeMins < 1200) ? "CROWDED" : "NORMAL"
        },
        boardStation: selectedStation,
        destStation,
        boardTime,
        arrivalTime,
        durationMins: bestArrivalTimeMins - bestBoardTimeMins
      });
      
      // Automatically focus the timeline/time on the board time
      setTargetTime(boardTime);
      
      // Smooth fly map to show both stations
      if (mapRef.current && window.L) {
        const bounds = window.L.latLngBounds([selectedStation.lat, selectedStation.lng], [destStation.lat, destStation.lng]);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    } else {
      setFinderResult({ error: "해당 시간대에 적절한 버스 운행 일정이 없습니다." });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Head>
        <title>Interactive Bus Arrival Prediction Prototype</title>
        {/* Leaflet CSS from CDN */}
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
      </Head>

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/30 animate-pulse">
            <Navigation className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Bus Arrival Prediction Prototype
            </h1>
            <p className="text-xs text-slate-400 font-medium">서울시 버스 도착 정보 가상화 및 타임라인 시각화</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Data Source Badge */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            dataSource === 'api' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : dataSource === 'local'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {dataSource === 'api' ? (
              <>
                <Server className="h-3.5 w-3.5" />
                <span>FastAPI 백엔드 연동됨</span>
              </>
            ) : dataSource === 'local' ? (
              <>
                <Database className="h-3.5 w-3.5" />
                <span>로컬 시뮬레이션 모드</span>
              </>
            ) : (
              <span>연결 확인 중...</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Controls & Search (4 cols) */}
        <section className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* 0. Seoul Location & Station Search Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Search className="h-4 w-4 text-indigo-400" />
              <span>정류장 및 지역 검색</span>
            </h2>
            
            <form onSubmit={handleMapSearch} className="flex gap-2 mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="정류장 이름 또는 지역 (예: 강남역, 홍대, 외대)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition flex items-center justify-center"
              >
                <span>검색</span>
              </button>
            </form>

            {/* Quick Landmarks */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {["강남역", "홍대입구", "명동역", "서울역", "한국외대"].map(landmark => (
                <button
                  key={landmark}
                  onClick={() => handleQuickSearch(landmark)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xxs text-slate-300 transition"
                >
                  #{landmark}
                </button>
              ))}
            </div>
          </div>

          {/* 1. Selected Station Info Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-indigo-400" />
              <span>선택된 정류장 정보</span>
            </h2>

            {selectedStation ? (
              <div className="space-y-4">
                <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-4">
                  <span className="text-xxs text-indigo-400 font-bold uppercase tracking-wider block mb-1">현재 선택된 정류소</span>
                  <h3 className="text-lg font-extrabold text-slate-100">{selectedStation.name}</h3>
                  <span className="text-xxs text-slate-500 block mt-1">위도: {selectedStation.lat.toFixed(4)}, 경도: {selectedStation.lng.toFixed(4)}</span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 block">정차 노선 ({selectedStation.routes.length}개)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedStation.routes.map(rId => {
                      const r = ROUTE_DETAILS[rId] || { name: rId, type: "지선", color: "emerald", hex: "#10b981" };
                      return (
                        <div
                          key={rId}
                          className="px-3 py-2 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between"
                        >
                          <span className="text-xs font-bold text-slate-200">{r.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                            r.type === '지선' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            r.type === '광역' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            r.type === '간선' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                            r.type === '순환' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
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
              <div className="text-center py-8 text-slate-500 text-xs">
                <Info className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                <p>지도에서 정류장을 클릭하거나 검색하여 전광판을 소환하세요.</p>
              </div>
            )}
          </div>

          {/* 2. Time Simulation Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-400" />
                <span>시간대 설정 (예측)</span>
              </h2>
              
              {/* Play/Pause Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  isPlaying 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                    : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30'
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
                    <span>실시간 재생</span>
                  </>
                )}
              </button>
            </div>

            {/* Display Target Time */}
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 mb-4 text-center">
              <div className="text-xxs text-slate-500 font-bold uppercase tracking-widest mb-1">예측 타겟 시간</div>
              <div className="text-2xl font-mono font-bold text-indigo-300 tracking-tight">
                {formatDisplayTime(targetTime)}
              </div>
              <div className="text-xxs text-slate-400 mt-1 flex items-center justify-center space-x-1">
                <Calendar className="h-3 w-3 text-slate-500" />
                <span>2026년 6월 15일 (월요일)</span>
              </div>
            </div>

            {/* Time Slider */}
            <div className="space-y-2 mb-5">
              <div className="flex justify-between text-xxs text-slate-500 font-bold">
                <span>00:00</span>
                <span>12:00</span>
                <span>24:00</span>
              </div>
              <input
                type="range"
                min="0"
                max="1439"
                value={getMinutesOfDay(targetTime)}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
              />
            </div>

            {/* Time Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">시간대 프리셋</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPresetTime(8, 30)}
                  className="py-2 px-3 rounded-xl bg-slate-950/40 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition flex flex-col items-center"
                >
                  <span className="font-bold text-rose-400">08:30 (출근)</span>
                  <span className="text-xxs text-slate-500 mt-0.5">혼잡도 가중치 높음</span>
                </button>
                <button
                  onClick={() => setPresetTime(18, 30)}
                  className="py-2 px-3 rounded-xl bg-slate-950/40 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition flex flex-col items-center"
                >
                  <span className="font-bold text-rose-400">18:30 (퇴근)</span>
                  <span className="text-xxs text-slate-500 mt-0.5">혼잡도 가중치 높음</span>
                </button>
                <button
                  onClick={() => setPresetTime(14, 0)}
                  className="py-2 px-3 rounded-xl bg-slate-950/40 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition flex flex-col items-center"
                >
                  <span className="font-bold text-emerald-400">14:00 (낮)</span>
                  <span className="text-xxs text-slate-500 mt-0.5">원활한 배차 간격</span>
                </button>
                <button
                  onClick={() => setPresetTime(22, 30)}
                  className="py-2 px-3 rounded-xl bg-slate-950/40 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition flex flex-col items-center"
                >
                  <span className="font-bold text-sky-400">22:30 (밤)</span>
                  <span className="text-xxs text-slate-500 mt-0.5">원활한 배차 간격</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Timeline Visualization & Destination Finder (8 cols) */}
        <section className="lg:col-span-8 flex flex-col space-y-6">
          
          {/* Leaflet Map Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm shadow-xl flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Navigation className="h-4 w-4 text-indigo-400" />
                <span>서울 실시간 버스 정류장 지도</span>
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleMoveToUserLocation}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-bold border border-indigo-500/30 transition flex items-center space-x-1"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>내 위치로</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-800">
              <div id="map" className="w-full h-full z-10" />
              
              <div className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-800 px-3 py-2 rounded-lg z-20 pointer-events-none text-xxs text-slate-300 max-w-xs">
                <p className="font-bold text-indigo-400 mb-0.5">💡 지도 조작 가이드</p>
                <p>• 마커를 클릭하여 정류장 전광판을 소환하세요.</p>
                <p>• 지도 상의 아무 곳이나 클릭하면 새 정류장이 생성됩니다.</p>
              </div>
            </div>
          </div>

          {/* 3. Interactive Multi-Route Display Board Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col justify-between min-h-[450px]">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-slate-200 flex items-center space-x-2">
                  <span className="w-3.5 h-3.5 rounded bg-indigo-500 animate-pulse" />
                  <span>실시간 버스 도착 전광판 (띠지 시각화)</span>
                </h2>
                {selectedStation && (
                  <div className="text-xs text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                    📍 {selectedStation.name}
                  </div>
                )}
              </div>

              {!selectedStation ? (
                <div className="flex flex-col items-center justify-center py-24 text-center text-slate-500">
                  <Info className="h-12 w-12 mb-3 text-indigo-500/40 animate-bounce" />
                  <p className="text-base font-bold text-slate-300">정류장을 선택해주세요</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">지도에서 정류장 마커를 클릭하거나 아무 곳이나 클릭하여 전광판을 소환할 수 있습니다.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedStation.routes.map(routeId => {
                    const route = ROUTE_DETAILS[routeId] || { name: routeId, type: "지선", color: "emerald", hex: "#10b981" };
                    const activeBusesForRoute = simulatedBuses[routeId] || [];
                    
                    return (
                      <div key={routeId} className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 relative">
                        {/* Route Header Info */}
                        <div className="flex items-center justify-between mb-3 border-b border-slate-800/40 pb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-extrabold px-2.5 py-0.5 rounded-lg text-white`} style={{ backgroundColor: route.hex }}>
                              {route.name}
                            </span>
                            <span className="text-xxs text-slate-400 font-medium">배차 {route.interval}분</span>
                          </div>
                          <span className="text-xxs text-slate-500 font-mono">방향: 서울 도심 방면</span>
                        </div>

                        {/* The Horizontal Track (띠지) */}
                        <div className="h-16 relative bg-slate-900/40 border border-slate-800/50 rounded-lg overflow-hidden flex items-center px-4">
                          {/* Track Line */}
                          <div className="absolute left-4 right-4 h-1.5 bg-slate-800 rounded-full border-t border-slate-700/30" />
                          
                          {/* Arrival Marker at the Right End */}
                          <div className="absolute right-4 flex flex-col items-center justify-center z-20">
                            <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-slate-950 animate-ping absolute" />
                            <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-slate-950 z-10" />
                            <span className="text-[9px] font-extrabold text-indigo-400 mt-1">도착지</span>
                          </div>

                          {/* Left End Marker (15 mins away) */}
                          <div className="absolute left-4 flex flex-col items-center justify-center z-10 opacity-40">
                            <div className="w-2 h-2 rounded-full bg-slate-600" />
                            <span className="text-[8px] font-bold text-slate-500 mt-1">15분전</span>
                          </div>

                          {/* Bus Nodes moving on the Track */}
                          {activeBusesForRoute.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="text-xxs text-slate-600 font-medium italic">현재 운행 중인 버스 없음 (운행 종료)</span>
                            </div>
                          ) : (
                            activeBusesForRoute.map(bus => {
                              const leftPercent = ((15 - bus.minutesLeft) / 15) * 80 + 5;
                              const isCrowded = bus.status === 'CROWDED';
                              
                              return (
                                <div
                                  key={bus.id}
                                  className="absolute -translate-y-1/2 transition-all duration-1000 ease-out z-20 flex flex-col items-center"
                                  style={{ left: `${leftPercent}%`, top: '50%' }}
                                >
                                  {/* Bus Node Card */}
                                  <div
                                    className={`px-3 py-1.5 rounded-xl border flex flex-col items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer ${
                                      isCrowded 
                                        ? 'bg-rose-500/90 text-white border-rose-400 shadow-rose-500/20' 
                                        : 'text-white shadow-black/40'
                                    }`}
                                    style={{ 
                                      backgroundColor: isCrowded ? undefined : route.hex,
                                      borderColor: isCrowded ? undefined : `${route.hex}cc`
                                    }}
                                  >
                                    <span className="text-[10px] font-extrabold tracking-tight">{route.name}</span>
                                    <span className="text-[9px] font-bold opacity-90 mt-0.5">
                                      {bus.minutesLeft === 0 ? "도착" : `${bus.minutesLeft}분전`}
                                    </span>
                                  </div>
                                  
                                  {/* Little indicator dot */}
                                  <div className="w-1.5 h-1.5 rounded-full bg-white border border-slate-950 mt-1 shadow" />
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Legend Footer */}
            <div className="border-t border-slate-800/60 pt-4 mt-6 flex flex-wrap items-center justify-between text-xxs text-slate-400 gap-3">
              <div className="flex items-center space-x-2">
                <Info className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span>시간대 슬라이더를 움직이면 버스들이 도착 예정 시간에 맞춰 <b>스무스하게 이동</b>합니다.</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded bg-[#10b981]" />
                  <span>지선 (연두)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded bg-[#ef4444]" />
                  <span>광역 (빨강)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded bg-[#0ea5e9]" />
                  <span>간선 (하늘)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded bg-[#f59e0b]" />
                  <span>순환 (노란)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded bg-[#3730a3]" />
                  <span>심야 (남색)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Interactive Destination & Arrival Predictor Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
            <h2 className="text-base font-bold text-slate-200 mb-5 flex items-center space-x-2">
              <Search className="h-5 w-5 text-indigo-400" />
              <span>목적지 기반 최적 버스 및 탑승 시간 예측기</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              {/* Destination Station */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">목적지 정류장</label>
                <select
                  value={destStationId}
                  onChange={(e) => setDestStationId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {stations.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Hour */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">목적지 도착 희망 시각</label>
                <div className="flex items-center space-x-2">
                  <select
                    value={destHour}
                    onChange={(e) => setDestHour(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {Array.from({ length: 24 }).map((_, i) => {
                      const h = String(i).padStart(2, '0');
                      return <option key={h} value={h}>{h}시</option>;
                    })}
                  </select>
                  <select
                    value={destMinute}
                    onChange={(e) => setDestMins(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {Array.from({ length: 12 }).map((_, i) => {
                      const m = String(i * 5).padStart(2, '0');
                      return <option key={m} value={m}>{m}분</option>;
                    })}
                  </select>
                </div>
              </div>

              {/* Find Button */}
              <div className="flex items-end">
                <button
                  onClick={handleFindRoute}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 text-sm"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>최적 탑승 계획 예측</span>
                </button>
              </div>
            </div>

            {/* Finder Result Display */}
            {finderResult && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
                {finderResult.error ? (
                  <div className="flex items-center space-x-2 text-rose-400 text-sm">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <span>{finderResult.error}</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/60 pb-3 gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="bg-indigo-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg">추천 경로</span>
                        <span className="text-sm font-bold text-slate-300">
                          {finderResult.bus.busName} ({finderResult.bus.busId}) 버스 탑승
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-medium">
                        총 소요 시간: <b className="text-indigo-400 text-sm">{finderResult.durationMins}분</b>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-3">
                      {/* Boarding Station */}
                      <div className="md:col-span-2 bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/50 text-center">
                        <div className="text-xxs text-slate-500 font-bold uppercase mb-1">출발 (탑승 정류장)</div>
                        <div className="text-sm font-bold text-slate-200 mb-0.5">{finderResult.boardStation.name}</div>
                        <div className="text-xs font-mono font-bold text-indigo-400">
                          {formatDisplayTime(finderResult.boardTime)} 출발
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex flex-col items-center justify-center text-slate-600">
                        <ArrowRight className="h-5 w-5 hidden md:block" />
                        <span className="text-xxs font-bold md:hidden">➔</span>
                      </div>

                      {/* Destination Station */}
                      <div className="md:col-span-2 bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/50 text-center">
                        <div className="text-xxs text-slate-500 font-bold uppercase mb-1">도착 (목적지 정류장)</div>
                        <div className="text-sm font-bold text-slate-200 mb-0.5">{finderResult.destStation.name}</div>
                        <div className="text-xs font-mono font-bold text-emerald-400">
                          {formatDisplayTime(finderResult.arrivalTime)} 도착
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3.5 text-xs text-indigo-300 flex items-start space-x-2.5">
                      <Info className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-0.5">예측 계획이 타임라인에 반영되었습니다!</p>
                        <p className="text-slate-400 leading-relaxed">
                          위 전광판이 출발지인 <b>{finderResult.boardStation.name}</b> 정류장과 탑승 예정 시간인 <b>{formatDisplayTime(finderResult.boardTime)}</b>으로 자동 이동되었습니다. 추천 버스의 실시간 진행률을 확인해보세요.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 font-medium">
        <p>© 2026 Interactive Bus Arrival Prediction Prototype. All rights reserved.</p>
        <p className="mt-1 text-slate-600">Powered by FastAPI (Python) & Next.js (React)</p>
      </footer>
    </div>
  );
}
