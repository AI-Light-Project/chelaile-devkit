"""
车来了小程序 API 调用工具
基于开源项目 chelaile-mcp 提取的接口实现

依赖安装: pip install requests pycryptodome --break-system-packages
用法: python chelaile_api.py
"""
import hashlib
import json
import base64
import re
import html
import requests
from urllib.parse import urlencode
from Crypto.Cipher import AES


def _decode_html_entities(obj):
    """递归解码 HTML 实体编码（如 &aring; &#x90; 等）"""
    if isinstance(obj, str):
        # 先解码标准 HTML 实体
        decoded = html.unescape(obj)
        # 移除不可打印控制字符 (除 \t \n \r 外)
        decoded = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', decoded)
        # 如果解码后包含 Latin-1 范围的高位字符（>127），尝试重新按 UTF-8 解码
        # 这是因为 API 将 UTF-8 字节编码成了 HTML 实体（如 &aring; = \xe5）
        if any(ord(c) > 127 for c in decoded):
            try:
                return decoded.encode('latin-1').decode('utf-8')
            except (UnicodeDecodeError, UnicodeEncodeError):
                return decoded
        return decoded
    elif isinstance(obj, dict):
        return {k: _decode_html_entities(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_decode_html_entities(v) for v in obj]
    return obj

# ===== 常量定义 =====
BASE_DOMAIN = "https://web.chelaile.net.cn"
BASE_URL = f"{BASE_DOMAIN}/api"
SIGN_SALT = "qwihrnbtmj"
AES_KEY = b"FF32AE65FBFD19414EAAFF6291A54B42"

DEFAULT_PARAMS = {
    "s": "h5",
    "wxs": "wx_app",
    "sign": "1",
    "h5RealData": "1",
    "v": "3.11.28",
    "src": "weixinapp_cx",
    "ctm_mp": "mp_wx",
    "vc": "2",
    "favoriteGray": "1",
    "gpstype": "wgs",
    "geo_type": "wgs",
    "scene": "1256",
}

REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 "
        "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI "
        "MiniProgramEnv/Windows WindowsWechat/WMPF "
        "WindowsWechat(0x63090a13) XWEB/18055"
    ),
    "Content-Type": "text",
    "Referer": "https://servicewechat.com/wx71d589ea01ce3321/814/page-frame.html",
    "Accept": "*/*",
    "Accept-Language": "zh-CN,zh;q=0.9",
}


def crypto_sign(params: dict) -> str:
    """生成 cryptoSign 签名 (MD5)"""
    str_to_sign = '&'.join(f'"{k}"="{v}"' for k, v in params.items()) + SIGN_SALT
    return hashlib.md5(str_to_sign.encode()).hexdigest()


def decrypt_result(ciphertext: str) -> dict:
    """AES-256-ECB 解密"""
    cipher = AES.new(AES_KEY, AES.MODE_ECB)
    decrypted = cipher.decrypt(base64.b64decode(ciphertext))
    pad_len = decrypted[-1]
    decrypted = decrypted[:-pad_len]
    return json.loads(decrypted.decode('utf-8'))


def parse_encrypted_response(raw_text: str) -> dict:
    """解析加密响应"""
    json_start = raw_text.index('{')
    depth = 0
    json_end = json_start
    for i in range(json_start, len(raw_text)):
        if raw_text[i] == '{':
            depth += 1
        elif raw_text[i] == '}':
            depth -= 1
        if depth == 0:
            json_end = i + 1
            break
    envelope = json.loads(raw_text[json_start:json_end])
    data = envelope.get("jsonr", {}).get("data", {})
    if "encryptResult" in data:
        return _decode_html_entities(decrypt_result(data["encryptResult"]))
    return _decode_html_entities(data)


def request_encrypted(url: str, params: dict) -> dict:
    """发送加密接口请求"""
    params_with_sign = {**params, "cryptoSign": crypto_sign(params)}
    full_url = f"{url}?{urlencode(params_with_sign)}"
    resp = requests.get(full_url, headers=REQUEST_HEADERS, timeout=15)
    return parse_encrypted_response(resp.text)


def request_signed(url: str, params: dict) -> dict:
    """发送签名接口请求（响应为普通 JSON）"""
    params_with_sign = {**params, "cryptoSign": crypto_sign(params)}
    full_url = f"{url}?{urlencode(params_with_sign)}"
    resp = requests.get(full_url, headers=REQUEST_HEADERS, timeout=15)
    return json.loads(resp.text)


def request_plain(url: str, params: dict) -> dict:
    """发送明文接口请求"""
    full_url = f"{url}?{urlencode(params)}"
    resp = requests.get(full_url, headers=REQUEST_HEADERS, timeout=15)
    return json.loads(resp.text).get("data", {})


# ===== 高级 API 封装 =====

def list_cities():
    """获取城市列表"""
    return request_plain(f"{BASE_DOMAIN}/wwd/ncitylist", {**DEFAULT_PARAMS})


def search(city_id: str, keyword: str):
    """关键词搜索线路/站点/POI"""
    return request_encrypted(
        f"{BASE_URL}/bus/query!nSearch.action",
        {**DEFAULT_PARAMS, "cityId": city_id, "localCityId": city_id,
         "key": keyword, "supportPhyStn": "true"}
    )


def get_nearby_stops(city_id: str, lat: str, lng: str, limit: int = 5):
    """获取附近站点"""
    result = request_encrypted(
        f"{BASE_URL}/bus/stop!encryptedHomePage.action",
        {**DEFAULT_PARAMS, "cityId": city_id, "localCityId": "undefined",
         "lat": lat, "lng": lng, "geo_lat": lat, "geo_lng": lng,
         "type": "5", "permission": "0"}
    )
    stops = result.get("nearSts", [])
    return stops[:limit]


def get_stop_detail(city_id: str, physical_st_id: str, **kwargs):
    """获取站点详情"""
    return request_encrypted(
        f"{BASE_URL}/bus/stop!encryptedPhyStnDetail.action",
        {**DEFAULT_PARAMS, "cityId": city_id, "localCityId": city_id,
         "physicalStId": physical_st_id,
         "namesakeStId": kwargs.get("namesake_st_id", ""),
         "firstLineId": kwargs.get("first_line_id", ""),
         "stationId": "",
         "lat": kwargs.get("lat", ""), "lng": kwargs.get("lng", ""),
         "geo_lat": kwargs.get("lat", ""), "geo_lng": kwargs.get("lng", ""),
         "permission": "0"}
    )


def get_line_detail(city_id: str, line_id: str, **kwargs):
    """获取线路详情"""
    lat = kwargs.get("lat", "")
    lng = kwargs.get("lng", "")
    return request_encrypted(
        f"{BASE_URL}/bus/line!encryptedLineDetail.action",
        {**DEFAULT_PARAMS, "cityId": city_id, "localCityId": city_id,
         "lineId": line_id,
         "lat": lat, "lng": lng, "geo_lat": lat, "geo_lng": lng}
    )


def get_line_route(city_id: str, line_id: str):
    """获取线路轨迹"""
    return request_encrypted(
        f"{BASE_URL}/bus/line!lineRoute.action",
        {**DEFAULT_PARAMS, "cityId": city_id, "localCityId": city_id,
         "lineId": line_id}
    )


def get_line_realtime(city_id: str, line_id: str, target_order: str,
                      station_id: str, lat: str, lng: str):
    """获取线路实时车辆"""
    return request_encrypted(
        f"{BASE_URL}/bus/line!encryptedBusDetail.action",
        {**DEFAULT_PARAMS, "cityId": city_id, "localCityId": city_id,
         "lineId": line_id, "targetOrder": target_order,
         "stationId": station_id,
         "lat": lat, "lng": lng, "geo_lat": lat, "geo_lng": lng}
    )


def get_timetable(city_id: str, line_id: str, line_no: str, direction: str):
    """获取时刻表"""
    return request_encrypted(
        f"{BASE_URL}/bus/line!preStartTimetableNew.action",
        {**DEFAULT_PARAMS, "cityId": city_id, "lineId": line_id,
         "lineNo": line_no, "direction": direction}
    )


def plan_transit(city_id: str, origin_name: str, origin_lat: str, origin_lng: str,
                 dest_name: str, dest_lat: str, dest_lng: str, strategy: str = "0"):
    """公交+地铁换乘规划 (GCJ-02 坐标)"""
    import time
    return request_encrypted(
        f"{BASE_URL}/transfer/transit!integrate.action",
        {**DEFAULT_PARAMS, "cityId": city_id, "localCityId": city_id,
         "origin_name": origin_name, "origin_lat": origin_lat, "origin_lng": origin_lng,
         "dest_name": dest_name, "dest_lat": dest_lat, "dest_lng": dest_lng,
         "gpstype": "gcj", "geo_type": "gcj", "strategy": strategy,
         "isSelectTime": "0", "departure_time": str(int(time.time() * 1000))}
    )


if __name__ == "__main__":
    print("=" * 60)
    print("车来了 API 测试")
    print("=" * 60)

    # 1. 获取城市列表
    print("\n[1] 获取城市列表...")
    cities = list_cities()
    city_list = cities.get("cityList", [])
    print(f"  支持城市数: {len(city_list)}")
    for c in city_list[:5]:
        print(f"  {c['cityName']} (ID: {c['cityId']})")

    # 2. 搜索线路
    print("\n[2] 搜索线路 '71' (上海)...")
    result = search("034", "71")
    lines = result.get("result", {}).get("lines", [])
    print(f"  找到线路数: {len(lines)}")
    for line in lines[:3]:
        print(f"  {line.get('name')} -> {line.get('endSn')}")

    # 3. 获取附近站点
    print("\n[3] 获取附近站点 (上海人民广场附近)...")
    stops = get_nearby_stops("034", "31.230416", "121.473701")
    print(f"  附近站点数: {len(stops)}")
    for stop in stops[:3]:
        print(f"  {stop.get('sn')} ({stop.get('distance')}m)")
