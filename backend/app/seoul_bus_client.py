import requests
import xml.etree.ElementTree as ET
import random
from app.config import settings

class SeoulBusClient:
    BASE_URL = "http://ws.bus.go.kr/api/rest/busRouteInfo"
    POSITION_URL = "http://ws.bus.go.kr/api/rest/buspos"
    
    # Pre-configured popular Seoul routes for fallback/mocking
    POPULAR_ROUTES = {
        "147": {
            "id": "100100022",
            "name": "147번",
            "interval_mins": 8,
            "stations": [
                "월계동기점", "경희대후문", "한국외대 후문", "한국외대 정문", "외대역앞", 
                "돌곶이역", "석관동주민센터", "신이문역", "청량리역", "제기동역", 
                "신설동역", "동대문역", "종로5가", "종로3가", "을지로입구", "명동역"
            ]
        },
        "273": {
            "id": "100100049",
            "name": "273번",
            "interval_mins": 9,
            "stations": [
                "신내동기점", "중랑구청", "상봉역", "중화역", "이문동현대아파트", 
                "한국외대 정문", "경희대입구", "떡전교사거리", "청량리역", "고려대역", 
                "안암역", "보문역", "혜화역(대학로)", "종로5가", "종로1가", "신촌역"
            ]
        },
        "120": {
            "id": "100100010",
            "name": "120번",
            "interval_mins": 10,
            "stations": [
                "우이동기점", "덕성여대앞", "수유역", "미아사거리역", "월곡역", 
                "돌곶이역 2번 출구", "석계역", "신이문역", "중랑교", "청량리역"
            ]
        },
        "720": {
            "id": "100100112",
            "name": "720번",
            "interval_mins": 11,
            "stations": [
                "진관공영차고지", "구파발역", "연신내역", "불광역", "홍제역", 
                "독립문역", "서대문역", "광화문역", "종로2가", "동대문역", "청량리역"
            ]
        }
    }

    @classmethod
    def search_routes(cls, query: str):
        """
        Searches for bus routes matching the query.
        Returns a list of routes with their IDs, names, and intervals.
        """
        # 1. Try real API if API key is configured
        if settings.SEOUL_BUS_API_KEY:
            try:
                url = f"{cls.BASE_URL}/getBusRouteList"
                params = {
                    "ServiceKey": settings.SEOUL_BUS_API_KEY,
                    "strSrch": query
                }
                res = requests.get(url, params=params, timeout=5)
                if res.status_code == 200:
                    root = ET.fromstring(res.content)
                    routes_list = []
                    for item in root.findall(".//itemList"):
                        route_id = item.findtext("busRouteId")
                        route_nm = item.findtext("busRouteNm")
                        # Average interval (approximate or default)
                        interval = int(item.findtext("term", "10"))
                        routes_list.append({
                            "id": route_id,
                            "name": f"{route_nm}번",
                            "interval_mins": interval if interval > 0 else 10
                        })
                    if routes_list:
                        return routes_list
            except Exception as e:
                print(f"Seoul Bus API error in search_routes: {e}")

        # 2. Fallback to Mock Search
        results = []
        # Check popular routes first
        for key, r in cls.POPULAR_ROUTES.items():
            if query in key or query in r["name"]:
                results.append({
                    "id": r["id"],
                    "name": r["name"],
                    "interval_mins": r["interval_mins"]
                })
        
        # If no popular routes matched, dynamically generate a mock route
        if not results and query.isdigit():
            results.append({
                "id": f"MOCK_{query}",
                "name": f"{query}번",
                "interval_mins": random.randint(8, 15)
            })
            
        return results

    @classmethod
    def get_stations_for_route(cls, route_id: str, route_name: str = ""):
        """
        Fetches all stations for a given route.
        """
        # 1. Try real API if API key is configured
        if settings.SEOUL_BUS_API_KEY and not route_id.startswith("MOCK_"):
            try:
                url = f"{cls.BASE_URL}/getStationsByRouteList"
                params = {
                    "ServiceKey": settings.SEOUL_BUS_API_KEY,
                    "busRouteId": route_id
                }
                res = requests.get(url, params=params, timeout=5)
                if res.status_code == 200:
                    root = ET.fromstring(res.content)
                    stations = []
                    for item in root.findall(".//itemList"):
                        station_id = item.findtext("station")
                        station_nm = item.findtext("stationNm")
                        seq = int(item.findtext("seq", "1"))
                        stations.append({
                            "id": station_id,
                            "name": station_nm,
                            "sequence": seq
                        })
                    if stations:
                        return stations
            except Exception as e:
                print(f"Seoul Bus API error in get_stations_for_route: {e}")

        # 2. Fallback to Mock Stations
        # Check popular routes
        for key, r in cls.POPULAR_ROUTES.items():
            if r["id"] == route_id:
                return [
                    {"id": f"S_{route_id}_{i+1}", "name": name, "sequence": i+1}
                    for i, name in enumerate(r["stations"])
                ]
        
        # Dynamic generation for unknown routes
        bus_num = route_name.replace("번", "") if route_name else route_id.replace("MOCK_", "")
        mock_station_names = [
            "서울역", "시청앞", "광화문", "종로3가", "동대문", "신설동", "청량리", 
            "회기역", "외대앞", "경희대후문", "한국외대 정문", "돌곶이역", "석계역", 
            "태릉입구", "노원역", "도봉산역", "수유역", "미아사거리", "길음역", "혜화역"
        ]
        # Pick 10-15 random stations from the list
        random.seed(route_id) # Consistent stations for the same route
        count = random.randint(10, 15)
        selected_names = random.sample(mock_station_names, min(count, len(mock_station_names)))
        # Sort them to make a route
        selected_names.sort(key=lambda x: mock_station_names.index(x))
        
        return [
            {"id": f"S_{route_id}_{i+1}", "name": name, "sequence": i+1}
            for i, name in enumerate(selected_names)
        ]
