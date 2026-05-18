document.addEventListener('DOMContentLoaded', function () {
    const wsUrlInput = document.getElementById('wsUrl');
    const connectBtn = document.getElementById('connectBtn');
    const wsStatusLabel = document.getElementById('wsStatus');
    const wsDot = document.getElementById('wsDot');
    const sessionStatusLabel = document.getElementById('sessionStatus');
    const sessionDot = document.getElementById('sessionDot');
    const capturedTokenDiv = document.getElementById('capturedToken');
    const capturedFpDiv = document.getElementById('capturedFp');
    const logsContainer = document.getElementById('logs');
    const clearBtn = document.getElementById('clearBtn');

    let ws = null;
    let latestWxFingerprint = "";
    let latestWxToken = "";
    let activeTabId = null;

    // Helper: Print a live formatted log to UI console
    function log(type, text, isSpecial = false) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'log-time';
        const d = new Date();
        timeSpan.textContent = `[${d.toLocaleTimeString()}]`;
        
        const typeSpan = document.createElement('span');
        typeSpan.className = 'log-type';
        typeSpan.textContent = type;
        if (isSpecial) {
            typeSpan.style.color = '#ef4444';
            typeSpan.style.textShadow = '0 0 4px rgba(239, 68, 68, 0.5)';
        }

        const textSpan = document.createElement('span');
        textSpan.className = 'log-text';
        textSpan.textContent = text;
        if (type === 'ERROR') {
            textSpan.className = 'log-text log-error';
        } else if (type === 'SUCCESS') {
            textSpan.className = 'log-text log-success';
        }

        entry.appendChild(timeSpan);
        entry.appendChild(typeSpan);
        entry.appendChild(textSpan);
        
        logsContainer.insertBefore(entry, logsContainer.firstChild);
    }

    // Helper: Update UI indicator status
    function setIndicator(dotEl, labelEl, state, text) {
        // Clear classes
        dotEl.className = 'dot';
        labelEl.className = 'status-val';

        if (state === 'green') {
            dotEl.classList.add('green');
            labelEl.classList.add('connected');
        } else if (state === 'yellow') {
            dotEl.classList.add('yellow');
            labelEl.classList.add('connecting');
        } else {
            dotEl.classList.add('red');
            labelEl.classList.add('disconnected');
        }
        labelEl.textContent = text;
    }

    // Extract token parameter from active WeChat page URL
    function getTokenFromUrl(url) {
        if (!url) return null;
        try {
            const urlObj = new URL(url);
            let token = urlObj.searchParams.get('token');
            if (!token) {
                const tokenMatch = url.match(/t(?:oken)?=([^&]+)/);
                if (tokenMatch) {
                    token = tokenMatch[1];
                }
            }
            return token;
        } catch (e) {
            return null;
        }
    }

    // Scan browser tabs to extract token and session status
    async function scanWeChatSession() {
        try {
            const tabs = await chrome.tabs.query({});
            const wechatTab = tabs.find(t => t.url && t.url.includes('mp.weixin.qq.com'));
            
            if (wechatTab) {
                activeTabId = wechatTab.id;
                const url = wechatTab.url || wechatTab.pendingUrl;
                const token = getTokenFromUrl(url);
                if (token) {
                    latestWxToken = token;
                    capturedTokenDiv.textContent = token;
                    capturedTokenDiv.style.color = '#38bdf8';
                    setIndicator(sessionDot, sessionStatusLabel, 'green', '就绪 (已获取会话)');
                    sendClientState();
                    return;
                }
            }
            // Fallback if no WeChat page is found open at all
            setIndicator(sessionDot, sessionStatusLabel, 'red', '离线 (未捕获凭证)');
        } catch (e) {
            console.error('[Session Scanner] Error querying tabs:', e);
        }
    }

    // Send CLIENT_STATE payload to WebSocket Server
    function sendClientState() {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'CLIENT_STATE',
                data: {
                    hasFingerprint: !!latestWxFingerprint,
                    hasToken: !!latestWxToken,
                    currentUrl: 'mp.weixin.qq.com',
                    latestWxFingerprint: latestWxFingerprint || ""
                }
            }));
        }
    }

    // Establish WebSocket Connection to Admin Server
    function connectWS() {
        const url = wsUrlInput.value.trim();
        if (!url) {
            log('ERROR', 'WebSocket URL 不能为空！');
            return;
        }

        chrome.storage.local.set({ savedWsUrl: url });

        if (ws) {
            ws.close();
        }

        log('INFO', `正在建立连接: ${url}...`);
        setIndicator(wsDot, wsStatusLabel, 'yellow', '连接中');
        connectBtn.disabled = true;

        try {
            ws = new WebSocket(url);

            ws.onopen = () => {
                log('SUCCESS', 'WebSocket 管道连接成功！网桥已开启。');
                setIndicator(wsDot, wsStatusLabel, 'green', '已连接');
                connectBtn.disabled = false;
                connectBtn.textContent = '断开';
                sendClientState();
            };

            ws.onmessage = async (event) => {
                try {
                    const payload = JSON.parse(event.data);
                    log('WS_IN', `收到服务器指令: "${payload.type}"`);

                    if (payload.type === 'START_CRAWL') {
                        const { queries, maxPage, delay } = payload.data;
                        log('INFO', `拉取开始 - 关键字数量: ${queries.length}, 翻页限制: ${maxPage}, 延迟: ${delay}ms`);

                        // Verify WeChat session parameters are present before proceeding
                        if (!latestWxToken) {
                            log('ERROR', '启动失败: 尚未捕获到有效的微信后台 Session Token。请打开微信并刷新网页！');
                            sendCrawlStatus('error', '未捕获微信 Session Token，任务无法启动');
                            return;
                        }

                        // Target open WeChat tabs. Check activeTabId first, then all matching tabs
                        const tabs = await chrome.tabs.query({});
                        const wechatTabs = tabs.filter(t => t.url && t.url.includes('mp.weixin.qq.com'));
                        
                        // Re-order wechatTabs to prioritize activeTabId if set
                        if (activeTabId) {
                            const activeIndex = wechatTabs.findIndex(t => t.id === activeTabId);
                            if (activeIndex > 0) {
                                const [activeTab] = wechatTabs.splice(activeIndex, 1);
                                wechatTabs.unshift(activeTab);
                            }
                        }

                        if (wechatTabs.length === 0) {
                            log('ERROR', '启动失败: 当前浏览器未找到打开的微信公众号后台标签页。');
                            sendCrawlStatus('error', '未找到打开的微信公众号后台页面，无法发送 DOM 指令');
                            return;
                        }

                        // Try sending the message sequentially until one succeeds
                        let sentSuccessfully = false;
                        for (const wTab of wechatTabs) {
                            try {
                                await new Promise((resolve, reject) => {
                                    const timer = setTimeout(() => {
                                        reject(new Error('Communication timeout'));
                                    }, 500);
                                    chrome.tabs.sendMessage(wTab.id, {
                                        action: 'fetch_repost_biz',
                                        token: latestWxToken,
                                        fingerprint: latestWxFingerprint || "",
                                        queries: queries,
                                        maxPage: maxPage,
                                        delay: delay
                                    }, (response) => {
                                        clearTimeout(timer);
                                        if (chrome.runtime.lastError) {
                                            reject(chrome.runtime.lastError);
                                        } else {
                                            resolve(response);
                                        }
                                    });
                                });
                                sentSuccessfully = true;
                                activeTabId = wTab.id; // Save successful tab ID
                                log('SUCCESS', `抓取引擎已在微信后台标签页 (ID: ${wTab.id}) 成功激活启动。`);
                                break;
                            } catch (err) {
                                console.warn(`[START_CRAWL] Failed to send message to tab ${wTab.id}:`, err.message);
                            }
                        }

                        if (!sentSuccessfully) {
                            log('ERROR', '发送指令至内容脚本失败: 未能在任何微信公众号标签页中建立连接。请在您的微信页面按 F5 刷新！');
                            sendCrawlStatus('error', '网络脚本通信失败: 微信标签页未响应，请刷新页面');
                        }
                    }

                    if (payload.type === 'CONTROL_CRAWL') {
                        const { action } = payload.data;
                        const tabs = await chrome.tabs.query({});
                        const wechatTabs = tabs.filter(t => t.url && t.url.includes('mp.weixin.qq.com'));
                        
                        if (activeTabId) {
                            const activeIndex = wechatTabs.findIndex(t => t.id === activeTabId);
                            if (activeIndex > 0) {
                                const [activeTab] = wechatTabs.splice(activeIndex, 1);
                                wechatTabs.unshift(activeTab);
                            }
                        }

                        let commandSent = false;
                        for (const wTab of wechatTabs) {
                            try {
                                await new Promise((resolve, reject) => {
                                    const timer = setTimeout(() => {
                                        reject(new Error('Communication timeout'));
                                    }, 500);
                                    chrome.tabs.sendMessage(wTab.id, { action: `${action}_repost_biz` }, (res) => {
                                        clearTimeout(timer);
                                        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                                        else resolve(res);
                                    });
                                });
                                commandSent = true;
                                log('INFO', `已发送【${action === 'pause' ? '暂停' : action === 'resume' ? '继续' : '中止'}】指令至微信后台 (ID: ${wTab.id})。`);
                            } catch (e) {
                                // Ignore failure of other closed/suspended tabs
                            }
                        }

                        if (!commandSent) {
                            log('ERROR', '指令下发失败: 未能在任何微信后台标签页中发送控制指令。');
                        }
                    }

                } catch (e) {
                    log('ERROR', `解析 WS 指令异常: ${e.message}`);
                }
            };

            ws.onclose = () => {
                log('ERROR', 'WebSocket 连接已断开！');
                setIndicator(wsDot, wsStatusLabel, 'red', '已断开');
                connectBtn.disabled = false;
                connectBtn.textContent = '连接';
                ws = null;
            };

            ws.onerror = (err) => {
                log('ERROR', 'WebSocket 出现通信错误，连接中断。');
                setIndicator(wsDot, wsStatusLabel, 'red', '错误断开');
                connectBtn.disabled = false;
                connectBtn.textContent = '连接';
                ws = null;
            };

        } catch (e) {
            log('ERROR', `创建 Socket 失败: ${e.message}`);
            setIndicator(wsDot, wsStatusLabel, 'red', '创建失败');
            connectBtn.disabled = false;
            connectBtn.textContent = '连接';
            ws = null;
        }
    }

    // Send real-time crawling status to WS Server
    function sendCrawlStatus(status, message) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'CRAWL_STATUS',
                data: {
                    status: status,
                    message: message
                }
            }));
        }
    }

    // Toggle Connect/Disconnect action
    connectBtn.addEventListener('click', () => {
        if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
            ws.close();
        } else {
            connectWS();
        }
    });

    // Clear logs button
    clearBtn.addEventListener('click', () => {
        logsContainer.innerHTML = '';
        log('INFO', '日志控制台已排空清净。');
    });

    // Load saved WS URL from chrome.storage
    chrome.storage.local.get(['savedWsUrl'], (res) => {
        if (res.savedWsUrl) {
            wsUrlInput.value = res.savedWsUrl;
        }
        // Auto-connect on open
        connectWS();
    });

    // Listen to network interceptions relayed by inject.js -> content.js
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (sender && sender.tab && sender.tab.id) {
            activeTabId = sender.tab.id;
        }

        if (message.action === 'log_network_json') {
            const data = message.data;
            if (!data) return;

            // 1. Intercept WxFingerprint if captured
            if (data.wxFingerprint) {
                latestWxFingerprint = data.wxFingerprint;
                capturedFpDiv.textContent = data.wxFingerprint;
                capturedFpDiv.style.color = '#10b981';
                log('SUCCESS', `🌟 拦截并捕获到微信最新安全指纹: ${data.wxFingerprint.substring(0, 12)}...`);
                sendClientState();
            }

            // 2. Intercept fetched repost articles and stream directly back to WS Server
            if (data.actionType === 'repost_list_fetched' && data.reposts) {
                log('SUCCESS', `📥 采集到查询【${data.query}】第 ${data.reposts.length} 条转载数据`);
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'CRAWL_DATA',
                        data: {
                            query: data.query,
                            articles: data.reposts
                        }
                    }));
                }
            }
        } 
        
        // 3. Intercept execution status events from content.js
        else if (message.action === 'repost_biz_status') {
            log('STATUS', `微信页面状态报文: [${message.status}] ${message.message}`);
            sendCrawlStatus(message.status, message.message);
        }
    });

    // Bind browser active page change hooks to sync auth token in real-time
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete') {
            scanWeChatSession();
        }
    });

    chrome.tabs.onActivated.addListener((activeInfo) => {
        scanWeChatSession();
    });

    // Initial scan
    scanWeChatSession();
});
