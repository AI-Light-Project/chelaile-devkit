/**
 * 车来了 DevKit - 前端 API 客户端
 * 调用后端 Flask 代理接口
 */
const ChelaileAPI = (function() {
  const BASE = ''; // 同域部署，直接用相对路径

  async function request(path, options = {}) {
    try {
      const resp = await fetch(BASE + path, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options
      });
      const data = await resp.json();
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  return {
    // 获取城市列表
    listCities: () => request('/api/cities'),

    // 搜索
    search: (cityId, key) =>
      request(`/api/search?cityId=${encodeURIComponent(cityId)}&key=${encodeURIComponent(key)}`),

    // 附近站点
    nearbyStops: (cityId, lat, lng, limit = 10) =>
      request(`/api/nearby-stops?cityId=${encodeURIComponent(cityId)}&lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&limit=${limit}`),

    // 站点详情
    stopDetail: (cityId, physicalStId, params = {}) => {
      const qs = new URLSearchParams({ cityId, physicalStId, ...params }).toString();
      return request(`/api/stop-detail?${qs}`);
    },

    // 线路详情（含实时车辆）
    lineDetail: (cityId, lineId, params = {}) => {
      const qs = new URLSearchParams({ cityId, lineId, ...params }).toString();
      return request(`/api/line-detail?${qs}`);
    },

    // 线路轨迹
    lineRoute: (cityId, lineId) =>
      request(`/api/line-route?cityId=${encodeURIComponent(cityId)}&lineId=${encodeURIComponent(lineId)}`),

    // 线路实时车辆
    lineRealtime: (cityId, lineId, targetOrder, stationId, lat, lng) =>
      request(`/api/line-realtime?cityId=${encodeURIComponent(cityId)}&lineId=${encodeURIComponent(lineId)}&targetOrder=${encodeURIComponent(targetOrder)}&stationId=${encodeURIComponent(stationId)}&lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`),

    // 时刻表
    timetable: (cityId, lineId, lineNo, direction = '0') =>
      request(`/api/timetable?cityId=${encodeURIComponent(cityId)}&lineId=${encodeURIComponent(lineId)}&lineNo=${encodeURIComponent(lineNo)}&direction=${encodeURIComponent(direction)}`),

    // 换乘规划
    planTransit: (body) =>
      request('/api/plan-transit', { method: 'POST', body: JSON.stringify(body) }),

    // 调试：原始请求
    debugRawRequest: (url, params) =>
      request('/api/debug/raw-request', { method: 'POST', body: JSON.stringify({ url, params }) }),

    // 调试：计算签名
    debugSign: (params) =>
      request('/api/debug/sign', { method: 'POST', body: JSON.stringify({ params }) }),

    // 健康检查
    healthCheck: () => request('/api/cities'),
  };
})();
