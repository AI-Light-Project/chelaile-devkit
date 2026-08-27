# 车来了 DevKit

基于"车来了"小程序 API 逆向工程的开发者工具包，包含完整的 API 文档、在线调试工具，以及 6 个可交互的示例应用。

## 🚀 快速开始

### 安装依赖

```bash
pip install -r requirements.txt --break-system-packages
```

### 启动服务

```bash
python server.py
```

访问 [http://localhost:5000](http://localhost:5000) 即可使用。

## 📦 项目结构

```
chelaile-devkit/
├── server.py              # Flask 后端服务 (API 代理 + 静态文件)
├── chelaile_api.py        # 车来了 API Python 客户端
├── requirements.txt       # Python 依赖
├── README.md              # 本文件
└── static/                # 前端静态文件
    ├── index.html         # 主页面 (SPA)
    ├── css/
    │   └── app.css        # 样式表
    └── js/
        ├── api.js         # 前端 API 客户端
        ├── dev-center.js  # 开发者中心模块
        ├── demos.js       # 6 个示例应用模块
        └── app.js         # 主应用入口 (路由 + 初始化)
```

## 🛠 开发者中心

包含 9 个 API 接口的完整文档和在线调试工具：

| 接口 | 方法 | 说明 |
|------|------|------|
| `list_cities` | GET | 获取城市列表 |
| `search` | GET | 关键词搜索 (线路/站点/POI) |
| `get_nearby_stops` | GET | 附近站点 + 实时到站 |
| `get_stop_detail` | GET | 站点详情 |
| `get_line_detail` | GET | 线路详情 + 实时车辆 |
| `get_line_route` | GET | 线路 GPS 轨迹 |
| `get_line_realtime` | GET | 线路实时到站预测 |
| `get_timetable` | GET | 时刻表 |
| `plan_transit` | POST | 公交+地铁换乘规划 |

每个接口都提供：
- 接口说明和参数表
- 请求示例
- 响应示例
- 在线调试（直接发送请求查看结果）

## 📱 示例应用

### 1. ⏰ 通勤到站提醒
定时轮询目标线路的车辆位置，当 ETA 低于设定阈值时自动提醒。模拟后台守护进程的工作模式。

**使用接口**: `get_line_detail` + 定时轮询

### 2. 🔀 智能换乘规划
输入起终点坐标，获取多条换乘方案并对比。支持少换乘、少步行、时间短三种策略。

**使用接口**: `plan_transit`

### 3. 🗺 公交仪表盘
以当前坐标为中心，获取周边所有站点的实时信息，一屏掌握公交动态。

**使用接口**: `get_nearby_stops`

### 4. ⏱ 出行时间预测
输入线路和上下车站点，计算等车时间 + 乘车时间，给出总耗时预估。

**使用接口**: `search` + `get_line_detail`

### 5. 🌙 末班车守护
查询线路末班车时间，开启守护模式后定时监控（模拟）。

**使用接口**: `search` + `get_line_detail` + `get_timetable`

### 6. 🏁 多线路竞速
查询某个站点经过的所有线路，按实时到站时间排序，推荐最快一班。

**使用接口**: `search` + `get_stop_detail` + `get_nearby_stops`

## 🔐 API 鉴权机制

- **签名算法**: MD5，盐值 `qwihrnbtmj`
- **加密算法**: AES-256-ECB，密钥 `FF32AE65FBFD19414EAAFF6291A54B42`
- **签名格式**: `"k1"="v1"&"k2"="v2"... + salt`

## ⚠️ 免责声明

本项目仅供学习和研究使用，API 接口归"车来了"所有。请勿用于商业用途或大规模请求，尊重服务方资源。
