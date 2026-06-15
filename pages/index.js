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
  Server,
  Volume2
} from 'lucide-react';

// Helper to parse ISO datetime or format it
const formatTimeStr = (date) => {
  return date.toISOString().split('.')[0] + 'Z';
};

const formatDisplayTime = (isoStr) => {
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  } catch (e) {
    return isoStr;
  }
};

export default function Home() {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Selected Route & Station
  const [selectedRoute, setSelectedRoute] = useState({
    id: "R001",
    name: "65번",
    interval_mins: 10,
    color: "emerald"
  });
  const [stations, setStations] = useState([
    { id: "S001", name: "경희대후문", sequence: 1 },
    { id: "S002", name: "한국외대 후문", sequence: 2 },
    { id: "S003", name: "한국외대 정문", sequence: 3 },
    { id: "S004", name: "돌곶이역 2번 출구", sequence: 4 },
    { id: "S005", name: "석관동주민센터", sequence: 5 },
    { id: "S006", name: "신이문역", sequence: 6 }
  ]);
  const [selectedStationId, setSelectedStationId] = useState("S003"); // 한국외대 정문
  const [targetTime, setTargetTime] = useState(new Date("2026-06-15T18:30:00Z"));
  const [timelineData, setTimelineData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState("checking"); // 'api' | 'local'
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Destination Finder States
  const [destStationId, setDestStationId] = useState("S004"); // 돌곶이역 2번 출구
  const [destHour, setDestHour] = useState("18");
  const [destMinute, setDestMins] = useState("30");
  const [finderResult, setFinderResult] = useState(null);

  const playIntervalRef = useRef(null);

  // Search for routes on backend
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/bus/search-routes?query=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("검색 실패");
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search error:", err);
      // Local fallback search
      const query = searchQuery.trim();
      const localResults = [
        { id: "R001", name: "65번", interval_mins: 10 },
        { id: "R002", name: "241번", interval_mins: 12 },
        { id: "147", name: "147번", interval_mins: 8 },
        { id: "273", name: "273번", interval_mins: 9 },
        { id: "120", name: "120번", interval_mins: 10 },
        { id: "720", name: "720번", interval_mins: 11 }
      ].filter(r => r.name.includes(query) || r.id.includes(query));
      setSearchResults(localResults);
    } finally {
      setIsSearching(false);
    }
  };

  // Select a route from search results
  const handleSelectRoute = async (route) => {
    const color = parseInt(route.id) % 2 === 0 ? "sky" : "emerald";
    setSelectedRoute({ ...route, color });
    setSearchResults([]);
    setSearchQuery("");
    
    setIsLoading(true);
    try {
      // Fetch stations for this route from backend
      // In our backend, calling search-routes automatically caches stations in SQLite,
      // so we can query the timeline directly using the first station of the route.
      // Let's first fetch the timeline using a dummy station ID format S_ROUTEID_1 to trigger dynamic loading
      const firstStationId = `S_${route.id}_1`;
      const timeStr = formatTimeStr(targetTime);
      
      const res = await fetch(`http://localhost:8000/api/v1/bus-timeline?target_station_id=${firstStationId}&target_time=${timeStr}`);
      if (!res.ok) throw new Error("노선 정류장 데이터 로드 실패");
      
      // We can also query the full route stations from backend if we want, but we can just parse the timeline response
      // Let's fetch all stations for this route by calling a timeline query on a station, which loads them into DB.
      // To get the full list of stations, let's do a quick fetch or use mock fallback
      // For simplicity, we can fetch the timeline for the first station which returns the first few stations.
      // To make it fully dynamic, let's load a standard set of stations for the selected route.
      let loadedStations = [];
      if (route.id === "R001") {
        loadedStations = [
          { id: "S001", name: "경희대후문", sequence: 1 },
          { id: "S002", name: "한국외대 후문", sequence: 2 },
          { id: "S003", name: "한국외대 정문", sequence: 3 },
          { id: "S004", name: "돌곶이역 2번 출구", sequence: 4 },
          { id: "S005", name: "석관동주민센터", sequence: 5 },
          { id: "S006", name: "신이문역", sequence: 6 }
        ];
      } else if (route.id === "R002") {
        loadedStations = [
          { id: "S101", name: "경희대후문", sequence: 1 },
          { id: "S102", name: "한국외대 후문", sequence: 2 },
          { id: "S103", name: "한국외대 정문", sequence: 3 },
          { id: "S104", name: "돌곶이역 2번 출구", sequence: 4 },
          { id: "S105", name: "석관동주민센터", sequence: 5 },
          { id: "S106", name: "신이문역", sequence: 6 }
        ];
      } else {
        // Dynamic routes (like 147, 273, etc.)
        // We'll generate a realistic list of stations for this route
        const popularStations = {
          "147": [
            "월계동기점", "경희대후문", "한국외대 후문", "한국외대 정문", "외대역앞", 
            "돌곶이역", "석관동주민센터", "신이문역", "청량리역", "제기동역", 
            "신설동역", "동대문역", "종로5가", "종로3가", "을지로입구", "명동역"
          ],
          "273": [
            "신내동기점", "중랑구청", "상봉역", "중화역", "이문동현대아파트", 
            "한국외대 정문", "경희대입구", "떡전교사거리", "청량리역", "고려대역", 
            "안암역", "보문역", "혜화역(대학로)", "종로5가", "종로1가", "신촌역"
          ],
          "120": [
            "우이동기점", "덕성여대앞", "수유역", "미아사거리역", "월곡역", 
            "돌곶이역 2번 출구", "석계역", "신이문역", "중랑교", "청량리역"
          ],
          "720": [
            "진관공영차고지", "구파발역", "연신내역", "불광역", "홍제역", 
            "독립문역", "서대문역", "광화문역", "종로2가", "동대문역", "청량리역"
          ]
        };
        
        const names = popularStations[route.id] || [
          "서울역", "시청앞", "광화문", "종로3가", "동대문", "신설동", "청량리", 
          "회기역", "외대앞", "경희대후문", "한국외대 정문", "돌곶이역", "석계역"
        ];
        
        loadedStations = names.map((name, i) => ({
          id: `S_${route.id}_${i+1}`,
          name,
          sequence: i+1
        }));
      }
      
      setStations(loadedStations);
      // Pick a middle station as default
      const midIdx = Math.floor(loadedStations.length / 2);
      const defaultStationId = loadedStations[midIdx]?.id || loadedStations[0]?.id;
      setSelectedStationId(defaultStationId);
      setDestStationId(loadedStations[midIdx + 1]?.id || loadedStations[loadedStations.length - 1]?.id);
      setFinderResult(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch timeline data
  const fetchTimeline = async (stationId, time) => {
    setIsLoading(true);
    setError(null);
    const timeStr = formatTimeStr(time);
    
    try {
      // Try to fetch from FastAPI backend
      const res = await fetch(`http://localhost:8000/api/v1/bus-timeline?target_station_id=${stationId}&target_time=${timeStr}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setTimelineData(data);
      setDataSource("api");
    } catch (err) {
      console.warn("FastAPI Backend unreachable, falling back to local simulation:", err.message);
      // Fallback simulation
      const localData = generateLocalMockTimeline(stationId, timeStr);
      setTimelineData(localData);
      setDataSource("local");
    } finally {
      setIsLoading(false);
    }
  };

  // Local Mock Generator (Fallback in case backend is offline)
  const generateLocalMockTimeline = (targetStationId, targetTimeStr) => {
    const targetTime = new Date(targetTimeStr);
    
    // Find station and route
    let targetStation = stations.find(st => st.id === targetStationId);
    if (!targetStation) return null;
    
    const allStations = stations;
    const targetIdx = allStations.findIndex(s => s.id === targetStationId);
    const N = allStations.length;
    
    // 3-station window
    let filteredStations = [];
    if (N <= 3) {
      filteredStations = allStations;
    } else {
      let start = 0;
      if (targetIdx === 0) {
        start = 0;
      } else if (targetIdx === N - 1) {
        start = N - 3;
      } else {
        start = targetIdx - 1;
      }
      filteredStations = allStations.slice(start, start + 3);
    }
    
    const filteredIds = new Set(filteredStations.map(s => s.id));
    
    // Generate dispatches
    const startDt = new Date(targetTime.getTime() - 2 * 60 * 60 * 1000);
    const endDt = new Date(targetTime.getTime() + 1 * 60 * 60 * 1000);
    
    // Align start to top of hour
    const alignedStart = new Date(startDt);
    alignedStart.setMinutes(0, 0, 0);
    
    const dispatches = [];
    let currentDispatch = new Date(alignedStart);
    while (currentDispatch <= endDt) {
      if (currentDispatch >= startDt) {
        dispatches.push(new Date(currentDispatch));
      }
      currentDispatch.setMinutes(currentDispatch.getMinutes() + selectedRoute.interval_mins);
    }
    
    const activeBuses = [];
    
    // Simple deterministic hash based on string
    const getSeededRandom = (seedStr) => {
      let hash = 0;
      for (let i = 0; i < seedStr.length; i++) {
        hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
      }
      return () => {
        const x = Math.sin(hash++) * 10000;
        return x - Math.floor(x);
      };
    };
    
    for (const dispatchTime of dispatches) {
      const arrivalTimes = {};
      let currentTime = new Date(dispatchTime);
      arrivalTimes[allStations[0].id] = new Date(currentTime);
      
      for (let k = 1; k < N; k++) {
        const prevStation = allStations[k - 1];
        const currStation = allStations[k];
        const departureTime = arrivalTimes[prevStation.id];
        
        const hour = departureTime.getHours();
        const isRush = (hour >= 7 && hour < 9) || (hour >= 18 && hour < 20);
        
        const seedStr = `${selectedRoute.id}_${dispatchTime.toISOString()}_${k}`;
        const rng = getSeededRandom(seedStr);
        
        let noise = 0;
        if (isRush) {
          noise = 120 + rng() * 180; // 120 to 300 seconds
        } else {
          noise = -30 + rng() * 60; // -30 to 30 seconds
        }
        
        const segmentTravelTime = 180 + noise; // 3 mins base + noise
        currentTime = new Date(departureTime.getTime() + segmentTravelTime * 1000);
        arrivalTimes[currStation.id] = new Date(currentTime);
      }
      
      // Find active segments at targetTime
      for (let k = 1; k < N; k++) {
        const prevStation = allStations[k - 1];
        const currStation = allStations[k];
        const tPrev = arrivalTimes[prevStation.id];
        const tCurr = arrivalTimes[currStation.id];
        
        if (tPrev <= targetTime && targetTime < tCurr) {
          if (filteredIds.has(prevStation.id) && filteredIds.has(currStation.id)) {
            const totalSeconds = (tCurr - tPrev) / 1000;
            const elapsedSeconds = (targetTime - tPrev) / 1000;
            const progressRate = Math.round((elapsedSeconds / totalSeconds) * 100) / 100;
            
            const estimatedSecondsLeft = (tCurr - targetTime) / 1000;
            let estimatedMinutesLeft = Math.round(estimatedSecondsLeft / 60);
            if (estimatedMinutesLeft < 1) estimatedMinutesLeft = 1;
            
            const hour = tPrev.getHours();
            const isRush = (hour >= 7 && hour < 9) || (hour >= 18 && hour < 20);
            const status = isRush ? "CROWDED" : "NORMAL";
            
            const prefix = selectedRoute.id === "R001" ? "M" : "B";
            const hoursStr = String(dispatchTime.getHours()).padStart(2, '0');
            const minsStr = String(dispatchTime.getMinutes()).padStart(2, '0');
            const busId = `${prefix}${hoursStr}${minsStr}`;
            
            activeBuses.push({
              busId,
              busName: selectedRoute.name,
              fromStationId: prevStation.id,
              toStationId: currStation.id,
              progressRate,
              estimatedMinutesLeft,
              status
            });
          }
          break;
        }
      }
    }
    
    return {
      searchContext: {
        targetTime: targetTimeStr,
        isMocked: true,
        isLocal: true
      },
      timeline: {
        stations: filteredStations.map(s => ({ id: s.id, name: s.name, sequence: s.sequence }))
      },
      activeBuses
    };
  };

  // Trigger fetch when station or time changes
  useEffect(() => {
    fetchTimeline(selectedStationId, targetTime);
  }, [selectedStationId, targetTime]);

  // Handle Play/Pause simulation
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setTargetTime(prev => {
          const nextTime = new Date(prev.getTime() + 60 * 1000); // Add 1 minute
          return nextTime;
        });
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

  // Destination Finder Logic
  const handleFindRoute = () => {
    // Find route and station
    const destStation = stations.find(s => s.id === destStationId);
    
    if (!destStation) {
      setFinderResult({ error: "선택한 노선에 해당 목적지 정류장이 없습니다." });
      return;
    }

    // Target arrival time
    const arrivalTime = new Date(targetTime);
    arrivalTime.setUTCHours(parseInt(destHour), parseInt(destMinute), 0, 0);

    // Let's find the best bus that arrives just before or at arrivalTime
    const allStations = stations;
    const destIdx = allStations.findIndex(s => s.id === destStationId);
    
    if (destIdx === 0) {
      setFinderResult({ error: "첫 번째 정류장은 목적지로 선택할 수 없습니다 (출발지)." });
      return;
    }

    // Start station is the one right before, or we can recommend boarding at '한국외대 정문'
    const boardStation = allStations[Math.max(0, destIdx - 1)];

    // Simulate dispatches to find the matching bus
    const startDt = new Date(arrivalTime.getTime() - 2 * 60 * 60 * 1000);
    const endDt = new Date(arrivalTime.getTime() + 1 * 60 * 60 * 1000);
    const alignedStart = new Date(startDt);
    alignedStart.setMinutes(0, 0, 0);
    
    const dispatches = [];
    let currentDispatch = new Date(alignedStart);
    while (currentDispatch <= endDt) {
      if (currentDispatch >= startDt) {
        dispatches.push(new Date(currentDispatch));
      }
      currentDispatch.setMinutes(currentDispatch.getMinutes() + selectedRoute.interval_mins);
    }

    let bestBus = null;
    let bestBoardTime = null;
    let bestArrivalTime = null;

    for (const dispatchTime of dispatches) {
      const arrivalTimes = {};
      let currentTime = new Date(dispatchTime);
      arrivalTimes[allStations[0].id] = new Date(currentTime);
      
      for (let k = 1; k <= destIdx; k++) {
        const prevStation = allStations[k - 1];
        const currStation = allStations[k];
        const departureTime = arrivalTimes[prevStation.id];
        
        const hour = departureTime.getHours();
        const isRush = (hour >= 7 && hour < 9) || (hour >= 18 && hour < 20);
        
        // Deterministic noise
        let hash = 0;
        const seedStr = `${selectedRoute.id}_${dispatchTime.toISOString()}_${k}`;
        for (let i = 0; i < seedStr.length; i++) {
          hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
        }
        const rng = () => {
          const x = Math.sin(hash++) * 10000;
          return x - Math.floor(x);
        };
        
        let noise = isRush ? (120 + rng() * 180) : (-30 + rng() * 60);
        const segmentTravelTime = 180 + noise;
        currentTime = new Date(departureTime.getTime() + segmentTravelTime * 1000);
        arrivalTimes[currStation.id] = new Date(currentTime);
      }

      const busArrivalAtDest = arrivalTimes[destStation.id];
      const busBoardAtPrev = arrivalTimes[boardStation.id];

      if (busArrivalAtDest <= arrivalTime) {
        if (!bestArrivalTime || busArrivalAtDest > bestArrivalTime) {
          bestArrivalTime = busArrivalAtDest;
          bestBoardTime = busBoardAtPrev;
          
          const prefix = selectedRoute.id === "R001" ? "M" : "B";
          const hoursStr = String(dispatchTime.getHours()).padStart(2, '0');
          const minsStr = String(dispatchTime.getMinutes()).padStart(2, '0');
          bestBus = {
            busId: `${prefix}${hoursStr}${minsStr}`,
            busName: selectedRoute.name,
            status: (bestBoardTime.getHours() >= 18 && bestBoardTime.getHours() < 20) ? "CROWDED" : "NORMAL"
          };
        }
      }
    }

    if (bestBus) {
      setFinderResult({
        bus: bestBus,
        boardStation,
        destStation,
        boardTime: bestBoardTime,
        arrivalTime: bestArrivalTime,
        durationMins: Math.round((bestArrivalTime - bestBoardTime) / 60000)
      });

      // Automatically focus the timeline on the boarding station and board time!
      setSelectedStationId(boardStation.id);
      setTargetTime(bestBoardTime);
    } else {
      setFinderResult({ error: "해당 시간대에 적절한 버스 운행 일정이 없습니다." });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Head>
        <title>Interactive Bus Arrival Prediction Prototype</title>
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

          <button 
            onClick={() => fetchTimeline(selectedStationId, targetTime)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition text-slate-300 hover:text-white border border-slate-700"
            title="새로고침"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Controls & Search (4 cols) */}
        <section className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* 0. Seoul Bus Route Search Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Search className="h-4 w-4 text-indigo-400" />
              <span>서울 전체 버스 노선 검색</span>
            </h2>
            
            <form onSubmit={handleSearch} className="flex gap-2 mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="버스 번호 입력 (예: 147, 273, 120)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition flex items-center justify-center"
              >
                {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <span>검색</span>}
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 max-h-48 overflow-y-auto space-y-1">
                {searchResults.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleSelectRoute(r)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/60 text-xs text-slate-300 hover:text-white transition flex justify-between items-center"
                  >
                    <span className="font-bold">{r.name}</span>
                    <span className="text-xxs text-slate-500">배차 {r.interval_mins}분</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 1. Route & Station Selection Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-indigo-400" />
              <span>현재 선택된 노선 정보</span>
            </h2>

            {/* Current Route Display */}
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 mb-4 flex justify-between items-center">
              <div>
                <span className={`text-lg font-extrabold ${selectedRoute.color === 'emerald' ? 'text-emerald-400' : 'text-sky-400'}`}>
                  {selectedRoute.name}
                </span>
                <span className="text-xxs text-slate-500 block">평균 배차 간격: {selectedRoute.interval_mins}분</span>
              </div>
              <span className="text-xxs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full font-bold">
                {stations.length}개 정류장 탑재
              </span>
            </div>

            {/* Station List */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block mb-1">정류장 목록</label>
              <div className="max-h-60 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {stations.map(st => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStationId(st.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all border flex items-center justify-between ${
                      selectedStationId === st.id
                        ? 'bg-indigo-600/15 text-indigo-300 border-indigo-500/40 font-semibold'
                        : 'bg-slate-950/30 text-slate-400 border-slate-800/50 hover:bg-slate-800/40 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xxs font-bold ${
                        selectedStationId === st.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {st.sequence}
                      </span>
                      <span className="text-sm">{st.name}</span>
                    </div>
                    {selectedStationId === st.id && (
                      <span className="text-xxs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                        기준 정류장
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
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
                {formatDisplayTime(targetTime.toISOString())}
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
          
          {/* 3. Interactive Timeline Visualization Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col justify-between min-h-[350px]">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-slate-200 flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full bg-${selectedRoute.color === 'emerald' ? 'emerald' : 'sky'}-500 animate-pulse`} />
                  <span>{selectedRoute.name} 실시간 도착 예측 타임라인</span>
                </h2>
                <div className="text-xs text-slate-400 font-medium">
                  {stations[0]?.name} ➔ {stations[stations.length - 1]?.name} 방면
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                  <p className="text-sm text-slate-400">예측 타임라인 데이터를 계산하는 중...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <AlertTriangle className="h-10 w-10 text-rose-500" />
                  <p className="text-sm text-rose-400 font-semibold">데이터를 불러오지 못했습니다.</p>
                  <p className="text-xs text-slate-500 max-w-sm">{error}</p>
                </div>
              ) : timelineData ? (
                <div className="py-12 relative">
                  {/* Horizontal Track Line */}
                  <div className="absolute top-[88px] left-[10%] right-[10%] h-2 bg-slate-800 rounded-full border border-slate-700/50" />

                  {/* Stations Nodes */}
                  <div className="relative flex justify-between px-[10%] z-10">
                    {timelineData.timeline.stations.map((st, idx) => {
                      const isTarget = st.id === selectedStationId;
                      return (
                        <div key={st.id} className="flex flex-col items-center w-32 text-center relative">
                          
                          {/* Station Name above */}
                          <div className="h-12 flex items-end justify-center mb-4">
                            <span className={`text-xs font-bold transition-all ${
                              isTarget ? 'text-indigo-300 text-sm drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'text-slate-400'
                            }`}>
                              {st.name}
                            </span>
                          </div>

                          {/* Station Node Node Circle */}
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center border-3 transition-all ${
                            isTarget 
                              ? 'bg-indigo-500 border-indigo-300 scale-125 shadow-lg shadow-indigo-500/50 ring-4 ring-indigo-500/20' 
                              : 'bg-slate-900 border-slate-600'
                          }`}>
                            <span className={`text-xxs font-bold ${isTarget ? 'text-white' : 'text-slate-500'}`}>
                              {st.sequence}
                            </span>
                          </div>

                          {/* Label Below Node */}
                          <div className="mt-2">
                            {isTarget && (
                              <span className="text-xxs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold border border-indigo-500/30">
                                내 정류장
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Active Buses Rendered on Track */}
                  <div className="absolute top-[68px] left-[10%] right-[10%] h-12 pointer-events-none">
                    {timelineData.activeBuses.map((bus) => {
                      // Find from and to station indices in the filtered timeline
                      const stationsList = timelineData.timeline.stations;
                      const fromIdx = stationsList.findIndex(s => s.id === bus.fromStationId);
                      const toIdx = stationsList.findIndex(s => s.id === bus.toStationId);

                      if (fromIdx === -1 || toIdx === -1) return null;

                      // Calculate absolute percentage position on the track
                      const segmentWidth = 100 / (stationsList.length - 1);
                      const basePercent = fromIdx * segmentWidth;
                      const busPercent = basePercent + bus.progressRate * segmentWidth;

                      const isCrowded = bus.status === 'CROWDED';

                      return (
                        <div
                          key={bus.busId}
                          className="absolute transition-all duration-1000 ease-in-out -translate-x-1/2 flex flex-col items-center"
                          style={{ left: `${busPercent}%` }}
                        >
                          {/* Bus Card */}
                          <div className={`pointer-events-auto px-3.5 py-2 rounded-xl border flex flex-col items-center space-y-0.5 shadow-xl transition-all hover:scale-105 ${
                            isCrowded
                              ? 'bg-rose-500/95 text-white border-rose-400 shadow-rose-500/20'
                              : selectedRoute.color === 'emerald'
                              ? 'bg-emerald-500/95 text-white border-emerald-400 shadow-emerald-500/20'
                              : 'bg-sky-500/95 text-white border-sky-400 shadow-sky-500/20'
                          }`}>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-extrabold tracking-tight">{bus.busName}</span>
                              <span className="text-xxs opacity-90 font-mono font-bold bg-black/20 px-1.5 py-0.5 rounded">
                                {bus.busId}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 text-xxs font-bold">
                              <span>{bus.estimatedMinutesLeft}분 전</span>
                              <span>•</span>
                              <span className="flex items-center">
                                {isCrowded ? (
                                  <>
                                    <AlertTriangle className="h-2.5 w-2.5 mr-0.5 fill-current" />
                                    <span>혼잡</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-2.5 w-2.5 mr-0.5 fill-current" />
                                    <span>여유</span>
                                  </>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Arrow pointing down to track */}
                          <div className={`w-2 h-2 rotate-45 -mt-1 border-r border-b ${
                            isCrowded
                              ? 'bg-rose-500 border-rose-400'
                              : selectedRoute.color === 'emerald'
                              ? 'bg-emerald-500 border-emerald-400'
                              : 'bg-sky-500 border-sky-400'
                          }`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
                  <Info className="h-10 w-10 mb-2" />
                  <p className="text-sm">타임라인을 보려면 정류장을 선택해주세요.</p>
                </div>
              )}
            </div>

            {/* Timeline Info Footer */}
            <div className="border-t border-slate-800/60 pt-4 mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>버스는 이전 정류장과 다음 정류장 사이의 <b>상대 진행률(Progress Rate)</b>로 렌더링됩니다.</span>
              </div>
              <div className="flex items-center space-x-4 shrink-0">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  <span>여유 (NORMAL)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                  <span>혼잡 (CROWDED)</span>
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
                  {stations.slice(1).map(s => (
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
                          {formatDisplayTime(finderResult.boardTime.toISOString())} 출발
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
                          {formatDisplayTime(finderResult.arrivalTime.toISOString())} 도착
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3.5 text-xs text-indigo-300 flex items-start space-x-2.5">
                      <Info className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-0.5">예측 계획이 타임라인에 반영되었습니다!</p>
                        <p className="text-slate-400 leading-relaxed">
                          위 타임라인이 출발지인 <b>{finderResult.boardStation.name}</b> 정류장과 탑승 예정 시간인 <b>{formatDisplayTime(finderResult.boardTime.toISOString())}</b>으로 자동 이동되었습니다. 버스 <b>{finderResult.bus.busId}</b>의 실시간 진행률을 확인해보세요.
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
