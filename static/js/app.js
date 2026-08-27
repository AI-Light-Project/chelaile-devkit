/**
 * 车来了 DevKit - 主应用入口
 * 页面路由 + 初始化
 */
(function() {

  // ========== 页面路由 ==========
  function navigate(route) {
    // 更新 Tab 状态
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-route') === route);
    });

    // 显示对应页面
    document.querySelectorAll('.page').forEach(page => {
      page.style.display = 'none';
    });
    const targetPage = document.getElementById('page-' + route);
    if (targetPage) {
      targetPage.style.display = 'block';
    }
  }

  // ========== 健康检查 ==========
  async function checkApiHealth() {
    const dot = document.getElementById('apiStatus');
    try {
      const result = await ChelaileAPI.listCities();
      if (result.success) {
        dot.classList.remove('error');
        dot.title = 'API 连接正常';
      } else {
        dot.classList.add('error');
        dot.title = 'API 连接异常: ' + result.error;
      }
    } catch (e) {
      dot.classList.add('error');
      dot.title = 'API 连接失败: ' + e.message;
    }
  }

  // ========== 初始化 ==========
  function init() {
    // 绑定顶部导航
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const route = tab.getAttribute('data-route');
        navigate(route);
      });
    });

    // 初始化开发者中心
    DevCenter.init();

    // 初始化示例应用
    DemoApps.init();

    // API 健康检查
    checkApiHealth();
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
