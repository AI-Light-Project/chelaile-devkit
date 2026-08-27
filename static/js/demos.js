/**
 * 车来了 DevKit - 示例应用模块
 * 6 个基于 API 组合的端上应用
 */
const DemoApps = (function() {

  const DEFAULT_CITY = '018';
  const DEFAULT_LAT = '31.888328';
  const DEFAULT_LNG = '118.790217';

  // ========== 通用工具 ==========
  function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatETA(seconds) {
    if (!seconds || seconds < 0) return '未知';
    if (seconds < 60) return seconds + ' 秒';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return sec > 0 ? `${min} 分 ${sec} 秒` : `${min} 分钟`;
  }

  function capacityLabel(c) {
    return ['空座', '适中', '拥挤'][c] || '未知';
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  // ========== 应用 1: 通勤到站提醒 ==========
  function renderCommute() {
    return `
      <div class="app-header">
        <div class="app-title">
          <div style="font-size:28px">⏰</div>
          <div>
            <h2>通勤到站提醒</h2>
            <div class="app-desc">定时轮询车辆位置，到站前自动提醒</div>
          </div>
        </div>
        <div>
          <button class="btn btn-primary" id="commuteStartBtn">▶ 开始监控</button>
          <button class="btn" id="commuteStopBtn" style="display:none">⏹ 停止</button>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>城市</label>
          <select id="commuteCity">
            <option value="018">南京</option>
            <option value="034">上海</option>
            <option value="020">广州</option>
          </select>
        </div>
        <div class="form-group">
          <label>站点名称</label>
          <input type="text" id="commuteStop" value="吉印大道" placeholder="输入站点名">
        </div>
        <div class="form-group">
          <label>线路名称</label>
          <input type="text" id="commuteLine" value="874" placeholder="输入线路名">
        </div>
        <div class="form-group">
          <label>提前提醒 (分钟)</label>
          <input type="number" id="commuteThreshold" value="5" min="1" max="30">
        </div>
        <div class="form-group" style="flex:0">
          <label>&nbsp;</label>
          <button class="btn" id="commuteSearchBtn">搜索线路</button>
        </div>
      </div>

      <div id="commuteResult">
        <div class="alert-box alert-info">
          ℹ️ 配置好站点和线路后，点击"开始监控"，系统将每 30 秒刷新一次实时位置
        </div>
      </div>

      <div id="commuteLogs" style="margin-top:16px;display:none">
        <h3 style="font-size:13px;margin-bottom:10px;color:var(--muted)">📋 监控日志</h3>
        <div id="commuteLogList" style="font-family:var(--font-mono);font-size:11px;background:var(--bg3);padding:12px;border-radius:8px;max-height:200px;overflow-y:auto"></div>
      </div>
    `;
  }

  let commuteTimer = null;
  let commuteLineId = null;
  let commuteStopOrder = null;

  function initCommute() {
    document.getElementById('commuteSearchBtn').onclick = async () => {
      const city = document.getElementById('commuteCity').value;
      const lineName = document.getElementById('commuteLine').value;
      const stopName = document.getElementById('commuteStop').value;
      if (!lineName) { showToast('请输入线路名'); return; }

      const result = await ChelaileAPI.search(city, lineName);
      if (!result.success || !result.data.result?.lines?.length) {
        showToast('未找到线路');
        return;
      }
      const line = result.data.result.lines[0];
      commuteLineId = line.lineId;

      // 获取线路详情，找到目标站点序号
      const detail = await ChelaileAPI.lineDetail(city, line.lineId, { lat: DEFAULT_LAT, lng: DEFAULT_LNG });
      if (detail.success && detail.data.stations) {
        const stations = detail.data.stations;
        const target = stations.find(s => s.sn && s.sn.includes(stopName));
        if (target) {
          commuteStopOrder = target.order;
          document.getElementById('commuteResult').innerHTML = `
            <div class="alert-box alert-success">
              ✅ 已找到线路 <strong>${line.name}</strong> → ${line.endSn}，目标站点: <strong>${target.sn}</strong> (第 ${target.order} 站)
            </div>
          `;
        } else {
          document.getElementById('commuteResult').innerHTML = `
            <div class="alert-box alert-warn">
              ⚠️ 未找到站点 "${stopName}"，将使用第7站作为默认目标
            </div>
          `;
          commuteStopOrder = 7;
        }
      }
      showToast('线路已就绪，点击开始监控');
    };

    document.getElementById('commuteStartBtn').onclick = () => {
      if (!commuteLineId) { showToast('请先搜索线路'); return; }
      document.getElementById('commuteStartBtn').style.display = 'none';
      document.getElementById('commuteStopBtn').style.display = 'inline-flex';
      document.getElementById('commuteLogs').style.display = 'block';
      commuteCheck();
      commuteTimer = setInterval(commuteCheck, 30000);
      addCommuteLog('监控已启动，每 30 秒刷新一次');
    };

    document.getElementById('commuteStopBtn').onclick = () => {
      clearInterval(commuteTimer);
      document.getElementById('commuteStartBtn').style.display = 'inline-flex';
      document.getElementById('commuteStopBtn').style.display = 'none';
      addCommuteLog('监控已停止');
    };
  }

  async function commuteCheck() {
    const city = document.getElementById('commuteCity').value;
    const threshold = parseInt(document.getElementById('commuteThreshold').value) * 60;

    const detail = await ChelaileAPI.lineDetail(city, commuteLineId, { lat: DEFAULT_LAT, lng: DEFAULT_LNG });
    if (!detail.success) {
      addCommuteLog('❌ 请求失败: ' + detail.error);
      return;
    }

    const buses = detail.data.buses || [];
    const stations = detail.data.stations || [];
    const targetStation = stations.find(s => s.order == commuteStopOrder);

    if (buses.length === 0) {
      addCommuteLog('暂无运营车辆');
      return;
    }

    // 找到最近的即将到站的车辆
    let nearestBus = null;
    let minETA = Infinity;

    for (const bus of buses) {
      if (bus.travels && bus.travels.length > 0) {
        for (const t of bus.travels) {
          if (t.order == commuteStopOrder && t.travelTime > 0 && t.travelTime < minETA) {
            minETA = t.travelTime;
            nearestBus = bus;
          }
        }
      }
    }

    const time = new Date().toLocaleTimeString();
    if (nearestBus && minETA <= threshold) {
      addCommuteLog(`🔔 [${time}] ${nearestBus.busId} 还有 ${formatETA(minETA)} 到达！该出门了！`);
      // 浏览器通知
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('公交到站提醒', {
          body: `${nearestBus.busId} 还有 ${formatETA(minETA)} 到达 ${targetStation?.sn || '目标站'}`
        });
      }
    } else if (nearestBus) {
      addCommuteLog(`ℹ️ [${time}] 最近车辆 ${nearestBus.busId} 到站还需 ${formatETA(minETA)}`);
    } else {
      addCommuteLog(`ℹ️ [${time}] 当前有 ${buses.length} 辆车运营，暂无到站预测数据`);
    }
  }

  function addCommuteLog(msg) {
    const list = document.getElementById('commuteLogList');
    const line = document.createElement('div');
    line.style.padding = '3px 0';
    line.style.borderBottom = '1px dashed var(--rule)';
    line.textContent = msg;
    list.insertBefore(line, list.firstChild);
  }

  // ========== 应用 2: 智能换乘规划 ==========
  function renderTransfer() {
    return `
      <div class="app-header">
        <div class="app-title">
          <div style="font-size:28px">🔀</div>
          <div>
            <h2>智能换乘规划</h2>
            <div class="app-desc">多方案对比，推荐最优换乘路线</div>
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>起点名称</label>
          <input type="text" id="transOrigin" value="吉印大道">
        </div>
        <div class="form-group">
          <label>起点纬度</label>
          <input type="text" id="transOriginLat" value="31.888328">
        </div>
        <div class="form-group">
          <label>起点经度</label>
          <input type="text" id="transOriginLng" value="118.790217">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>终点名称</label>
          <input type="text" id="transDest" value="南京南站">
        </div>
        <div class="form-group">
          <label>终点纬度</label>
          <input type="text" id="transDestLat" value="31.9648">
        </div>
        <div class="form-group">
          <label>终点经度</label>
          <input type="text" id="transDestLng" value="118.8035">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>出行策略</label>
          <select id="transStrategy">
            <option value="0">少换乘</option>
            <option value="1">少步行</option>
            <option value="2">时间短</option>
          </select>
        </div>
        <div class="form-group" style="flex:0">
          <label>&nbsp;</label>
          <button class="btn btn-primary" id="transPlanBtn">规划路线</button>
        </div>
      </div>

      <div id="transResult">
        <div class="alert-box alert-info">ℹ️ 输入起终点后点击"规划路线"查看换乘方案</div>
      </div>
    `;
  }

  function initTransfer() {
    document.getElementById('transPlanBtn').onclick = async () => {
      const body = {
        cityId: DEFAULT_CITY,
        originName: document.getElementById('transOrigin').value,
        originLat: document.getElementById('transOriginLat').value,
        originLng: document.getElementById('transOriginLng').value,
        destName: document.getElementById('transDest').value,
        destLat: document.getElementById('transDestLat').value,
        destLng: document.getElementById('transDestLng').value,
        strategy: document.getElementById('transStrategy').value
      };

      const resultEl = document.getElementById('transResult');
      resultEl.innerHTML = '<div class="alert-box alert-info">⏳ 正在规划路线...</div>';

      const result = await ChelaileAPI.planTransit(body);
      if (!result.success) {
        resultEl.innerHTML = `<div class="alert-box alert-error">❌ 规划失败: ${result.error}</div>`;
        return;
      }

      // 解析换乘方案
      const data = result.data;
      const routes = data.routes || data.transits || [];

      if (routes.length === 0) {
        resultEl.innerHTML = '<div class="alert-box alert-warn">⚠️ 未找到换乘方案</div>';
        return;
      }

      let html = `<h3 style="font-size:14px;margin-bottom:12px">找到 ${routes.length} 条换乘方案</h3>`;
      routes.forEach((route, idx) => {
        const duration = route.duration ? Math.round(route.duration / 60) + ' 分钟' : '未知';
        const distance = route.distance ? (route.distance / 1000).toFixed(1) + ' km' : '';
        const segments = route.segments || route.steps || [];

        html += `
          <div class="stop-card">
            <div class="stop-name">
              方案 ${idx + 1}
              <span style="font-size:11px;font-weight:500;color:var(--brand)">${duration} ${distance}</span>
            </div>
            <div style="font-size:12px;color:var(--muted);margin-bottom:8px">
              ${segments.map(s => {
                if (s.type === 'walk' || s.traffic_type === 1) return `🚶步行${s.distance ? ' ' + (s.distance) + 'm' : ''}`;
                if (s.type === 'subway' || s.traffic_type === 2) return `🚇${s.line || s.line_name || '地铁'}`;
                if (s.type === 'bus' || s.traffic_type === 3) return `🚌${s.line || s.line_name || '公交'}`;
                return s.line_name || s.instruction || '一段行程';
              }).join(' → ')}
            </div>
          </div>
        `;
      });

      resultEl.innerHTML = html;
    };
  }

  // ========== 应用 3: 公交仪表盘 ==========
  function renderDashboard() {
    return `
      <div class="app-header">
        <div class="app-title">
          <div style="font-size:28px">🗺</div>
          <div>
            <h2>公交仪表盘</h2>
            <div class="app-desc">一屏掌握周边所有公交动态</div>
          </div>
        </div>
        <button class="btn" id="dashRefreshBtn">🔄 刷新</button>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>纬度</label>
          <input type="text" id="dashLat" value="${DEFAULT_LAT}">
        </div>
        <div class="form-group">
          <label>经度</label>
          <input type="text" id="dashLng" value="${DEFAULT_LNG}">
        </div>
        <div class="form-group">
          <label>数量</label>
          <input type="number" id="dashLimit" value="8" min="3" max="20">
        </div>
        <div class="form-group" style="flex:0">
          <label>&nbsp;</label>
          <button class="btn btn-primary" id="dashSearchBtn">查询周边</button>
        </div>
      </div>

      <div id="dashResult">
        <div class="alert-box alert-info">ℹ️ 点击"查询周边"查看附近站点实时信息</div>
      </div>
    `;
  }

  function initDashboard() {
    const searchBtn = document.getElementById('dashSearchBtn');
    const refreshBtn = document.getElementById('dashRefreshBtn');
    searchBtn.onclick = loadDashboard;
    refreshBtn.onclick = loadDashboard;
  }

  async function loadDashboard() {
    const lat = document.getElementById('dashLat').value;
    const lng = document.getElementById('dashLng').value;
    const limit = document.getElementById('dashLimit').value;
    const resultEl = document.getElementById('dashResult');

    resultEl.innerHTML = '<div class="alert-box alert-info">⏳ 正在获取周边站点信息...</div>';

    const result = await ChelaileAPI.nearbyStops(DEFAULT_CITY, lat, lng, parseInt(limit));
    if (!result.success) {
      resultEl.innerHTML = `<div class="alert-box alert-error">❌ 获取失败: ${result.error}</div>`;
      return;
    }

    const stops = result.data || [];
    if (stops.length === 0) {
      resultEl.innerHTML = '<div class="alert-box alert-warn">⚠️ 附近没有站点</div>';
      return;
    }

    let html = `<h3 style="font-size:14px;margin-bottom:12px">附近 ${stops.length} 个站点</h3>`;
    stops.forEach(stop => {
      const isSubway = stop.isSubway === 1;
      const lines = stop.lines || [];
      const subwayLines = stop.subwayV2Lines || [];

      html += `
        <div class="stop-card">
          <div class="stop-name">
            <span>${isSubway ? '🚇 ' : '🚌 '}${escapeHtml(stop.sn || '未知站点')}</span>
            <span class="stop-dist">${stop.distance || '?'} m</span>
          </div>
      `;

      if (subwayLines.length > 0) {
        subwayLines.forEach(sl => {
          const line = sl.line || {};
          (sl.sublines || []).forEach(sub => {
            html += `
              <div class="line-row">
                <span class="line-no" style="color:var(--accent)">🚇 ${line.shortName || line.lineName || '地铁'}</span>
                <span class="line-dest">→ ${escapeHtml(sub.destName || '')}</span>
                <span class="line-eta">${sub.firstTime || ''}-${sub.lastTime || ''}</span>
              </div>
            `;
          });
        });
      }

      if (lines.length > 0) {
        lines.slice(0, 6).forEach(li => {
          const line = li.line || {};
          const stnStates = li.stnStates || [];
          let etaText = '';
          if (stnStates.length > 0) {
            const bus = stnStates[0];
            if (bus.travelTime > 0) {
              etaText = formatETA(bus.travelTime);
            } else if (li.preArrivalTime) {
              etaText = li.preArrivalTime;
            }
          }

          html += `
            <div class="line-row">
              <span class="line-no">${escapeHtml(line.name || '')}</span>
              <span class="line-dest">→ ${escapeHtml(line.endSn || '')}</span>
              <span class="line-eta">${etaText || '--'}</span>
            </div>
          `;
        });
      }

      html += '</div>';
    });

    resultEl.innerHTML = html;
  }

  // ========== 应用 4: 出行时间预测 ==========
  function renderPrediction() {
    return `
      <div class="app-header">
        <div class="app-title">
          <div style="font-size:28px">⏱</div>
          <div>
            <h2>出行时间预测</h2>
            <div class="app-desc">精确计算等车+乘车总耗时</div>
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>线路名称</label>
          <input type="text" id="predLine" value="874">
        </div>
        <div class="form-group">
          <label>上车站点</label>
          <input type="text" id="predFrom" value="吉印大道">
        </div>
        <div class="form-group">
          <label>下车站点</label>
          <input type="text" id="predTo" value="同仁客运站">
        </div>
        <div class="form-group" style="flex:0">
          <label>&nbsp;</label>
          <button class="btn btn-primary" id="predCalcBtn">预测耗时</button>
        </div>
      </div>

      <div id="predResult">
        <div class="alert-box alert-info">ℹ️ 输入线路和上下车站点，预测总出行时间</div>
      </div>
    `;
  }

  function initPrediction() {
    document.getElementById('predCalcBtn').onclick = async () => {
      const lineName = document.getElementById('predLine').value;
      const from = document.getElementById('predFrom').value;
      const to = document.getElementById('predTo').value;
      const resultEl = document.getElementById('predResult');

      if (!lineName || !from || !to) {
        showToast('请填写完整信息');
        return;
      }

      resultEl.innerHTML = '<div class="alert-box alert-info">⏳ 正在计算...</div>';

      // 搜索线路
      const searchResult = await ChelaileAPI.search(DEFAULT_CITY, lineName);
      if (!searchResult.success || !searchResult.data.result?.lines?.length) {
        resultEl.innerHTML = '<div class="alert-box alert-error">❌ 未找到线路</div>';
        return;
      }

      const line = searchResult.data.result.lines[0];
      const detail = await ChelaileAPI.lineDetail(DEFAULT_CITY, line.lineId, { lat: DEFAULT_LAT, lng: DEFAULT_LNG });
      if (!detail.success) {
        resultEl.innerHTML = `<div class="alert-box alert-error">❌ 获取线路详情失败</div>`;
        return;
      }

      const stations = detail.data.stations || [];
      const buses = detail.data.buses || [];
      const fromStation = stations.find(s => s.sn && s.sn.includes(from));
      const toStation = stations.find(s => s.sn && s.sn.includes(to));

      if (!fromStation || !toStation) {
        resultEl.innerHTML = `<div class="alert-box alert-warn">⚠️ 未找到站点 (起点:${fromStation?'✓':'✗'} / 终点:${toStation?'✓':'✗'})</div>`;
        return;
      }

      const fromOrder = fromStation.order;
      const toOrder = toStation.order;
      const stationsBetween = Math.abs(toOrder - fromOrder);

      // 找到最近车辆
      let nearestBus = null;
      let minWait = Infinity;
      for (const bus of buses) {
        if (bus.travels && bus.travels.length > 0) {
          for (const t of bus.travels) {
            if (t.order == fromOrder && t.travelTime > 0 && t.travelTime < minWait) {
              minWait = t.travelTime;
              nearestBus = bus;
            }
          }
        }
      }

      // 估算乘车时间（按平均每站2分钟估算）
      const rideEstimate = stationsBetween * 120;
      const totalEstimate = (nearestBus ? minWait : 600) + rideEstimate;

      resultEl.innerHTML = `
        <div class="stop-card">
          <div class="stop-name">
            <span>${escapeHtml(line.name)} 路</span>
            <span class="stop-dist">${stationsBetween} 站</span>
          </div>
          <div style="font-size:12px;color:var(--muted);margin-bottom:10px">
            ${escapeHtml(fromStation.sn)} → ${escapeHtml(toStation.sn)}
          </div>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px">
            <div style="text-align:center;padding:10px;background:var(--bg3);border-radius:8px">
              <div style="font-size:10px;color:var(--muted)">等车时间</div>
              <div style="font-size:18px;font-weight:700;color:var(--accent2)">
                ${nearestBus ? formatETA(minWait) : '~10分钟'}
              </div>
              <div style="font-size:10px;color:var(--muted)">
                ${nearestBus ? nearestBus.busId : '无实时数据'}
              </div>
            </div>
            <div style="text-align:center;padding:10px;background:var(--bg3);border-radius:8px">
              <div style="font-size:10px;color:var(--muted)">乘车时间</div>
              <div style="font-size:18px;font-weight:700;color:var(--accent)">
                ~${Math.round(rideEstimate/60)} 分钟
              </div>
              <div style="font-size:10px;color:var(--muted)">约 ${stationsBetween} 站</div>
            </div>
            <div style="text-align:center;padding:10px;background:var(--bg3);border-radius:8px">
              <div style="font-size:10px;color:var(--muted)">总耗时</div>
              <div style="font-size:18px;font-weight:700;color:var(--green)">
                ~${Math.round(totalEstimate/60)} 分钟
              </div>
              <div style="font-size:10px;color:var(--muted)">预估到达</div>
            </div>
          </div>

          <div class="alert-box alert-info">
            💡 ${nearestBus ? '当前有 ' + buses.length + ' 辆车运营' : '暂无实时车辆位置，按发车间隔估算'}
          </div>
        </div>

        <h3 style="font-size:13px;margin:16px 0 10px;color:var(--muted)">线路站点（${stations.length}站）</h3>
        <div class="route-stations">
          ${stations.slice(0, 20).map(s => `
            <div class="route-station ${s.order === fromOrder ? 'current' : ''} ${s.order === toOrder ? 'target' : ''}">
              <div class="dot"></div>
              <div class="line"></div>
              <div class="name">${escapeHtml(s.sn || '')}</div>
            </div>
          `).join('')}
        </div>
        ${stations.length > 20 ? '<div style="text-align:center;font-size:11px;color:var(--muted);margin-top:6px">... 还有 ' + (stations.length - 20) + ' 站</div>' : ''}
      `;
    };
  }

  // ========== 应用 5: 末班车守护 ==========
  function renderLastbus() {
    return `
      <div class="app-header">
        <div class="app-title">
          <div style="font-size:28px">🌙</div>
          <div>
            <h2>末班车守护</h2>
            <div class="app-desc">监控末班车时间，防止错过回家车</div>
          </div>
        </div>
        <button class="btn btn-primary" id="lastbusStartBtn">▶ 开启守护</button>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>线路名称</label>
          <input type="text" id="lastbusLine" value="874">
        </div>
        <div class="form-group">
          <label>上车站点</label>
          <input type="text" id="lastbusStop" value="吉印大道">
        </div>
        <div class="form-group" style="flex:0">
          <label>&nbsp;</label>
          <button class="btn" id="lastbusSearchBtn">查询</button>
        </div>
      </div>

      <div id="lastbusResult">
        <div class="alert-box alert-info">ℹ️ 查询线路末班车时间，开启守护后自动提醒</div>
      </div>
    `;
  }

  let lastbusTimer = null;

  function initLastbus() {
    document.getElementById('lastbusSearchBtn').onclick = searchLastbus;
    document.getElementById('lastbusStartBtn').onclick = toggleLastbusGuard;
  }

  async function searchLastbus() {
    const lineName = document.getElementById('lastbusLine').value;
    const stopName = document.getElementById('lastbusStop').value;
    const resultEl = document.getElementById('lastbusResult');

    if (!lineName) { showToast('请输入线路名'); return; }

    const searchResult = await ChelaileAPI.search(DEFAULT_CITY, lineName);
    if (!searchResult.success || !searchResult.data.result?.lines?.length) {
      resultEl.innerHTML = '<div class="alert-box alert-error">❌ 未找到线路</div>';
      return;
    }

    const lines = searchResult.data.result.lines;
    let html = `<h3 style="font-size:14px;margin-bottom:12px">线路方向</h3>`;

    for (const line of lines) {
      const detail = await ChelaileAPI.lineDetail(DEFAULT_CITY, line.lineId, { lat: DEFAULT_LAT, lng: DEFAULT_LNG });
      if (!detail.success) continue;

      const info = detail.data.line || {};
      const stations = detail.data.stations || [];
      const targetStation = stations.find(s => s.sn && s.sn.includes(stopName));

      html += `
        <div class="stop-card">
          <div class="stop-name">
            <span>${escapeHtml(line.name)} → ${escapeHtml(line.endSn)}</span>
            <span class="stop-dist">${info.firstTime || '?'}-${info.lastTime || '?'}</span>
          </div>
          <div style="font-size:12px;color:var(--muted);margin-bottom:8px">
            起点: ${escapeHtml(info.startSn || '?')} | 终点: ${escapeHtml(info.endSn || '?')} | 共 ${info.stationsNum || '?'} 站
          </div>
          ${targetStation ? `
            <div class="eta-box">
              <div class="eta-label">目标站点</div>
              <div class="eta-val" style="color:var(--accent);font-size:14px">${escapeHtml(targetStation.sn)} (第 ${targetStation.order} 站)</div>
              <div class="eta-detail">末班车经过此站时间约为 ${info.lastTime || '?'} 后顺延</div>
            </div>
          ` : '<div style="font-size:11px;color:var(--muted)">未找到站点 "' + escapeHtml(stopName) + '"</div>'}
        </div>
      `;
    }

    resultEl.innerHTML = html;
  }

  function toggleLastbusGuard() {
    const btn = document.getElementById('lastbusStartBtn');
    if (lastbusTimer) {
      clearInterval(lastbusTimer);
      lastbusTimer = null;
      btn.textContent = '▶ 开启守护';
      btn.classList.remove('btn-primary');
      showToast('末班车守护已关闭');
    } else {
      lastbusTimer = setInterval(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        showToast('🌙 末班车守护中... ' + timeStr);
      }, 60000);
      btn.textContent = '⏹ 守护中';
      btn.classList.add('btn-primary');
      showToast('末班车守护已开启');
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }

  // ========== 应用 6: 多线路竞速 ==========
  function renderRace() {
    return `
      <div class="app-header">
        <div class="app-title">
          <div style="font-size:28px">🏁</div>
          <div>
            <h2>多线路竞速</h2>
            <div class="app-desc">同时对比多条线路，推荐最快一班</div>
          </div>
        </div>
        <button class="btn" id="raceRefreshBtn">🔄 刷新</button>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>站点名称</label>
          <input type="text" id="raceStop" value="吉印大道">
        </div>
        <div class="form-group" style="flex:0 0 auto;width:120px">
          <label>&nbsp;</label>
          <button class="btn btn-primary" id="raceSearchBtn">查询站点</button>
        </div>
      </div>

      <div id="raceResult">
        <div class="alert-box alert-info">ℹ️ 输入站点名称，查询所有经过线路的实时到站时间</div>
      </div>
    `;
  }

  function initRace() {
    document.getElementById('raceSearchBtn').onclick = loadRace;
    document.getElementById('raceRefreshBtn').onclick = loadRace;
  }

  async function loadRace() {
    const stopName = document.getElementById('raceStop').value;
    const resultEl = document.getElementById('raceResult');

    if (!stopName) { showToast('请输入站点名'); return; }

    resultEl.innerHTML = '<div class="alert-box alert-info">⏳ 正在搜索站点...</div>';

    // 搜索站点
    const searchResult = await ChelaileAPI.search(DEFAULT_CITY, stopName);
    if (!searchResult.success || !searchResult.data.result?.stations?.length) {
      resultEl.innerHTML = '<div class="alert-box alert-error">❌ 未找到站点</div>';
      return;
    }

    const station = searchResult.data.result.stations[0];
    const stationId = station.sId;
    const physicalStId = station.physicalStId || stationId;

    // 获取站点详情
    const detailResult = await ChelaileAPI.stopDetail(DEFAULT_CITY, physicalStId, {
      lat: DEFAULT_LAT, lng: DEFAULT_LNG
    });

    let lines = [];
    if (detailResult.success) {
      lines = detailResult.data.lines || detailResult.data.lineInfos || [];
    }

    // 如果站点详情没有线路，用 nearby_stops 兜底
    if (lines.length === 0) {
      const nearby = await ChelaileAPI.nearbyStops(DEFAULT_CITY, station.lat, station.lng, 3);
      if (nearby.success && nearby.data.length > 0) {
        const stop = nearby.data.find(s => s.sn && s.sn.includes(stopName)) || nearby.data[0];
        lines = (stop.lines || []).map(l => ({
          line: l.line,
          stnStates: l.stnStates
        }));
      }
    }

    if (lines.length === 0) {
      resultEl.innerHTML = '<div class="alert-box alert-warn">⚠️ 未找到经过此站的线路</div>';
      return;
    }

    // 整理每条线路的最近到站时间
    const lineResults = [];
    for (const li of lines) {
      const line = li.line || {};
      const stnStates = li.stnStates || li.buses || [];
      let eta = null;
      let busId = null;

      if (stnStates.length > 0) {
        const bus = stnStates[0];
        if (bus.travelTime > 0) {
          eta = bus.travelTime;
        }
        busId = bus.busId;
      }

      lineResults.push({
        name: line.name || line.lineName || '未知',
        endSn: line.endSn || '未知',
        eta: eta,
        busId: busId,
        direction: line.direction
      });
    }

    // 按 ETA 排序
    lineResults.sort((a, b) => {
      if (a.eta === null) return 1;
      if (b.eta === null) return -1;
      return a.eta - b.eta;
    });

    let html = `
      <div class="alert-box alert-success">
        🏆 找到 ${lineResults.length} 条线路，<strong>${lineResults[0]?.name || '?'}</strong> 路最快到达
      </div>
      <h3 style="font-size:14px;margin:16px 0 12px">到站时间排序</h3>
    `;

    lineResults.forEach((lr, idx) => {
      const isFastest = idx === 0;
      html += `
        <div class="stop-card" style="${isFastest ? 'border-left:4px solid var(--green)' : ''}">
          <div class="stop-name">
            <span>
              ${isFastest ? '🏆 ' : ''}<strong>${escapeHtml(lr.name)}</strong>
              → ${escapeHtml(lr.endSn)}
            </span>
            <span class="line-eta" style="font-size:14px">
              ${lr.eta ? formatETA(lr.eta) : '暂无数据'}
            </span>
          </div>
          ${lr.busId ? `<div style="font-size:11px;color:var(--muted)">车辆: ${lr.busId}</div>` : ''}
        </div>
      `;
    });

    resultEl.innerHTML = html;
  }

  // ========== 应用路由 ==========
  const DEMOS = {
    commute: { title: '通勤到站提醒', render: renderCommute, init: initCommute },
    transfer: { title: '智能换乘规划', render: renderTransfer, init: initTransfer },
    dashboard: { title: '公交仪表盘', render: renderDashboard, init: initDashboard },
    prediction: { title: '出行时间预测', render: renderPrediction, init: initPrediction },
    lastbus: { title: '末班车守护', render: renderLastbus, init: initLastbus },
    race: { title: '多线路竞速', render: renderRace, init: initRace },
  };

  function showDemo(id) {
    const demo = DEMOS[id];
    if (!demo) return;

    document.getElementById('demoGrid').style.display = 'none';
    document.querySelector('.demo-header').style.display = 'none';
    const detail = document.getElementById('demoDetail');
    detail.style.display = 'block';
    document.getElementById('demoContent').innerHTML = demo.render();

    // 初始化
    if (demo.init) demo.init();
  }

  function backToList() {
    document.getElementById('demoGrid').style.display = 'grid';
    document.querySelector('.demo-header').style.display = 'block';
    document.getElementById('demoDetail').style.display = 'none';
  }

  function init() {
    // 绑定卡片点击
    document.querySelectorAll('.demo-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-demo');
        showDemo(id);
      });
    });
    // 返回按钮
    document.getElementById('demoBackBtn').addEventListener('click', backToList);
  }

  return { init };
})();
