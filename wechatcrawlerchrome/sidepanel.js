document.addEventListener('DOMContentLoaded', function () {
    const logsContainer = document.getElementById('logs');
    const clearBtn = document.getElementById('clearBtn');
    const getDataBtn = document.getElementById('getDataBtn');

    const startBizBtn = document.getElementById('startBizBtn');
    const pauseBizBtn = document.getElementById('pauseBizBtn');
    const stopBizBtn = document.getElementById('stopBizBtn');
    const bizStatusText = document.getElementById('bizStatusText');

    // 用于保存拦截到的最新指纹
    let latestWxFingerprint = "";

    // 原生文件系统流控
    let csvFileHandle = null;
    let contentFileHandle = null;

    // 更新状态文本的辅助函数
    function updateStatus(element, text, color, bgColor) {
        if (!element) return;
        element.textContent = text;
        element.style.color = color;
        element.style.backgroundColor = bgColor;
    }

    // JSON 数组转 CSV 辅助函数 (不带表头)
    function arrayToCSVRows(dataArray, includeHeaders = false) {
        if (!dataArray || !dataArray.length) return "";
        const headers = ["nickname", "alias", "fakeid", "signature", "verify_status", "service_type", "round_head_img"];
        let csvContent = "";

        if (includeHeaders) {
            csvContent += "\uFEFF"; // BOM
            csvContent += headers.join(",") + "\r\n";
        }

        dataArray.forEach(item => {
            const row = headers.map(header => {
                let val = item[header] === null || item[header] === undefined ? "" : String(item[header]);
                if (val.search(/("|,|[\r\n])/g) >= 0) {
                    val = `"${val.replace(/"/g, '""')}"`;
                }
                return val;
            });
            csvContent += row.join(",") + "\r\n";
        });
        return csvContent;
    }

    // 真正的追加写入本地文件
    async function appendToLocalCSV(fileHandle, csvRowsString) {
        if (!fileHandle) return;
        try {
            // Chrome File System Access API
            const writable = await fileHandle.createWritable({ keepExistingData: true });
            // 获取文件当前大小，以便我们把指针移动到末尾追加
            const file = await fileHandle.getFile();
            const offset = file.size;

            await writable.write({ type: 'write', position: offset, data: csvRowsString });
            await writable.close();
            console.log("✅ [brbott] 已将新这批数据追加到本地 CSV 文件中！");
        } catch (e) {
            console.error("❌ [brbott] 写入本地 CSV 失败:", e);
        }
    }

    // 从 URL 提取 Token
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
            console.warn("Invalid URL for token extraction:", url);
            return null;
        }
    }

    // Tab 切换逻辑
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有 active 状态
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // 给当前点击的激活
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    clearBtn.addEventListener('click', () => {
        logsContainer.innerHTML = '';
    });

    getDataBtn.addEventListener('click', async () => {
        // 获取当前活动标签页
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        const currentUrl = tab?.url || tab?.pendingUrl;

        if (!currentUrl) {
            alert('无法获取当前标签页的链接。请确保插件已获取该网站权限或当前页不是Chrome内置页。');
            return;
        }

        const targetUrl = "https://mp.weixin.qq.com/cgi-bin/home";

        // 判断URL是否匹配 (忽略 query string 变动带来的微小差异，这里使用精确匹配用户提供的 URL)
        if (!currentUrl.includes(targetUrl)) {
            alert('请在指定的微信公众号后台主页点击此按钮：\n当前URL: ' + currentUrl + '\n目标URL: ' + targetUrl);
            return;
        }

        // 发送消息给 content script 去执行点击任务
        chrome.tabs.sendMessage(tab.id, { action: 'click_menu_data' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("发送点击命令失败:", chrome.runtime.lastError);
                if (chrome.runtime.lastError.message && chrome.runtime.lastError.message.includes('context invalidated')) {
                    alert('插件核心已更新，网页上遗留了旧版的脚本。请务必刷新整个微信网页！');
                } else if (!response) {
                    alert('联系不到网页脚本。请确保该微信页面已经完全加载，并且在插件更新后【刷新了整个微信页面】。');
                } else {
                    alert('发送组件出错: ' + chrome.runtime.lastError.message);
                }
                return;
            }
            if (response && response.success) {
                console.log('点击指令已发送并执行。');
            } else {
                alert('点击元素失败: ' + (response ? response.message : '未知错误'));
            }
        });

    });

    let currentTabId = null;

    startBizBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        currentTabId = tab?.id;
        const currentUrl = tab?.url || tab?.pendingUrl;

        if (!currentUrl) {
            alert('无法获取当前标签页的链接。');
            return;
        }

        // 尝试从当前页面的 URL (或最近的网络请求) 中获取 token
        const token = getTokenFromUrl(currentUrl);

        // 如果当前 URL 没有 token，提示用户
        if (!token) {
            alert('当前页面 URL 中找不到 token 参数，请确保你在微信公众号后台登录后的页面。');
            return;
        }

        if (!latestWxFingerprint) {
            alert('尚未拦截到官方 fingerprint，无法发送欺骗请求！\n请先在页面上随便点点（例如点开发布文章）以捕获风控指纹。');
            return;
        }

        const query = document.getElementById('queryInput').value.trim();
        if (!query) {
            alert('请输入搜索关键词！');
            return;
        }

        const maxPage = parseInt(document.getElementById('pageInput').value, 10) || 1;
        const delay = parseInt(document.getElementById('delayInput').value, 10) || 3000;

        // 启动前让用户选择或者创建一个本地 CSV 文件！
        try {
            const opts = {
                types: [{
                    description: 'CSV 文件',
                    accept: { 'text/csv': ['.csv'] },
                }],
                suggestedName: `search_biz_${query}_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.csv`
            };
            csvFileHandle = await window.showSaveFilePicker(opts);

            // 立即写入表头
            const initialWritable = await csvFileHandle.createWritable();
            await initialWritable.write(arrayToCSVRows([{}], true).split('\r\n')[0] + '\r\n'); // 只写表头和BOM
            await initialWritable.close();
        } catch (e) {
            // 用户取消了选择文件
            if (e.name !== 'AbortError') {
                alert('获取本地文件写入权限失败: ' + e.message);
            }
            return;
        }

        console.log(`🚀 [brbott] 准备发送 search_biz, Keyword: ${query}, Pages: ${maxPage}, Delay: ${delay}ms`);

        // Update UI state
        startBizBtn.disabled = true;
        pauseBizBtn.disabled = false;
        pauseBizBtn.textContent = '⏸️ 暂停';
        stopBizBtn.disabled = false;
        updateStatus(bizStatusText, '▶ 抓取中', '#27ae60', '#eafaf1');

        chrome.tabs.sendMessage(currentTabId, {
            action: 'fetch_search_biz',
            payload: {
                token: token,
                fingerprint: latestWxFingerprint,
                query: query,
                maxPage: maxPage,
                delay: delay
            }
        }, (response) => {
            if (chrome.runtime.lastError) {
                alert('发送指令失败: ' + chrome.runtime.lastError.message);
                updateStatus(bizStatusText, '❌ 发送失败', '#c0392b', '#fadbd8');
                startBizBtn.disabled = false;
                pauseBizBtn.disabled = true;
                stopBizBtn.disabled = true;
            } else {
                console.log('Search Biz 批量抓取任务已由后端接管');
            }
        });
    });

    pauseBizBtn.addEventListener('click', () => {
        if (!currentTabId) return;
        const isCurrentlyPaused = pauseBizBtn.textContent.includes('继续');

        if (isCurrentlyPaused) {
            pauseBizBtn.textContent = '⏸️ 暂停';
            pauseBizBtn.style.backgroundColor = '#f39c12';
            updateStatus(bizStatusText, '▶ 抓取中(已恢复)', '#27ae60', '#eafaf1');
            chrome.tabs.sendMessage(currentTabId, { action: 'resume_search_biz' });
        } else {
            pauseBizBtn.textContent = '▶️ 继续';
            pauseBizBtn.style.backgroundColor = '#2980b9'; // 蓝色
            updateStatus(bizStatusText, '⏸ 已暂停', '#d35400', '#fcf3cf');
            chrome.tabs.sendMessage(currentTabId, { action: 'pause_search_biz' });
        }
    });

    stopBizBtn.addEventListener('click', () => {
        if (!currentTabId) return;
        updateStatus(bizStatusText, '⏹ 正在停止...', '#c0392b', '#fadbd8');
        chrome.tabs.sendMessage(currentTabId, { action: 'stop_search_biz' });
    });

    // ============================================
    // === 2. 批量提取文章 (Content URL Fetch) ===
    // ============================================

    const csvFileInput = document.getElementById('csvFileInput');
    const csvLoadStatus = document.getElementById('csvLoadStatus');
    const startContentBtn = document.getElementById('startContentBtn');
    const pauseContentBtn = document.getElementById('pauseContentBtn');
    const stopContentBtn = document.getElementById('stopContentBtn');
    const contentStatusText = document.getElementById('contentStatusText');

    let loadedAccounts = [];

    // 简单 CSV 解析 (应对带有双引号的情况)
    function parseCSV(text) {
        const lines = text.split(/\r?\n/);
        const result = [];
        // 跳过第一行表头
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // 简单正则拆分，处理引号内包含逗号的情况（这是一个经典简易版黑科技）
            const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (parts.length >= 3) {
                // 去掉首尾引号
                const nickname = parts[0].replace(/^"|"$/g, '').replace(/""/g, '"');
                const fakeid = parts[2].replace(/^"|"$/g, '').replace(/""/g, '"');
                if (fakeid && fakeid !== 'undefined' && fakeid !== 'null') {
                    result.push({ nickname, fakeid });
                }
            }
        }
        return result;
    }

    csvFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (evt) {
            const text = evt.target.result;
            loadedAccounts = parseCSV(text);
            if (loadedAccounts.length > 0) {
                csvLoadStatus.textContent = `✅ 成功加载了 ${loadedAccounts.length} 个公众号！`;
                csvLoadStatus.style.color = '#27ae60';
            } else {
                csvLoadStatus.textContent = `❌ 解析失败或文件为空！`;
                csvLoadStatus.style.color = '#c0392b';
            }
        };
        reader.readAsText(file, 'utf-8');
    });

    startContentBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        currentTabId = tab?.id;
        const currentUrl = tab?.url || tab?.pendingUrl;

        if (!currentUrl) {
            alert('无法获取当前标签页的链接。');
            return;
        }

        const token = getTokenFromUrl(currentUrl);
        if (!token) {
            alert('未能在当前页面 URL 找到 token (请确保在公众号管理后台)。');
            return;
        }

        if (!latestWxFingerprint) {
            alert('尚未拦截到官方 fingerprint，请先点随意点击页面按钮触发网络请求拦截！');
            return;
        }

        if (loadedAccounts.length === 0) {
            alert('请先导入公众号 CSV 数据文件！');
            return;
        }

        const maxPage = parseInt(document.getElementById('contentPageInput').value, 10) || 5;
        const delay = parseInt(document.getElementById('contentDelayInput').value, 10) || 3000;

        // 启动前让用户选择或者创建一个本地 CSV 文件存储结果
        try {
            const opts = {
                types: [{
                    description: 'CSV 文件',
                    accept: { 'text/csv': ['.csv'] },
                }],
                suggestedName: `articles_data_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.csv`
            };
            contentFileHandle = await window.showSaveFilePicker(opts);
            const initialWritable = await contentFileHandle.createWritable();
            // 写入文章表头
            const headers = ["account_name", "fakeid", "appmsgid", "title", "digest", "link", "create_time"];
            await initialWritable.write("\uFEFF" + headers.join(",") + "\r\n");
            await initialWritable.close();
        } catch (e) {
            if (e.name !== 'AbortError') alert('写入权限获取失败: ' + e.message);
            return;
        }

        startContentBtn.disabled = true;
        pauseContentBtn.disabled = false;
        pauseContentBtn.textContent = '⏸️ 暂停';
        stopContentBtn.disabled = false;
        updateStatus(contentStatusText, '▶ 抓取中', '#27ae60', '#eafaf1');

        chrome.tabs.sendMessage(currentTabId, {
            action: 'fetch_content_biz',
            payload: {
                token: token,
                fingerprint: latestWxFingerprint,
                accounts: loadedAccounts,
                maxPage: maxPage,
                delay: delay
            }
        }, (response) => {
            if (chrome.runtime.lastError) {
                alert('发送指令失败: ' + chrome.runtime.lastError.message);
                updateStatus(contentStatusText, '❌ 发送失败', '#c0392b', '#fadbd8');
                startContentBtn.disabled = false;
                pauseContentBtn.disabled = true;
                stopContentBtn.disabled = true;
            }
        });
    });

    pauseContentBtn.addEventListener('click', () => {
        if (!currentTabId) return;
        const isCurrentlyPaused = pauseContentBtn.textContent.includes('继续');
        if (isCurrentlyPaused) {
            pauseContentBtn.textContent = '⏸️ 暂停';
            pauseContentBtn.style.backgroundColor = '#f39c12';
            updateStatus(contentStatusText, '▶ 抓取中(已恢复)', '#27ae60', '#eafaf1');
            chrome.tabs.sendMessage(currentTabId, { action: 'resume_content_biz' });
        } else {
            pauseContentBtn.textContent = '▶️ 继续';
            pauseContentBtn.style.backgroundColor = '#2980b9';
            updateStatus(contentStatusText, '⏸ 已暂停', '#d35400', '#fcf3cf');
            chrome.tabs.sendMessage(currentTabId, { action: 'pause_content_biz' });
        }
    });

    stopContentBtn.addEventListener('click', () => {
        if (!currentTabId) return;
        updateStatus(contentStatusText, '⏹ 正在停止...', '#c0392b', '#fadbd8');
        chrome.tabs.sendMessage(currentTabId, { action: 'stop_content_biz' });
    });

    // ============================================
    // === 3. 批量转载查询 (Repost Fetch) ===
    let repostFileHandle = null;
    const startRepostBtn = document.getElementById('startRepostBtn');
    const pauseRepostBtn = document.getElementById('pauseRepostBtn');
    const stopRepostBtn = document.getElementById('stopRepostBtn');
    const repostStatusText = document.getElementById('repostStatusText');
    const repostQueryInput = document.getElementById('repostQueryInput');
    const repostPageInput = document.getElementById('repostPageInput');
    const repostDelayInput = document.getElementById('repostDelayInput');

    startRepostBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        currentTabId = tab?.id;
        const currentTabUrl = tab?.url || tab?.pendingUrl;

        if (!currentTabId) {
            alert('当前没有连接到微信公众号后台页面，请打开页面并刷新。');
            return;
        }

        const queries = repostQueryInput.value.split('\n').map(q => q.trim()).filter(q => q.length > 0);
        if (queries.length === 0) {
            alert('请至少输入一个查询关键词或URL');
            return;
        }

        const maxPage = parseInt(repostPageInput.value, 10);
        const delay = parseInt(repostDelayInput.value, 10);
        const token = getTokenFromUrl(currentTabUrl);

        if (!token) {
            alert('未能在当前页面 URL 找到 token (请确保在公众号管理后台)。');
            return;
        }
        if (!latestWxFingerprint) {
            alert('尚未捕获到微信官方指纹，请在页面中随便点点产生网络请求以获取指纹！');
            return;
        }

        // 获取文件写入句柄
        try {
            const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
            const defaultFilename = `repost_data_${dateStr}.csv`;
            const handle = await window.showSaveFilePicker({
                suggestedName: defaultFilename,
                types: [{
                    description: 'CSV Files',
                    accept: { 'text/csv': ['.csv'] },
                }],
            });
            repostFileHandle = handle;

            const initialWritable = await repostFileHandle.createWritable();
            // 写入表头，加上 \uFEFF 以防 Excel 中文乱码
            const headers = ["query", "title", "author", "nickname", "article_type", "reprint_status", "url", "cover_url", "digest"];
            await initialWritable.write("\uFEFF" + headers.join(",") + "\r\n");
            await initialWritable.close();
        } catch (e) {
            if (e.name !== 'AbortError') alert('写入权限获取失败: ' + e.message);
            return;
        }

        startRepostBtn.disabled = true;
        pauseRepostBtn.disabled = false;
        pauseRepostBtn.textContent = '⏸️ 暂停';
        stopRepostBtn.disabled = false;
        updateStatus(repostStatusText, '▶ 查询中', '#27ae60', '#eafaf1');

        chrome.tabs.sendMessage(currentTabId, {
            action: 'fetch_repost_biz',
            payload: {
                token: token,
                fingerprint: latestWxFingerprint,
                queries: queries,
                maxPage: maxPage,
                delay: delay
            }
        }, (response) => {
            if (chrome.runtime.lastError) {
                alert('发送指令失败: ' + chrome.runtime.lastError.message);
                updateStatus(repostStatusText, '❌ 发送失败', '#c0392b', '#fadbd8');
                startRepostBtn.disabled = false;
                pauseRepostBtn.disabled = true;
                stopRepostBtn.disabled = true;
            }
        });
    });

    pauseRepostBtn.addEventListener('click', () => {
        if (!currentTabId) return;
        const isCurrentlyPaused = pauseRepostBtn.textContent.includes('继续');
        if (isCurrentlyPaused) {
            pauseRepostBtn.textContent = '⏸️ 暂停';
            pauseRepostBtn.style.backgroundColor = '#f39c12';
            updateStatus(repostStatusText, '▶ 查询中(已恢复)', '#27ae60', '#eafaf1');
            chrome.tabs.sendMessage(currentTabId, { action: 'resume_repost_biz' });
        } else {
            pauseRepostBtn.textContent = '▶️ 继续';
            pauseRepostBtn.style.backgroundColor = '#2980b9';
            updateStatus(repostStatusText, '⏸ 已暂停', '#d35400', '#fcf3cf');
            chrome.tabs.sendMessage(currentTabId, { action: 'pause_repost_biz' });
        }
    });

    stopRepostBtn.addEventListener('click', () => {
        if (!currentTabId) return;
        updateStatus(repostStatusText, '⏹ 正在停止...', '#c0392b', '#fadbd8');
        chrome.tabs.sendMessage(currentTabId, { action: 'stop_repost_biz' });
    });

    // ============================================

    // 监听来自 content.js 的消息
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message.action === 'log_network_json') {
            const data = message.data;
            const entry = document.createElement('div');
            entry.className = 'log-entry';

            const method = document.createElement('span');
            method.className = 'log-method';
            method.textContent = `[${data.requestMethod}] `;

            const url = document.createElement('span');
            url.className = 'log-url';
            url.textContent = data.requestUrl;

            const pre = document.createElement('pre');
            pre.style.margin = "0";
            pre.style.whiteSpace = "pre-wrap";
            // 格式化输出 JSON
            const jsonStr = JSON.stringify(data.responseBody, null, 2);
            // 限制单条日志显示长度，以防止卡死
            pre.textContent = jsonStr.length > 3000 ? jsonStr.substring(0, 3000) + '\n... [已截断]' : jsonStr;

            entry.appendChild(method);
            entry.appendChild(url);

            // 如果抓到了官方微信指纹，特别高亮显示出来
            if (data.wxFingerprint) {
                const wxFpDiv = document.createElement('div');
                wxFpDiv.style.backgroundColor = '#f1c40f'; // 黄色高亮
                wxFpDiv.style.color = '#2c3e50';
                wxFpDiv.style.padding = '5px';
                wxFpDiv.style.marginTop = '5px';
                wxFpDiv.style.borderRadius = '3px';
                wxFpDiv.style.fontSize = '12px';
                wxFpDiv.style.fontWeight = 'bold';
                wxFpDiv.innerHTML = `🌟 捕获到官方微信指纹 (可直接用于发包): <span style="user-select:all">${data.wxFingerprint}</span>`;
                entry.appendChild(wxFpDiv);

                // 更新全局变量和顶部显示栏
                latestWxFingerprint = data.wxFingerprint;
                window.updateTopWxFingerprint(data.wxFingerprint);
            }

            entry.appendChild(pre);

            // 插入到最顶部
            logsContainer.insertBefore(entry, logsContainer.firstChild);

            // ✅ 针对 search_biz 追加写入
            if (data.responseBody && data.responseBody.list && Array.isArray(data.responseBody.list) && csvFileHandle) {
                const csvStr = arrayToCSVRows(data.responseBody.list, false);
                if (csvStr) {
                    appendToLocalCSV(csvFileHandle, csvStr);
                }
            }

            // ✅ 针对 content_biz (文章列表) 追加写入
            if (data.actionType === 'article_list_fetched' && data.articles && contentFileHandle) {
                // 自己组装 CSV (account, fakeid, appmsgid, title, digest, link, create_time)
                let csvStr = "";
                data.articles.forEach(art => {
                    const row = [
                        data.accountName,
                        data.fakeid,
                        art.appmsgid || "",
                        art.title || "",
                        art.digest || "",
                        art.link || "",
                        art.create_time || ""
                    ].map(val => {
                        let text = String(val);
                        if (text.search(/("|,|[\r\n])/g) >= 0) {
                            text = `"${text.replace(/"/g, '""')}"`;
                        }
                        return text;
                    });
                    csvStr += row.join(",") + "\r\n";
                });
                if (csvStr) {
                    appendToLocalCSV(contentFileHandle, csvStr);
                }
            }

            // ✅ 针对 repost_biz (转载列表) 追加写入
            if (data.actionType === 'repost_list_fetched' && data.reposts && repostFileHandle) {
                // headers: ["query", "title", "author", "nickname", "article_type", "reprint_status", "url", "cover_url", "digest"]
                let csvStr = "";
                data.reposts.forEach(art => {
                    const reprint_status = (art.source_reprint_status !== undefined) ? String(art.source_reprint_status) : (art.status !== undefined ? String(art.status) : "");
                    const row = [
                        data.query,
                        art.title || "",
                        art.author || "",
                        art.nickname || "",
                        art.article_type || "",
                        reprint_status,
                        art.url || "",
                        art.cover_url || "",
                        art.digest || ""
                    ].map(val => {
                        let text = String(val);
                        if (text.search(/("|,|[\r\n])/g) >= 0) {
                            text = `"${text.replace(/"/g, '""')}"`;
                        }
                        return text;
                    });
                    csvStr += row.join(",") + "\r\n";
                });
                if (csvStr) {
                    appendToLocalCSV(repostFileHandle, csvStr);
                }
            }
        } else if (message.type === 'fingerprint_components') {
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.style.border = '2px solid #e74c3c'; // 红色高亮边框
            entry.style.backgroundColor = '#fdf2f0';

            const title = document.createElement('strong');
            title.style.color = '#c0392b';
            title.textContent = '🚨 [核弹级发现] 拦截到微信构建指纹的底层组件(Components)！';
            entry.appendChild(title);

            const pre = document.createElement('pre');
            pre.style.fontSize = '11px';
            pre.style.whiteSpace = 'pre-wrap';
            pre.style.wordBreak = 'break-all';
            pre.style.maxHeight = '300px';
            pre.style.overflow = 'auto';
            pre.textContent = JSON.stringify(message.data, null, 2);
            entry.appendChild(pre);

            logsContainer.insertBefore(entry, logsContainer.firstChild);
        } else if (message.action === 'search_biz_status') {
            // content.js 报告的抓取状态：完成、停止或失败
            if (message.status === 'completed' || message.status === 'stopped' || message.status === 'error') {
                startBizBtn.disabled = false;
                pauseBizBtn.disabled = true;
                stopBizBtn.disabled = true;
                pauseBizBtn.textContent = '⏸️ 暂停';
                pauseBizBtn.style.backgroundColor = '#f39c12';

                if (message.status === 'completed') {
                    updateStatus(bizStatusText, '✅ 抓取完成', '#16a085', '#d1f2eb');
                } else if (message.status === 'stopped') {
                    updateStatus(bizStatusText, '⏹ 已手动停止', '#c0392b', '#fadbd8');
                } else if (message.status === 'error') {
                    updateStatus(bizStatusText, '❌ 报错中止', '#c0392b', '#fadbd8');
                }

                // 释放本地文件流控句柄，使得资源能被回收、也可以开始下一轮全新抓取
                if (csvFileHandle) {
                    csvFileHandle = null;
                    console.log("✅ [brbott] 当前批次任务结束，本地 CSV 文件排他写入句柄已释放！");
                }
            }
        } else if (message.action === 'content_biz_status') {
            // content.js 报告的获取文章状态
            if (message.status === 'completed' || message.status === 'stopped' || message.status === 'error') {
                startContentBtn.disabled = false;
                pauseContentBtn.disabled = true;
                stopContentBtn.disabled = true;
                pauseContentBtn.textContent = '⏸️ 暂停';
                pauseContentBtn.style.backgroundColor = '#f39c12';

                if (message.status === 'completed') {
                    updateStatus(contentStatusText, '✅ 提取完成', '#16a085', '#d1f2eb');
                } else if (message.status === 'stopped') {
                    updateStatus(contentStatusText, '⏹ 已手动停止', '#c0392b', '#fadbd8');
                } else if (message.status === 'error') {
                    updateStatus(contentStatusText, '❌ 报错中止', '#c0392b', '#fadbd8');
                }

                if (contentFileHandle) {
                    contentFileHandle = null;
                    console.log("✅ [brbott] Content 获取任务结束，本地写入句柄已释放！");
                }
            }
        } else if (message.action === 'repost_biz_status') {
            // content.js 报告的获取转载状态
            if (message.status === 'completed' || message.status === 'stopped' || message.status === 'error') {
                startRepostBtn.disabled = false;
                pauseRepostBtn.disabled = true;
                stopRepostBtn.disabled = true;
                pauseRepostBtn.textContent = '⏸️ 暂停';
                pauseRepostBtn.style.backgroundColor = '#f39c12';

                if (message.status === 'completed') {
                    updateStatus(repostStatusText, '✅ 查询完成', '#16a085', '#d1f2eb');
                } else if (message.status === 'stopped') {
                    updateStatus(repostStatusText, '⏹ 已手动停止', '#c0392b', '#fadbd8');
                } else if (message.status === 'error') {
                    updateStatus(repostStatusText, '❌ 报错中止', '#c0392b', '#fadbd8');
                }

                if (repostFileHandle) {
                    repostFileHandle = null;
                    console.log("✅ [brbott] Repost 查询任务结束，本地写入句柄已释放！");
                }
            }
        }
    });

    // 初始化并获取指纹 (通过全局变量 FingerprintJS 因为我们在 HTML 里引入了 UMD 版)
    async function initFingerprint() {
        if (window.FingerprintJS) {
            try {
                const fp = await window.FingerprintJS.load();
                const result = await fp.get();
                const visitorId = result.visitorId;

                console.log("🚀 [brbott] 浏览器开源指纹 ID:", visitorId);

                // 将指纹显示在侧边栏顶部，方便查看
                const header = document.querySelector('h1');

                // 专门显示微信被盗指纹的占位符
                const wxFpDisplay = document.createElement('div');
                wxFpDisplay.id = 'wxFpDisplay';
                wxFpDisplay.style.fontSize = '12px';
                wxFpDisplay.style.color = '#d35400';
                wxFpDisplay.style.marginBottom = '5px';
                wxFpDisplay.innerHTML = `微信官方拦截指纹: <strong>等待网络请求...</strong>`;
                header.parentNode.insertBefore(wxFpDisplay, header.nextSibling);

                // 开源指纹
                const fpDisplay = document.createElement('div');
                fpDisplay.style.fontSize = '12px';
                fpDisplay.style.color = '#7f8c8d';
                fpDisplay.style.marginBottom = '10px';
                fpDisplay.innerHTML = `浏览器本地开源指纹: <strong>${visitorId}</strong>`;
                header.parentNode.insertBefore(fpDisplay, header.nextSibling);

            } catch (e) {
                console.error("❌ [brbott] 获取浏览器指纹失败:", e);
            }
        } else {
            console.warn("⚠️ FingerprintJS 库未成功加载");
        }
    }

    initFingerprint();
});

// 全局更新顶部微信指纹的方法
window.updateTopWxFingerprint = function (fp) {
    if (fp && fp !== "undefined" && fp !== "null") {
        const display = document.getElementById('wxFpDisplay');
        if (display) {
            display.innerHTML = `微信官方拦截指纹 (已就绪): <strong><span style="user-select:all; background:#f1c40f; padding:2px;">${fp}</span></strong>`;
        }
        // 更新全局变量供发包按钮使用
        // HACK: 因为 sidepanel.js 内容都在 DOMContentLoaded 闭包里，我们借助一个自定义事件把值传进去，或者直接让前面定义的变量挂载到 window
        window._latestWxFp = fp;
    }
}
