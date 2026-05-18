// Background service worker for brbott
chrome.runtime.onInstalled.addListener(() => {
    console.log("brbott 插件已成功安装并初始化！");
});

// 允许通过点击扩展图标在右侧打开侧边栏
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));
