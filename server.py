#!/usr/bin/env python3
"""
车来了 DevKit - Flask 后端服务
提供 REST API 代理 + 静态文件服务
运行: python server.py
访问: http://localhost:5000
"""
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import chelaile_api as api

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

# ========== 静态页面 ==========

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


@app.route('/docs')
def docs():
    """API 文档页面"""
    return send_from_directory('docs', 'api-reference.html')


@app.route('/docs/<path:filename>')
def docs_assets(filename):
    """文档资源文件"""
    return send_from_directory('docs', filename)


# ========== API 接口 ==========

@app.route('/api/cities')
def list_cities():
    """获取城市列表"""
    try:
        result = api.list_cities()
        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/search')
def search():
    """关键词搜索线路/站点/POI"""
    city_id = request.args.get('cityId', '018')
    keyword = request.args.get('key', '')
    try:
        result = api.search(city_id, keyword)
        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/nearby-stops')
def nearby_stops():
    """获取附近站点"""
    city_id = request.args.get('cityId', '018')
    lat = request.args.get('lat', '31.888328')
    lng = request.args.get('lng', '118.790217')
    limit = int(request.args.get('limit', '10'))
    try:
        result = api.get_nearby_stops(city_id, lat, lng, limit=limit)
        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/stop-detail')
def stop_detail():
    """获取站点详情"""
    city_id = request.args.get('cityId', '018')
    physical_st_id = request.args.get('physicalStId', '')
    kwargs = {
        'namesake_st_id': request.args.get('namesakeStId', ''),
        'first_line_id': request.args.get('firstLineId', ''),
        'lat': request.args.get('lat', ''),
        'lng': request.args.get('lng', ''),
    }
    try:
        result = api.get_stop_detail(city_id, physical_st_id, **kwargs)
        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/line-detail')
def line_detail():
    """获取线路详情（含实时车辆）"""
    city_id = request.args.get('cityId', '018')
    line_id = request.args.get('lineId', '')
    kwargs = {
        'lat': request.args.get('lat', ''),
        'lng': request.args.get('lng', ''),
    }
    try:
        result = api.get_line_detail(city_id, line_id, **kwargs)
        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/line-route')
def line_route():
    """获取线路轨迹"""
    city_id = request.args.get('cityId', '018')
    line_id = request.args.get('lineId', '')
    try:
        result = api.get_line_route(city_id, line_id)
        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/line-realtime')
def line_realtime():
    """获取线路实时车辆"""
    city_id = request.args.get('cityId', '018')
    line_id = request.args.get('lineId', '')
    target_order = request.args.get('targetOrder', '')
    station_id = request.args.get('stationId', '')
    lat = request.args.get('lat', '')
    lng = request.args.get('lng', '')
    try:
        result = api.get_line_realtime(city_id, line_id, target_order, station_id, lat, lng)
        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/timetable')
def timetable():
    """获取时刻表"""
    city_id = request.args.get('cityId', '018')
    line_id = request.args.get('lineId', '')
    line_no = request.args.get('lineNo', '')
    direction = request.args.get('direction', '0')
    try:
        result = api.get_timetable(city_id, line_id, line_no, direction)
        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/plan-transit', methods=['POST'])
def plan_transit():
    """公交+地铁换乘规划"""
    body = request.get_json() or {}
    city_id = body.get('cityId', '018')
    origin_name = body.get('originName', '')
    origin_lat = body.get('originLat', '')
    origin_lng = body.get('originLng', '')
    dest_name = body.get('destName', '')
    dest_lat = body.get('destLat', '')
    dest_lng = body.get('destLng', '')
    strategy = body.get('strategy', '0')
    try:
        result = api.plan_transit(
            city_id, origin_name, origin_lat, origin_lng,
            dest_name, dest_lat, dest_lng, strategy
        )
        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ========== 通用调试接口 ==========

@app.route('/api/debug/raw-request', methods=['POST'])
def raw_request():
    """直接调用 chelaile_api.request_encrypted 进行调试"""
    body = request.get_json() or {}
    url = body.get('url', '')
    params = body.get('params', {})
    try:
        result = api.request_encrypted(url, params)
        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/debug/sign', methods=['POST'])
def debug_sign():
    """计算 cryptoSign（调试用）"""
    body = request.get_json() or {}
    params = body.get('params', {})
    try:
        sign = api.crypto_sign(params)
        return jsonify({"success": True, "data": {"sign": sign}})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == '__main__':
    print("=" * 60)
    print("车来了 DevKit 服务启动中...")
    print("访问地址: http://localhost:5000")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=True)
