/**
 * 车来了 DevKit - 开发者中心模块
 * API 文档 + 在线调试（悬浮弹窗）
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
      }, null, 2),
      responseFields: [
        { path: 'success', type: 'boolean', desc: '请求是否成功' },
        { path: 'data.cityList', type: 'array', desc: '所有支持的城市列表' },
        { path: 'data.cityList[].cityId', type: 'string', desc: '城市唯一标识，用于其他接口的 cityId 参数' },
        { path: 'data.cityList[].cityName', type: 'string', desc: '城市中文名称' },
        { path: 'data.cityList[].cityPinyin', type: 'string', desc: '城市拼音，用于 URL 构造' },
        { path: 'data.hotCityList', type: 'array', desc: '热门城市列表（精简结构）' },
        { path: 'data.hotCityList[].cityId', type: 'string', desc: '热门城市 ID' },
        { path: 'data.hotCityList[].cityName', type: 'string', desc: '热门城市名称' }
      ]
    },
    {
      id: 'search',
      name: '关键词搜索',
      method: 'GET',
      endpoint: '/api/search',
      backendPath: 'search(cityId, key)',
      description: '根据关键词搜索线路、站点和 POI，支持模糊匹配。注意：poiCount/stationCount 为总数，pois/stations 数组仅返回前 3 条。',
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
            ordertype: "1,2,3",
            stationCount: 9,
            stations: [
              { sId: "12243", sn: "吉印大道", lat: 31.888328, lng: 118.790217, subwayV2: 1 },
              { sId: "025-5237", sn: "吉印大道", lat: 31.887076, lng: 118.790836, subwayV2: 0 },
              { sId: "025-4737", sn: "吉印大道北", lat: 31.889046, lng: 118.789296, subwayV2: 0 }
            ],
            poiCount: 8,
            pois: [
              { sn1: "吉印大道-地铁站", sn1Tag: "南京市", lat: 31.885807, lng: 118.795159 },
              { sn1: "吉印大道", sn1Tag: "道路", lat: 31.892694, lng: 118.806174 },
              { sn1: "南京东南实验学校", sn1Tag: "九年一贯制学校", lat: 31.897691, lng: 118.819802 }
            ]
          }
        }
      }, null, 2),
      responseFields: [
        { path: 'success', type: 'boolean', desc: '请求是否成功' },
        { path: 'data.highlightKey', type: 'string', desc: '高亮关键词，前端可用于搜索结果高亮' },
        { path: 'data.result.gpstype', type: 'string', desc: '坐标系类型，通常为 gcj（GCJ-02 火星坐标系）' },
        { path: 'data.result.lineCount', type: 'number', desc: '匹配到的线路总数（数组仅返回前 3 条）' },
        { path: 'data.result.lines', type: 'array', desc: '匹配线路列表（最多 3 条）' },
        { path: 'data.result.lines[].lineId', type: 'string', desc: '线路唯一 ID，用于线路详情等接口' },
        { path: 'data.result.lines[].lineNo', type: 'string', desc: '线路编号，如 "874"' },
        { path: 'data.result.stationCount', type: 'number', desc: '匹配站点总数（数组仅返回前 3 条）' },
        { path: 'data.result.stations', type: 'array', desc: '匹配站点列表（最多 3 条）' },
        { path: 'data.result.stations[].sId', type: 'string', desc: '站点 ID，用于站点详情接口' },
        { path: 'data.result.stations[].sn', type: 'string', desc: '站点名称' },
        { path: 'data.result.stations[].lat', type: 'number', desc: '站点纬度（GCJ-02）' },
        { path: 'data.result.stations[].lng', type: 'number', desc: '站点经度（GCJ-02）' },
        { path: 'data.result.stations[].subwayV2', type: 'number', desc: '是否为地铁站（1=是, 0=否）' },
        { path: 'data.result.poiCount', type: 'number', desc: '匹配 POI 总数（数组仅返回前 3 条）' },
        { path: 'data.result.pois', type: 'array', desc: '匹配 POI 列表（最多 3 条）' },
        { path: 'data.result.pois[].sn1', type: 'string', desc: 'POI 名称' },
        { path: 'data.result.pois[].sn1Tag', type: 'string', desc: 'POI 类别标签，如 "地铁站"、"道路"' },
        { path: 'data.result.pois[].lat', type: 'number', desc: 'POI 纬度（GCJ-02）' },
        { path: 'data.result.pois[].lng', type: 'number', desc: 'POI 经度（GCJ-02）' },
        { path: 'data.result.ordertype', type: 'string', desc: '排序规则，逗号分隔（1=线路, 2=站点, 3=POI）' }
      ]
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
      }, null, 2),
      responseFields: [
        { path: 'success', type: 'boolean', desc: '请求是否成功' },
        { path: 'data', type: 'array', desc: '附近站点列表，按距离排序' },
        { path: 'data[].sn', type: 'string', desc: '站点名称' },
        { path: 'data[].sId', type: 'string', desc: '站点 ID' },
        { path: 'data[].distance', type: 'number', desc: '距当前坐标的距离（米）' },
        { path: 'data[].isSubway', type: 'number', desc: '是否为地铁站（1=是, 0=否）' },
        { path: 'data[].subwayV2Lines', type: 'array', desc: '地铁站经停线路列表（仅地铁站返回）' },
        { path: 'data[].subwayV2Lines[].line.lineName', type: 'string', desc: '地铁线路全名' },
        { path: 'data[].subwayV2Lines[].line.shortName', type: 'string', desc: '地铁线路简称' },
        { path: 'data[].subwayV2Lines[].sublines[].destName', type: 'string', desc: '终点站名' },
        { path: 'data[].subwayV2Lines[].sublines[].firstTime', type: 'string', desc: '首班车时间' },
        { path: 'data[].subwayV2Lines[].sublines[].lastTime', type: 'string', desc: '末班车时间' },
        { path: 'data[].lines', type: 'array', desc: '公交站经停线路列表（仅公交站返回）' },
        { path: 'data[].lines[].line.name', type: 'string', desc: '线路编号' },
        { path: 'data[].lines[].line.endSn', type: 'string', desc: '终点站名' },
        { path: 'data[].lines[].line.direction', type: 'number', desc: '方向（0=上行, 1=下行）' },
        { path: 'data[].lines[].line.firstTime', type: 'string', desc: '首班车时间' },
        { path: 'data[].lines[].line.lastTime', type: 'string', desc: '末班车时间' },
        { path: 'data[].lines[].stnStates', type: 'array', desc: '实时到站状态列表' }
      ]
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
      }, null, 2),
      responseFields: [
        { path: 'success', type: 'boolean', desc: '请求是否成功' },
        { path: 'data.station', type: 'object', desc: '当前站点信息' },
        { path: 'data.station.sn', type: 'string', desc: '站点名称' },
        { path: 'data.station.sId', type: 'string', desc: '站点 ID' },
        { path: 'data.lines', type: 'array', desc: '经停线路列表' },
        { path: 'data.lines[].line.name', type: 'string', desc: '线路编号' },
        { path: 'data.lines[].line.lineId', type: 'string', desc: '线路唯一 ID' },
        { path: 'data.lines[].line.endSn', type: 'string', desc: '终点站名' },
        { path: 'data.lines[].line.direction', type: 'number', desc: '方向（0=上行, 1=下行）' },
        { path: 'data.lines[].buses', type: 'array', desc: '实时车辆列表' },
        { path: 'data.lines[].buses[].busId', type: 'string', desc: '车牌号' },
        { path: 'data.lines[].buses[].travelTime', type: 'number', desc: '预计到站时间（秒）' },
        { path: 'data.lines[].buses[].distanceToNextStn', type: 'number', desc: '距下一站距离（米）' }
      ]
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
      }, null, 2),
      responseFields: [
        { path: 'success', type: 'boolean', desc: '请求是否成功' },
        { path: 'data.line', type: 'object', desc: '线路基础信息' },
        { path: 'data.line.name', type: 'string', desc: '线路编号' },
        { path: 'data.line.startSn', type: 'string', desc: '起点站名' },
        { path: 'data.line.endSn', type: 'string', desc: '终点站名' },
        { path: 'data.line.firstTime', type: 'string', desc: '首班车时间' },
        { path: 'data.line.lastTime', type: 'string', desc: '末班车时间' },
        { path: 'data.line.stationsNum', type: 'number', desc: '总站数' },
        { path: 'data.stations', type: 'array', desc: '站点列表（按行驶顺序排列）' },
        { path: 'data.stations[].order', type: 'number', desc: '站点序号（从 1 开始）' },
        { path: 'data.stations[].sn', type: 'string', desc: '站点名称' },
        { path: 'data.stations[].lat', type: 'number', desc: '站点纬度' },
        { path: 'data.stations[].lng', type: 'number', desc: '站点经度' },
        { path: 'data.buses', type: 'array', desc: '实时运营车辆列表' },
        { path: 'data.buses[].busId', type: 'string', desc: '车牌号' },
        { path: 'data.buses[].lat', type: 'number', desc: '车辆当前纬度' },
        { path: 'data.buses[].lng', type: 'number', desc: '车辆当前经度' },
        { path: 'data.buses[].speed', type: 'number', desc: '当前速度（m/s）' },
        { path: 'data.buses[].capacity', type: 'number', desc: '拥挤度（0=空, 1=一般, 2=拥挤）' },
        { path: 'data.buses[].order', type: 'number', desc: '车辆所在站点序号' },
        { path: 'data.buses[].travels', type: 'array', desc: '到站预测列表' },
        { path: 'data.buses[].travels[].order', type: 'number', desc: '目标站点序号' },
        { path: 'data.buses[].travels[].travelTime', type: 'number', desc: '预计到达时间（秒）' },
        { path: 'data.buses[].travels[].recommTip', type: 'string', desc: '推荐提示，如 "13:05" 预计到达时间' }
      ]
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
      }, null, 2),
      responseFields: [
        { path: 'success', type: 'boolean', desc: '请求是否成功' },
        { path: 'data.route', type: 'object', desc: '线路轨迹对象' },
        { path: 'data.route.points', type: 'array', desc: 'GPS 坐标点串，按行驶顺序排列' },
        { path: 'data.route.points[].lat', type: 'number', desc: '纬度坐标' },
        { path: 'data.route.points[].lng', type: 'number', desc: '经度坐标' },
        { path: 'data.route.distance', type: 'number', desc: '线路总长度（米）' }
      ]
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
      }, null, 2),
      responseFields: [
        { path: 'success', type: 'boolean', desc: '请求是否成功' },
        { path: 'data.buses', type: 'array', desc: '实时车辆列表，按到站时间排序' },
        { path: 'data.buses[].busId', type: 'string', desc: '车牌号' },
        { path: 'data.buses[].order', type: 'number', desc: '车辆当前所在站点序号' },
        { path: 'data.buses[].travelTime', type: 'number', desc: '到达目标站点预计时间（秒）' },
        { path: 'data.buses[].capacity', type: 'number', desc: '拥挤度（0=空座, 1=有座, 2=无座）' },
        { path: 'data.buses[].distanceToNextStn', type: 'number', desc: '距下一站距离（米）' }
      ]
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
      }, null, 2),
      responseFields: [
        { path: 'success', type: 'boolean', desc: '请求是否成功' },
        { path: 'data.firstTime', type: 'string', desc: '首班车发车时间' },
        { path: 'data.lastTime', type: 'string', desc: '末班车发车时间' },
        { path: 'data.interval', type: 'string', desc: '发车间隔描述' },
        { path: 'data.timetable', type: 'array', desc: '时刻表详情列表' },
        { path: 'data.timetable[].time', type: 'string', desc: '发车时间' },
        { path: 'data.timetable[].type', type: 'string', desc: '时段类型，如 "首班"、"高峰"、"平峰"、"末班"' }
      ]
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
      }, null, 2),
      responseFields: [
        { path: 'success', type: 'boolean', desc: '请求是否成功' },
        { path: 'data.routes', type: 'array', desc: '换乘方案列表，按推荐程度排序' },
        { path: 'data.routes[].duration', type: 'number', desc: '总耗时（秒）' },
        { path: 'data.routes[].distance', type: 'number', desc: '总距离（米）' },
        { path: 'data.routes[].segments', type: 'array', desc: '行程分段列表' },
        { path: 'data.routes[].segments[].type', type: 'string', desc: '段类型：walk（步行）/ bus（公交）/ subway（地铁）' },
        { path: 'data.routes[].segments[].distance', type: 'number', desc: '该段距离（米），步行段返回' },
        { path: 'data.routes[].segments[].instruction', type: 'string', desc: '步行指引文字，步行段返回' },
        { path: 'data.routes[].segments[].line', type: 'string', desc: '线路名称，乘车段返回' },
        { path: 'data.routes[].segments[].from', type: 'string', desc: '上车站名，乘车段返回' },
        { path: 'data.routes[].segments[].to', type: 'string', desc: '下车站名，乘车段返回' },
        { path: 'data.routes[].segments[].stops', type: 'number', desc: '经过站数，乘车段返回' },
        { path: 'data.routes[].segments[].duration', type: 'number', desc: '该段耗时（秒），乘车段返回' }
      ]
    }
  ];

  let currentApi = null;
  let debugSelectedApi = null;

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

    // 返回字段解释表
    const fieldRows = api.responseFields && api.responseFields.length
      ? api.responseFields.map(f => `
          <tr>
            <td><span class="field-path">${f.path}</span></td>
            <td><span class="field-type">${f.type}</span></td>
            <td>${f.desc}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="3" style="color:var(--muted);text-align:center;padding:16px">暂无字段说明</td></tr>';

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
        <h3>返回字段说明</h3>
        <table class="field-table">
          <thead>
            <tr><th>字段路径</th><th>类型</th><th>说明</th></tr>
          </thead>
          <tbody>${fieldRows}</tbody>
        </table>
      </div>

      <div class="detail-section">
        <h3>后端调用</h3>
        <pre class="code-block">${escapeHtml(api.backendPath)}</pre>
      </div>
    `;
  }

  // ========== 调试弹窗逻辑 ==========

  function initDebugPopup() {
    const floatBtn = document.getElementById('debugFloatBtn');
    const overlay = document.getElementById('debugOverlay');
    const popup = document.getElementById('debugPopup');
    const closeBtn = document.getElementById('debugCloseBtn');
    const select = document.getElementById('debugApiSelect');
    const sendBtn = document.getElementById('debugSendBtn');

    // 填充接口下拉列表
    select.innerHTML = '<option value="">-- 请选择接口 --</option>' +
      APIS.map(a => `<option value="${a.id}">${a.name} (${a.method} ${a.endpoint})</option>`).join('');

    // 浮动按钮 → 打开弹窗
    floatBtn.addEventListener('click', () => openDebugPopup());

    // 遮罩 → 关闭弹窗
    overlay.addEventListener('click', () => closeDebugPopup());

    // 关闭按钮
    closeBtn.addEventListener('click', () => closeDebugPopup());

    // ESC 关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && popup.classList.contains('show')) {
        closeDebugPopup();
      }
    });

    // 接口选择 → 渲染参数
    select.addEventListener('change', () => {
      const id = select.value;
      if (!id) {
        debugSelectedApi = null;
        document.getElementById('debugApiInfo').style.display = 'none';
        document.getElementById('debugParamsList').innerHTML = '';
        document.getElementById('debugResponseBox').style.display = 'none';
        return;
      }
      const api = APIS.find(a => a.id === id);
      debugSelectedApi = api;
      renderPopupApiInfo(api);
      renderPopupParams(api);
    });

    // 发送请求
    sendBtn.addEventListener('click', () => {
      if (!debugSelectedApi) {
        showToast('请先选择接口');
        return;
      }
      runPopupDebugRequest(debugSelectedApi);
    });
  }

  function openDebugPopup() {
    document.getElementById('debugOverlay').classList.add('show');
    document.getElementById('debugPopup').classList.add('show');
    // 如果当前开发者中心有选中接口，自动选中
    if (currentApi && !document.getElementById('debugApiSelect').value) {
      document.getElementById('debugApiSelect').value = currentApi.id;
      debugSelectedApi = currentApi;
      renderPopupApiInfo(currentApi);
      renderPopupParams(currentApi);
    }
  }

  function closeDebugPopup() {
    document.getElementById('debugOverlay').classList.remove('show');
    document.getElementById('debugPopup').classList.remove('show');
  }

  function renderPopupApiInfo(api) {
    const info = document.getElementById('debugApiInfo');
    info.style.display = 'block';
    info.innerHTML = `
      <span class="api-method-tag ${api.method.toLowerCase()}">${api.method}</span>
      <span class="api-endpoint">${api.endpoint}</span>
      <div style="margin-top:6px;color:var(--muted);font-size:11px">${api.description}</div>
    `;
  }

  function renderPopupParams(api) {
    const container = document.getElementById('debugParamsList');
    if (!api.params.length) {
      container.innerHTML = '<div style="color:var(--muted);font-size:12px;padding:8px 0">该接口无需参数</div>';
      return;
    }
    container.innerHTML = api.params.map(p => `
      <div class="debug-param-item">
        <label>${p.name}${p.required ? '<span class="param-req">*</span>' : ''}<span class="param-type">(${p.type})</span></label>
        <input type="text" data-param="${p.name}" value="${p.default || ''}" placeholder="${p.desc}">
      </div>
    `).join('');
  }

  async function runPopupDebugRequest(api) {
    const container = document.getElementById('debugParamsList');
    const inputs = container.querySelectorAll('input[data-param]');
    const params = {};
    inputs.forEach(inp => {
      const key = inp.getAttribute('data-param');
      const val = inp.value.trim();
      if (val !== '') params[key] = val;
    });

    const respStatus = document.getElementById('popupRespStatus');
    const respContent = document.getElementById('popupRespContent');
    const respBox = document.getElementById('debugResponseBox');
    respBox.style.display = 'flex';
    respStatus.textContent = '请求中...';
    respStatus.className = 'resp-status';
    respContent.textContent = '// 正在请求...';

    const sendBtn = document.getElementById('debugSendBtn');
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.6';

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
    } finally {
      sendBtn.disabled = false;
      sendBtn.style.opacity = '';
    }
  }

  // ========== 工具函数 ==========
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  // ========== 初始化 ==========
  function init() {
    renderApiList();
    document.getElementById('apiSearchInput').addEventListener('input', (e) => {
      renderApiList(e.target.value);
    });
    initDebugPopup();
    // 默认选中第一个
    if (APIS.length > 0) {
      selectApi(APIS[0].id);
    }
  }

  return { init, APIS };
})();
