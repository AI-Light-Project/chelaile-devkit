/**
 * 车来了 DevKit - 开发者中心模块
 * API 文档 + 在线调试
 */
const DevCenter = (function() {

  // ========== API 定义数据 ==========
  const APIS = [
    {
      id: 'list_cities',
      name: '获取城市列表',
      method: 'GET',
      endpoint: '/api/cities',
      backendPath: 'list_cities()',
      description: '获取车来了支持的所有城市列表，包含城市 ID 和名称。',
      params: [],
      sampleRequest: 'GET /api/cities',
      sampleResponse: JSON.stringify({
        success: true,
        data: {
          cityList: [
            { cityId: "018", cityName: "南京", cityPinyin: "nanjing" },
            { cityId: "034", cityName: "上海", cityPinyin: "shanghai" },
            { cityId: "020", cityName: "广州", cityPinyin: "guangzhou" }
          ],
          hotCityList: [
            { cityId: "034", cityName: "上海" },
            { cityId: "018", cityName: "南京" }
          ]
        }
      }, null, 2)
    },
    {
      id: 'search',
      name: '关键词搜索',
      method: 'GET',
      endpoint: '/api/search',
      backendPath: 'search(cityId, key)',
      description: '根据关键词搜索线路、站点和 POI，支持模糊匹配。',
      params: [
        { name: 'cityId', type: 'string', required: true, default: '018', desc: '城市 ID' },
        { name: 'key', type: 'string', required: true, default: '吉印大道', desc: '搜索关键词' }
      ],
      sampleRequest: 'GET /api/search?cityId=018&key=吉印大道',
      sampleResponse: JSON.stringify({
        success: true,
        data: {
          highlightKey: "吉印大道",
          result: {
            gpstype: "gcj",
            lineCount: 0,
            lines: [],
            stationCount: 0,
            stations: [],
            poiCount: 8,
            pois: [
              {
                sn: "吉印大道-地铁站-南京市",
                sn1: "吉印大道-地铁站",
                sn1Address: "南京市江宁区",
                lat: 31.885807,
                lng: 118.795159,
                sn1Tag: "南京市",
                sn1Type: 0
              },
              {
                sn: "吉印大道-道路",
                sn1: "吉印大道",
                sn1Address: "江宁区",
                lat: 31.892694,
                lng: 118.806174,
                sn1Tag: "道路",
                sn1Type: 0
              }
            ]
          }
        }
      }, null, 2)
    },
    {
      id: 'nearby_stops',
      name: '附近站点',
      method: 'GET',
      endpoint: '/api/nearby-stops',
      backendPath: 'get_nearby_stops(cityId, lat, lng, limit)',
      description: '根据 GPS 坐标获取附近的公交站点和地铁站，包含实时到站信息。',
      params: [
        { name: 'cityId', type: 'string', required: true, default: '018', desc: '城市 ID' },
        { name: 'lat', type: 'string', required: true, default: '31.888328', desc: '纬度 (WGS-84)' },
        { name: 'lng', type: 'string', required: true, default: '118.790217', desc: '经度 (WGS-84)' },
        { name: 'limit', type: 'number', required: false, default: '10', desc: '返回数量上限' }
      ],
      sampleRequest: 'GET /api/nearby-stops?cityId=018&lat=31.888328&lng=118.790217&limit=5',
      sampleResponse: JSON.stringify({
        success: true,
        data: [
          {
            sn: "吉印大道",
            sId: "12243",
            distance: 0,
            isSubway: 1,
            subwayV2Lines: [
              { line: { lineName: "地铁5号线", shortName: "5号线" }, sublines: [{ destName: "方家营", firstTime: "06:00", lastTime: "23:00" }] }
            ]
          },
          {
            sn: "吉印大道北",
            sId: "025-4737",
            distance: 110,
            lines: [
              { line: { name: "711", endSn: "安德门", direction: 0, firstTime: "06:00", lastTime: "21:10" }, stnStates: [] }
            ]
          }
        ]
      }, null, 2)
    },
    {
      id: 'stop_detail',
      name: '站点详情',
      method: 'GET',
      endpoint: '/api/stop-detail',
      backendPath: 'get_stop_detail(cityId, physicalStId, ...)',
      description: '获取指定物理站点的详细信息，包括所有经停线路和实时车辆。',
      params: [
        { name: 'cityId', type: 'string', required: true, default: '018', desc: '城市 ID' },
        { name: 'physicalStId', type: 'string', required: true, default: '938f3d09890a43b9b6be31dcfc532601', desc: '物理站点 ID' },
        { name: 'namesakeStId', type: 'string', required: false, default: '', desc: '同名站点 ID' },
        { name: 'firstLineId', type: 'string', required: false, default: '', desc: '首条线路 ID' },
        { name: 'lat', type: 'string', required: false, default: '31.888328', desc: '当前纬度' },
        { name: 'lng', type: 'string', required: false, default: '118.790217', desc: '当前经度' }
      ],
      sampleRequest: 'GET /api/stop-detail?cityId=018&physicalStId=938f3d09890a43b9b6be31dcfc532601&lat=31.888328&lng=118.790217',
      sampleResponse: JSON.stringify({
        success: true,
        data: {
          station: { sn: "吉印大道", sId: "025-5237" },
          lines: [
            { line: { name: "874", lineId: "002537645730", endSn: "滨江客运站" }, buses: [{ busId: "苏A02872F", travelTime: 199 }] }
          ]
        }
      }, null, 2)
    },
    {
      id: 'line_detail',
      name: '线路详情',
      method: 'GET',
      endpoint: '/api/line-detail',
      backendPath: 'get_line_detail(cityId, lineId, ...)',
      description: '获取指定线路的详细信息，包括站点列表和所有实时运营车辆。',
      params: [
        { name: 'cityId', type: 'string', required: true, default: '018', desc: '城市 ID' },
        { name: 'lineId', type: 'string', required: true, default: '002537645730', desc: '线路 ID' },
        { name: 'lat', type: 'string', required: false, default: '31.888328', desc: '当前纬度' },
        { name: 'lng', type: 'string', required: false, default: '118.790217', desc: '当前经度' }
      ],
      sampleRequest: 'GET /api/line-detail?cityId=018&lineId=002537645730&lat=31.888328&lng=118.790217',
      sampleResponse: JSON.stringify({
        success: true,
        data: {
          line: { name: "874", startSn: "同仁客运站", endSn: "滨江客运站", firstTime: "06:15", lastTime: "18:00", stationsNum: 51 },
          stations: [
            { order: 1, sn: "同仁客运站", lat: 31.90096, lng: 118.82927 },
            { order: 2, sn: "东大北门", lat: 31.90024, lng: 118.82737 }
          ],
          buses: [
            { busId: "苏A02872F", lat: 31.8954, lng: 118.8065, speed: 2.8, capacity: 0, order: 5, travels: [{ order: 7, travelTime: 199, recommTip: "13:05" }] }
          ]
        }
      }, null, 2)
    },
    {
      id: 'line_route',
      name: '线路轨迹',
      method: 'GET',
      endpoint: '/api/line-route',
      backendPath: 'get_line_route(cityId, lineId)',
      description: '获取指定线路的 GPS 轨迹坐标点串，用于地图上绘制线路走向。',
      params: [
        { name: 'cityId', type: 'string', required: true, default: '018', desc: '城市 ID' },
        { name: 'lineId', type: 'string', required: true, default: '002537645730', desc: '线路 ID' }
      ],
      sampleRequest: 'GET /api/line-route?cityId=018&lineId=002537645730',
      sampleResponse: JSON.stringify({
        success: true,
        data: {
          route: {
            points: [
              { lat: 31.90096, lng: 118.82927 },
              { lat: 31.90024, lng: 118.82737 }
            ],
            distance: 32500
          }
        }
      }, null, 2)
    },
    {
      id: 'line_realtime',
      name: '实时车辆',
      method: 'GET',
      endpoint: '/api/line-realtime',
      backendPath: 'get_line_realtime(cityId, lineId, targetOrder, stationId, lat, lng)',
      description: '获取指定线路、目标站点的实时车辆到站预测。',
      params: [
        { name: 'cityId', type: 'string', required: true, default: '018', desc: '城市 ID' },
        { name: 'lineId', type: 'string', required: true, default: '002537645730', desc: '线路 ID' },
        { name: 'targetOrder', type: 'string', required: true, default: '7', desc: '目标站点序号' },
        { name: 'stationId', type: 'string', required: true, default: '025-5237', desc: '目标站点 ID' },
        { name: 'lat', type: 'string', required: true, default: '31.888328', desc: '当前纬度' },
        { name: 'lng', type: 'string', required: true, default: '118.790217', desc: '当前经度' }
      ],
      sampleRequest: 'GET /api/line-realtime?cityId=018&lineId=002537645730&targetOrder=7&stationId=025-5237&lat=31.888328&lng=118.790217',
      sampleResponse: JSON.stringify({
        success: true,
        data: {
          buses: [
            { busId: "苏A02872F", order: 5, travelTime: 199, capacity: 0, distanceToNextStn: 272 }
          ]
        }
      }, null, 2)
    },
    {
      id: 'timetable',
      name: '时刻表',
      method: 'GET',
      endpoint: '/api/timetable',
      backendPath: 'get_timetable(cityId, lineId, lineNo, direction)',
      description: '获取指定线路的发车时刻表，包含首末班时间和发车间隔。',
      params: [
        { name: 'cityId', type: 'string', required: true, default: '018', desc: '城市 ID' },
        { name: 'lineId', type: 'string', required: true, default: '002537645730', desc: '线路 ID' },
        { name: 'lineNo', type: 'string', required: true, default: '874', desc: '线路编号' },
        { name: 'direction', type: 'string', required: false, default: '0', desc: '方向 (0/1)' }
      ],
      sampleRequest: 'GET /api/timetable?cityId=018&lineId=002537645730&lineNo=874&direction=0',
      sampleResponse: JSON.stringify({
        success: true,
        data: {
          firstTime: "06:15",
          lastTime: "18:00",
          interval: "15-20分钟",
          timetable: [
            { time: "06:15", type: "首班" },
            { time: "07:00", type: "高峰" }
          ]
        }
      }, null, 2)
    },
    {
      id: 'plan_transit',
      name: '换乘规划',
      method: 'POST',
      endpoint: '/api/plan-transit',
      backendPath: 'plan_transit(cityId, origin_name, origin_lat, origin_lng, dest_name, dest_lat, dest_lng, strategy)',
      description: '公交+地铁换乘规划，支持多种出行策略，返回多条换乘方案。',
      params: [
        { name: 'cityId', type: 'string', required: true, default: '018', desc: '城市 ID' },
        { name: 'originName', type: 'string', required: true, default: '吉印大道', desc: '起点名称' },
        { name: 'originLat', type: 'string', required: true, default: '31.888328', desc: '起点纬度 (GCJ-02)' },
        { name: 'originLng', type: 'string', required: true, default: '118.790217', desc: '起点经度 (GCJ-02)' },
        { name: 'destName', type: 'string', required: true, default: '南京南站', desc: '终点名称' },
        { name: 'destLat', type: 'string', required: true, default: '31.9648', desc: '终点纬度 (GCJ-02)' },
        { name: 'destLng', type: 'string', required: true, default: '118.8035', desc: '终点经度 (GCJ-02)' },
        { name: 'strategy', type: 'string', required: false, default: '0', desc: '策略 (0=少换乘/1=少步行/2=时间短)' }
      ],
      sampleRequest: 'POST /api/plan-transit\nContent-Type: application/json\n\n{\n  "cityId": "018",\n  "originName": "吉印大道",\n  "originLat": "31.888328",\n  "originLng": "118.790217",\n  "destName": "南京南站",\n  "destLat": "31.9648",\n  "destLng": "118.8035",\n  "strategy": "0"\n}',
      sampleResponse: JSON.stringify({
        success: true,
        data: {
          routes: [
            {
              duration: 1800,
              distance: 12500,
              segments: [
                { type: "walk", distance: 300, instruction: "步行至吉印大道地铁站" },
                { type: "subway", line: "S1号线", from: "吉印大道", to: "南京南站", stops: 3, duration: 900 }
              ]
            }
          ]
        }
      }, null, 2)
    }
  ];

  let currentApi = null;

  // ========== 渲染 API 列表 ==========
  function renderApiList(filter = '') {
    const list = document.getElementById('apiList');
    const filtered = APIS.filter(a =>
      a.name.toLowerCase().includes(filter.toLowerCase()) ||
      a.endpoint.toLowerCase().includes(filter.toLowerCase())
    );
    document.getElementById('apiCount').textContent = filtered.length + ' 个';
    list.innerHTML = filtered.map(api => `
      <li class="api-item ${currentApi?.id === api.id ? 'active' : ''}" data-id="${api.id}">
        <div class="api-name">${api.name}</div>
        <span class="api-method ${api.method.toLowerCase()}">${api.method}</span>
        <div class="api-desc">${api.endpoint}</div>
      </li>
    `).join('');

    // 绑定点击事件
    list.querySelectorAll('.api-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        selectApi(id);
      });
    });
  }

  // ========== 选中 API ==========
  function selectApi(id) {
    const api = APIS.find(a => a.id === id);
    if (!api) return;
    currentApi = api;
    renderApiList(document.getElementById('apiSearchInput').value);
    renderApiDetail(api);
    renderDebugPanel(api);
  }

  // ========== 渲染 API 详情 ==========
  function renderApiDetail(api) {
    const detail = document.getElementById('apiDetail');
    const paramsRows = api.params.length
      ? api.params.map(p => `
          <tr>
            <td><span class="param-name">${p.name}</span>${p.required ? '<span class="param-required">必填</span>' : '<span class="param-optional">可选</span>'}</td>
            <td>${p.type}</td>
            <td>${p.default || '-'}</td>
            <td>${p.desc}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="4" style="color:var(--muted);text-align:center;padding:16px">无参数</td></tr>';

    detail.innerHTML = `
      <h2>
        <span class="api-method ${api.method.toLowerCase()}">${api.method}</span>
        ${api.name}
      </h2>
      <div class="api-url">${api.endpoint}</div>
      <p class="api-description">${api.description}</p>

      <div class="detail-section">
        <h3>请求参数</h3>
        <table class="param-table">
          <thead>
            <tr><th>参数名</th><th>类型</th><th>默认值</th><th>说明</th></tr>
          </thead>
          <tbody>${paramsRows}</tbody>
        </table>
      </div>

      <div class="detail-section">
        <h3>请求示例</h3>
        <pre class="code-block">${escapeHtml(api.sampleRequest)}</pre>
      </div>

      <div class="detail-section">
        <h3>响应示例</h3>
        <pre class="code-block">${escapeHtml(api.sampleResponse)}</pre>
      </div>

      <div class="detail-section">
        <h3>后端调用</h3>
        <pre class="code-block">${escapeHtml(api.backendPath)}</pre>
      </div>
    `;
  }

  // ========== 渲染调试面板 ==========
  function renderDebugPanel(api) {
    const panel = document.getElementById('debugPanel');
    const paramsDiv = document.getElementById('debugParams');
    panel.style.display = 'block';

    paramsDiv.innerHTML = api.params.map(p => `
      <div class="debug-param">
        <label>${p.name}${p.required ? '<span class="param-req">*</span>' : ''} <span style="color:var(--muted-2);font-weight:400">(${p.type})</span></label>
        <input type="text" data-param="${p.name}" value="${p.default || ''}" placeholder="${p.desc}">
      </div>
    `).join('');

    // 绑定发送按钮
    const btn = document.getElementById('debugRunBtn');
    btn.onclick = () => runDebugRequest(api);
  }

  // ========== 执行调试请求 ==========
  async function runDebugRequest(api) {
    const paramsDiv = document.getElementById('debugParams');
    const inputs = paramsDiv.querySelectorAll('input[data-param]');
    const params = {};
    inputs.forEach(inp => {
      const key = inp.getAttribute('data-param');
      const val = inp.value.trim();
      if (val !== '') params[key] = val;
    });

    const respStatus = document.getElementById('respStatus');
    const respContent = document.getElementById('respContent');
    respStatus.textContent = '请求中...';
    respStatus.className = 'resp-status';
    respContent.textContent = '// 正在请求...';

    let result;
    try {
      switch (api.id) {
        case 'list_cities':
          result = await ChelaileAPI.listCities();
          break;
        case 'search':
          result = await ChelaileAPI.search(params.cityId || '018', params.key || '');
          break;
        case 'nearby_stops':
          result = await ChelaileAPI.nearbyStops(
            params.cityId || '018',
            params.lat || '31.888328',
            params.lng || '118.790217',
            parseInt(params.limit) || 10
          );
          break;
        case 'stop_detail':
          result = await ChelaileAPI.stopDetail(
            params.cityId || '018',
            params.physicalStId || '',
            { namesakeStId: params.namesakeStId || '', firstLineId: params.firstLineId || '',
              lat: params.lat || '', lng: params.lng || '' }
          );
          break;
        case 'line_detail':
          result = await ChelaileAPI.lineDetail(
            params.cityId || '018',
            params.lineId || '',
            { lat: params.lat || '', lng: params.lng || '' }
          );
          break;
        case 'line_route':
          result = await ChelaileAPI.lineRoute(params.cityId || '018', params.lineId || '');
          break;
        case 'line_realtime':
          result = await ChelaileAPI.lineRealtime(
            params.cityId || '018',
            params.lineId || '',
            params.targetOrder || '',
            params.stationId || '',
            params.lat || '',
            params.lng || ''
          );
          break;
        case 'timetable':
          result = await ChelaileAPI.timetable(
            params.cityId || '018',
            params.lineId || '',
            params.lineNo || '',
            params.direction || '0'
          );
          break;
        case 'plan_transit':
          result = await ChelaileAPI.planTransit({
            cityId: params.cityId || '018',
            originName: params.originName || '',
            originLat: params.originLat || '',
            originLng: params.originLng || '',
            destName: params.destName || '',
            destLat: params.destLat || '',
            destLng: params.destLng || '',
            strategy: params.strategy || '0'
          });
          break;
        default:
          result = { success: false, error: '未知接口' };
      }

      if (result.success) {
        respStatus.textContent = '成功';
        respStatus.className = 'resp-status success';
        respContent.textContent = JSON.stringify(result.data, null, 2);
      } else {
        respStatus.textContent = '失败';
        respStatus.className = 'resp-status error';
        respContent.textContent = '错误: ' + (result.error || '未知错误');
      }
    } catch (e) {
      respStatus.textContent = '失败';
      respStatus.className = 'resp-status error';
      respContent.textContent = '异常: ' + e.message;
    }
  }

  // ========== 工具函数 ==========
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ========== 初始化 ==========
  function init() {
    renderApiList();
    document.getElementById('apiSearchInput').addEventListener('input', (e) => {
      renderApiList(e.target.value);
    });
    // 默认选中第一个
    if (APIS.length > 0) {
      selectApi(APIS[0].id);
    }
  }

  return { init, APIS };
})();
