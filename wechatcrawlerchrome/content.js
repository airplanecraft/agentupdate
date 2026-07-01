console.log("brbott 插件内容脚本已加载到页面: " + window.location.href);

// 全局控制状态
let isSearchBizPaused = false;
let isSearchBizStopped = false;

let isContentBizPaused = false;
let isContentBizStopped = false;
let isRepostBizPaused = false;
let isRepostBizStopped = false;
let repostBizStopReason = '';
// 监听来自 inject.js (MAIN world) 的消息
window.addEventListener('message', function (event) {
    // 确保消息来自我们自己的注入脚本
    if (event.source !== window || !event.data || event.data.source !== 'brbott-interceptor') {
        return;
    }

    if (event.data.type === 'network_json') {
        // 转发给后台或侧边栏
        try {
            // 安全检查：如果扩展上下文失效，直接退出，不要抛出异常
            if (!chrome.runtime || !chrome.runtime.id) {
                return;
            }

            chrome.runtime.sendMessage({
                action: 'log_network_json',
                data: event.data
            }, () => {
                if (chrome.runtime.lastError) {
                    // 当侧边栏没有打开时，sendMessage 会因为没有接收方而报错，属于正常现象，我们忽略这个错误
                }
            });
        } catch (e) {
            // 如果捕获到 context invalidated 错误，静默忽略
            if (e.message && e.message.includes('context invalidated')) {
                return;
            }
            console.error("brbott 发送消息失败:", e);
        }
    }
});
// 辅助函数：模拟鼠标悬停 (更加暴力，涵盖更多种类的事件)
function simulateHover(element) {
    const events = ['mouseover', 'mouseenter', 'pointerover', 'pointerenter', 'mousemove'];
    events.forEach(eventType => {
        const event = new MouseEvent(eventType, {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: element.getBoundingClientRect().x + 10,
            clientY: element.getBoundingClientRect().y + 10
        });
        element.dispatchEvent(event);
    });
}

// 辅助睡眠函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 监听来自后台或侧边栏的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'click_menu_data') {
        // 由于这包含一系列异步操作，我们通过立即执行的 async 函数包裹
        (async () => {
            try {
                // 1. 原有的点击：#menu_10125 > span > span
                const menuElement = document.querySelector('#menu_10125 > span > span');
                if (menuElement) {
                    console.log('✅ [brbott] 找到第一步菜单，正在触发点击...', menuElement);
                    menuElement.click();
                    // 等待页面渲染或者跳转结束前的一些过渡动画
                    await sleep(1500);
                } else {
                    console.warn('⚠️ [brbott] 未找到菜单元素，尝试直接进行后续步骤...');
                }

                // 2. 将鼠标移动到特定的卡片上方
                const cardSelector = '#js_main > div.weui-desktop-panel.weui-desktop-panel_transparent > div.weui-desktop-panel__bd > div > div > div > div:nth-child(1) > div > div > div.weui-desktop-card__inner';
                const cardElement = document.querySelector(cardSelector);
                if (!cardElement) {
                    throw new Error('未找到目标卡片元素: ' + cardSelector);
                }

                console.log('✅ [brbott] 找到卡片元素，开始模拟鼠标悬停...');
                simulateHover(cardElement);

                const parentPanelSelector = '#js_main > div.weui-desktop-panel.weui-desktop-panel_transparent > div.weui-desktop-panel__bd > div > div > div > div:nth-child(1) > div > div';
                const parentPanel = document.querySelector(parentPanelSelector);

                if (parentPanel) {
                    // 暴力加倍：直接把包含写文章按钮的那个隐藏容器强制显示出来（微信的这层面板通常是通过类名控制状态或 display:none）
                    const addPanel = parentPanel.querySelector('.preview_media_add_panel');
                    if (addPanel) {
                        addPanel.style.display = 'block';
                        addPanel.style.visibility = 'visible';
                        addPanel.style.opacity = '1';
                        // 有的大厂前端会依据父级 hover className 显示
                        parentPanel.classList.add('hover');
                    }
                }

                // 等待下拉莱单/浮层强制展现
                await sleep(500);

                // 3. 点击“写文章”
                const writeArticleSelector = '#js_main > div.weui-desktop-panel.weui-desktop-panel_transparent > div.weui-desktop-panel__bd > div > div > div > div:nth-child(1) > div > div > div.preview_media_add_panel > ul > li:nth-child(1) > a';
                const writeArticleBtn = document.querySelector(writeArticleSelector);
                if (!writeArticleBtn) {
                    throw new Error('悬停/强显后未找到"写文章"按钮: ' + writeArticleSelector);
                }

                console.log('✅ [brbott] 找到"写文章"按钮，正在点击...', writeArticleBtn);
                // 确保点击能穿透，部分框架会阻止不可见元素的冒泡
                writeArticleBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                // 补充原生的 click 万无一失
                writeArticleBtn.click();

                sendResponse({ success: true, message: '第一阶段操作（新建文章）触发成功，等待新标签页打开' });
            } catch (error) {
                console.error('❌ [brbott] 自动发文流程发生错误:', error);
                sendResponse({ success: false, message: error.toString() });
            }
        })();

        return true; // 必填：保持异步通道打开
    } else if (request.action === 'pause_search_biz') {
        isSearchBizPaused = true;
        console.log("⏸️ [brbott] 收到暂停指令...");
        sendResponse({ success: true });
    } else if (request.action === 'resume_search_biz') {
        isSearchBizPaused = false;
        console.log("▶️ [brbott] 收到继续指令...");
        sendResponse({ success: true });
    } else if (request.action === 'stop_search_biz') {
        isSearchBizStopped = true;
        isSearchBizPaused = false; // 取消暂停锁
        console.log("⏹️ [brbott] 收到停止指令...");
        sendResponse({ success: true });

        // ===================================
        // === 批量提取文章 (Content URL Fetch) ===
        // ===================================

    } else if (request.action === 'pause_repost_biz') {
        isRepostBizPaused = true;
        console.log("⏸️ [brbott|Repost] 收到暂停指令...");
        sendResponse({ success: true });
    } else if (request.action === 'resume_repost_biz') {
        isRepostBizPaused = false;
        console.log("▶️ [brbott|Repost] 收到继续指令...");
        sendResponse({ success: true });
    } else if (request.action === 'stop_repost_biz') {
        isRepostBizStopped = true;
        isRepostBizPaused = false;
        console.log("⏹️ [brbott|Repost] 收到停止指令...");
        sendResponse({ success: true });

    } else if (request.action === 'pause_content_biz') {
        isContentBizPaused = true;
        console.log("⏸️ [brbott|Content] 收到暂停指令...");
        sendResponse({ success: true });
    } else if (request.action === 'resume_content_biz') {
        isContentBizPaused = false;
        console.log("▶️ [brbott|Content] 收到继续指令...");
        sendResponse({ success: true });
    } else if (request.action === 'stop_content_biz') {
        isContentBizStopped = true;
        isContentBizPaused = false;
        console.log("⏹️ [brbott|Content] 收到停止指令...");
        sendResponse({ success: true });
    } else if (request.action === 'fetch_content_biz') {
        sendResponse({ success: true, message: '批量拉取文章任务已启动' });
        (async () => {
            const payload = request.payload || request;
            const { token, fingerprint, accounts, maxPage, delay } = payload;
            const count = 5; // 微信每次默认返回 5 条文章

            isContentBizPaused = false;
            isContentBizStopped = false;

            console.log(`🚀 [brbott] 开始批量提取文章, 共 ${accounts.length} 个公众号, 每个公众号最多 ${maxPage} 页...`);

            try {
                // 外层循环：遍历所有上传的公众号
                for (let i = 0; i < accounts.length; i++) {
                    if (isContentBizStopped) {
                        console.log("⏹️ [brbott|Content] 总任务已停止");
                        break;
                    }

                    const account = accounts[i];
                    console.log(`\n\n📡 [brbott|Content] >>> 开始提取第 ${i + 1}/${accounts.length} 个公众号: [${account.nickname}]`);

                    // 内层循环：为每一个公众号进行翻页查询
                    for (let page = 0; page < maxPage; page++) {
                        if (isContentBizStopped) {
                            console.log("⏹️ [brbott|Content] 翻页任务被停止");
                            break;
                        }

                        while (isContentBizPaused && !isContentBizStopped) {
                            await sleep(500);
                        }
                        if (isContentBizStopped) break;

                        const begin = page * count;

                        // 从 URL 参数可知，这里的 api 改为了 appmsgpublish
                        const targetUrl = `https://mp.weixin.qq.com/cgi-bin/appmsgpublish?sub=list&search_field=null&begin=${begin}&count=${count}&query=&fakeid=${account.fakeid}&type=101_1&free_publish_type=1&sub_action=list_ex&fingerprint=${fingerprint}&token=${token}&lang=zh_CN&f=json&ajax=1`;

                        console.log(`⏳ 正在请求 [${account.nickname}] 的第 ${page + 1} 页 (begin=${begin}):`, targetUrl);

                        // 进行网络请求
                        const res = await fetch(targetUrl, {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json, text/javascript, */*; q=0.01',
                                'X-Requested-With': 'XMLHttpRequest',
                            }
                        });

                        const data = await res.json();
                        console.log(`✅ [${account.nickname}] 第 ${page + 1} 页原始响应:`, data);

                        let extractedArticles = [];
                        let totalCount = 0;

                        // 遇到 invalid session 等错误立即中止全部任务
                        if (data && data.base_resp && data.base_resp.ret !== 0) {
                            console.error(`❌ [brbott|Content] 微信返回错误状态码 ${data.base_resp.ret}, 提早终止！`);
                            isContentBizStopped = true;
                            break;
                        }

                        // 解析 publish_page 里的嵌套 JSON
                        if (data && data.publish_page) {
                            try {
                                const publishPageObj = JSON.parse(data.publish_page);
                                totalCount = publishPageObj.total_count || 0;

                                if (publishPageObj.publish_list && Array.isArray(publishPageObj.publish_list)) {
                                    publishPageObj.publish_list.forEach(item => {
                                        if (item.publish_info) {
                                            try {
                                                const publishInfoObj = JSON.parse(item.publish_info);
                                                if (publishInfoObj.appmsgex && Array.isArray(publishInfoObj.appmsgex)) {
                                                    extractedArticles.push(...publishInfoObj.appmsgex);
                                                }
                                            } catch (e) {
                                                console.warn("⚠️ 解析 publish_info 失败", e);
                                            }
                                        }
                                    });
                                }
                            } catch (e) {
                                console.error("❌ 解析 publish_page 失败:", e);
                            }
                        }

                        // 我们将获取到的内容发送给 SidePanel
                        window.postMessage({
                            source: 'brbott-interceptor',
                            type: 'network_json',
                            requestUrl: `[Content ${account.nickname} Page ${page + 1}/${maxPage}] ` + targetUrl,
                            requestMethod: 'GET',
                            responseBody: data,
                            wxFingerprint: fingerprint,
                            // 自定义补充字段，方便 sidepanel.js 转 CSV 时知道归属和解析目标
                            actionType: 'article_list_fetched',
                            accountName: account.nickname,
                            fakeid: account.fakeid,
                            articles: extractedArticles
                        }, '*');

                        // ====== 翻页结束判定 ======
                        // 如果当前页提取出的文章为空，说明没数据了
                        if (totalCount === 0 || extractedArticles.length === 0) {
                            console.log(`✅ [brbott|Content] 发现 [${account.nickname}] 的文章已见底 (当前页0篇)，停止该账号后续翻页！`);
                            break;
                        }

                        // 如果没被取消，我们对每个请求间隙设置 delay，防止请求过快被封号
                        if ((page < maxPage - 1) || (i < accounts.length - 1)) {
                            // 稍微加点随机性防封 (基础延迟 + 0~1000ms 随机)
                            const currentDelay = delay + Math.floor(Math.random() * 1000);
                            console.log(`💤 等待 ${currentDelay} 毫秒后继续...`);

                            // 分段 sleep 以便中间可以被及时唤起或打断
                            let waited = 0;
                            while (waited < currentDelay && !isContentBizStopped) {
                                await sleep(100);
                                waited += 100;
                                while (isContentBizPaused && !isContentBizStopped) {
                                    await sleep(500);
                                }
                            }
                        }
                    } // end of pages loop

                    // 如果中途大任务被终止了，也跳出外面的账户循环
                    if (isContentBizStopped) break;

                } // end of accounts loop

                // 等待队列中的 message 事件处理完毕，避免最后一条数据还没写入文件句柄就被 close
                await sleep(500);

                const finalStatus = isContentBizStopped ? 'stopped' : 'completed';
                chrome.runtime.sendMessage({ action: 'content_biz_status', status: finalStatus });

            } catch (e) {
                console.error('❌ [brbott|Content] 批量抓取中途失败:', e);
                chrome.runtime.sendMessage({ action: 'content_biz_status', status: 'error' });
            }
        })();

        return true;
    } else if (request.action === 'fetch_repost_biz') {
        sendResponse({ success: true, message: '微信后台转载抓取任务已成功接收并启动' });
        (async () => {
            const payload = request.payload || request;
            const { token, fingerprint, queries, maxPage, delay } = payload;
            const count = 20; // 从示例来看一次取10条

            isRepostBizPaused = false;
            isRepostBizStopped = false;
            repostBizStopReason = '';

            console.log(`🚀 [brbott] 开始批量查询文章转载, 共 ${queries.length} 个查询项...`);

            try {
                for (let i = 0; i < queries.length; i++) {
                    const query = queries[i];
                    if (isRepostBizStopped) break;

                    console.log(`▶️ [brbott|Repost] 正在处理第 ${i + 1}/${queries.length} 项: ${query}`);

                    let currentMaxPage = maxPage === 0 ? Infinity : maxPage;

                    for (let page = 0; page < currentMaxPage; page++) {
                        if (isRepostBizStopped) {
                            console.log("⏹️ [brbott|Repost] 任务已停止");
                            break;
                        }
                        while (isRepostBizPaused && !isRepostBizStopped) {
                            await sleep(500);
                        }
                        if (isRepostBizStopped) break;

                        const begin = page * count;
                        const targetUrl = `https://mp.weixin.qq.com/cgi-bin/operate_appmsg?sub=check_appmsg_copyright_stat`;

                        const formData = new URLSearchParams();
                        formData.append('token', token);
                        formData.append('lang', 'zh_CN');
                        formData.append('f', 'json');
                        formData.append('ajax', '1');
                        formData.append('fingerprint', fingerprint);
                        formData.append('random', Math.random().toString());
                        formData.append('url', query);
                        formData.append('allow_reprint', '0');
                        formData.append('begin', begin.toString());
                        formData.append('count', count.toString());

                        console.log(`⏳ 正在查询 [${query}] 的第 ${page + 1} 页:`, targetUrl);

                        const res = await fetch(targetUrl, {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json, text/javascript, */*; q=0.01',
                                'X-Requested-With': 'XMLHttpRequest',
                                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                            },
                            body: formData.toString()
                        });

                        const data = await res.json();
                        console.log(`✅ [${query}] 第 ${page + 1} 页响应:`, data);

                        if (data && data.base_resp && data.base_resp.ret !== 0) {
                            const errMsg = data.base_resp.err_msg || data.base_resp.errmsg || '微信接口未返回详细错误';
                            const stopReason = `微信接口返回错误 (ret: ${data.base_resp.ret}, msg: ${errMsg})`;
                            console.error(`❌ [brbott|Repost] ${stopReason}, 提早终止！`);
                            repostBizStopReason = stopReason;
                            isRepostBizStopped = true;
                            break;
                        }

                        if (maxPage === 0 && page === 0) {
                            let total = data.total !== undefined ? data.total : (data.total_num !== undefined ? data.total_num : (data.total_count !== undefined ? data.total_count : -1));
                            if (total >= 0) {
                                currentMaxPage = Math.ceil(total / count);
                                if (currentMaxPage === 0) currentMaxPage = 1;
                                console.log(`💡 [brbott|Repost] [${query}] 自动推算总页数为 ${currentMaxPage} 页 (总条数: ${total})`);
                            }
                        }

                        let extractedReposts = [];
                        if (data && data.list && Array.isArray(data.list)) {
                            extractedReposts = data.list;
                        }

                        window.postMessage({
                            source: 'brbott-interceptor',
                            type: 'network_json',
                            requestUrl: `[Repost ${query} Page ${page + 1}/${maxPage}] ` + targetUrl,
                            requestMethod: 'POST',
                            responseBody: data,
                            wxFingerprint: fingerprint,
                            actionType: 'repost_list_fetched',
                            query: query,
                            reposts: extractedReposts
                        }, '*');

                        if (extractedReposts.length === 0) {
                            console.log(`✅ [brbott|Repost] [${query}] 数据已见底(本页返回0条)，自动停止后续翻页！`);
                            break;
                        }

                        if (page < currentMaxPage - 1 && !isRepostBizStopped) {
                            const currentDelay = delay + Math.floor(Math.random() * 1000);
                            let waited = 0;
                            while (waited < currentDelay && !isRepostBizStopped) {
                                await sleep(100);
                                waited += 100;
                                while (isRepostBizPaused && !isRepostBizStopped) await sleep(500);
                            }
                        }
                    }
                    if (isRepostBizStopped) break;

                    // 不同查询项之间的间隔
                    if (i < queries.length - 1 && !isRepostBizStopped) {
                        const currentDelay = delay + Math.floor(Math.random() * 1000);
                        let waited = 0;
                        while (waited < currentDelay && !isRepostBizStopped) {
                            await sleep(100);
                            waited += 100;
                            while (isRepostBizPaused && !isRepostBizStopped) await sleep(500);
                        }
                    }
                }

                // 等待队列中的 message 事件处理完毕，避免最后一条数据还没写入文件句柄就被 close
                await sleep(500);

                const finalStatus = isRepostBizStopped ? 'stopped' : 'completed';
                chrome.runtime.sendMessage({ 
                    action: 'repost_biz_status', 
                    status: finalStatus,
                    message: isRepostBizStopped ? (repostBizStopReason || '任务已中止') : '所有查询项全部执行完毕'
                });

            } catch (e) {
                console.error('❌ [brbott|Repost] 批量查询中途失败:', e);
                chrome.runtime.sendMessage({ action: 'repost_biz_status', status: 'error' });
            }
        })();
    } else if (request.action === 'fetch_search_biz') {
        sendResponse({ success: true, message: 'Search Biz抓取任务已启动' });
        (async () => {
            const payload = request.payload || request;
            const { token, fingerprint, query, maxPage, delay } = payload;
            const count = 5; // 微信每次默认返回 5 条
            const results = [];

            // 初始化状态
            isSearchBizPaused = false;
            isSearchBizStopped = false;

            console.log(`🚀 [brbott] 开始批量拉取 Search Biz, 预计 ${maxPage} 页...`);

            try {
                for (let page = 0; page < maxPage; page++) {
                    if (isSearchBizStopped) {
                        console.log("⏹️ [brbott] 任务已停止");
                        break;
                    }

                    while (isSearchBizPaused && !isSearchBizStopped) {
                        await sleep(500);
                    }

                    if (isSearchBizStopped) {
                        break;
                    }

                    const begin = page * count;

                    // 构造微信官方的精确搜索接口 URL
                    const targetUrl = `https://mp.weixin.qq.com/cgi-bin/searchbiz?action=search_biz&begin=${begin}&count=${count}&query=${encodeURIComponent(query)}&fingerprint=${fingerprint}&token=${token}&lang=zh_CN&f=json&ajax=1`;

                    console.log(`⏳ [brbott] 正在请求第 ${page + 1} 页 (begin=${begin}):`, targetUrl);

                    // 进行网络请求
                    const res = await fetch(targetUrl, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json, text/javascript, */*; q=0.01',
                            'X-Requested-With': 'XMLHttpRequest',
                        }
                    });

                    const data = await res.json();
                    console.log(`✅ [brbott] 第 ${page + 1} 页响应:`, data);

                    if (data && data.list && Array.isArray(data.list)) {
                        results.push(...data.list);
                    }

                    // 我们直接把结果也打印到 SidePanel 去
                    window.postMessage({
                        source: 'brbott-interceptor',
                        type: 'network_json',
                        requestUrl: `[Page ${page + 1}/${maxPage}] ` + targetUrl,
                        requestMethod: 'GET',
                        responseBody: data,
                        wxFingerprint: fingerprint // 保持原来高亮指纹逻辑
                    }, '*');

                    // 遇到错误如 {"base_resp":{"ret":200003,"err_msg":"invalid session"}} 应该尽早退出
                    if (data && data.base_resp && data.base_resp.ret !== 0) {
                        console.error(`❌ [brbott] 微信返回错误状态码 ${data.base_resp.ret}, 提早终止后续翻页！`);
                        break;
                    }

                    // ====== 核心增加：翻页结束判定 ======
                    // 1. 如果总数为 0，根本没数据
                    // 2. 如果当前这页返回的 list 已经是空的，说明翻到底了
                    if (data.total === 0 || !data.list || data.list.length === 0) {
                        console.log(`✅ [brbott] 发现数据已见底 (Total: ${data.total}, 当前页数量: ${data.list ? data.list.length : 0})，自动停止后续翻页！`);
                        break;
                    }

                    // 如果不是最后一页，且没被取消，就等待指定时间
                    if (page < maxPage - 1 && !isSearchBizStopped) {
                        // 稍微加点随机性防封 (基础延迟 + 0~1000ms 随机)
                        const currentDelay = delay + Math.floor(Math.random() * 1000);
                        console.log(`💤 等待 ${currentDelay} 毫秒后继续...`);

                        // 分段 sleep 以便中间可以被及时唤起或打断
                        let waited = 0;
                        while (waited < currentDelay && !isSearchBizStopped) {
                            await sleep(100);
                            waited += 100;
                            // 如果在等待期间被暂停了，就卡死在这里
                            while (isSearchBizPaused && !isSearchBizStopped) {
                                await sleep(500);
                            }
                        }
                    }
                }

                // 等待队列中的 message 事件处理完毕，避免最后一条数据还没写入文件句柄就被 close
                await sleep(500);

                const finalStatus = isSearchBizStopped ? 'stopped' : 'completed';
                chrome.runtime.sendMessage({ action: 'search_biz_status', status: finalStatus });

            } catch (e) {
                console.error('❌ [brbott] Search Biz 批量抓取中途失败:', e);
                chrome.runtime.sendMessage({ action: 'search_biz_status', status: 'error' });
            }
        })();
    }
});

// 监听页面加载，专门处理“新标签页被打开”之后的自动点击逻辑
// 根据用户的指令："跳转到新tab的界面，点击#js_editor_insertlink > span超链接"
(async function handleNewEditorTab() {
    // 微信公众号编辑器的URL特征通常包含 /cgi-bin/appmsg?t=media/appmsg_edit
    if (window.location.href.includes('appmsg_edit')) {
        console.log('🚀 [brbott] 检测到编辑器标签页已打开，准备执行第二阶段点击');

        // 由于编辑器结构复杂且加载慢，我们需要不断轮询探测目标元素
        let retries = 0;
        const maxRetries = 20; // 最多尝试20次，每次间隔1秒 (总共20秒)

        const checkAndClickLink = async () => {
            const linkSpan = document.querySelector('#js_editor_insertlink > span');
            if (linkSpan) {
                console.log('✅ [brbott] 找到【超链接】按钮，执行点击...', linkSpan);
                linkSpan.click();
            } else if (retries < maxRetries) {
                retries++;
                console.log(`⏳ 暂未发现【超链接】按钮，重试中... (${retries}/${maxRetries})`);
                setTimeout(checkAndClickLink, 1000);
            } else {
                console.error('❌ [brbott] 新标签页中等待【超链接】按钮超时。');
            }
        };

        // 延迟一段时间开始查找，避免过早阻塞
        setTimeout(checkAndClickLink, 2000);
    }
})();

// On page load, also proactively try to extract token from the current URL and send to sidepanel
(function extractAndSendToken() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            console.log("✅ [brbott] 从当前 URL 提取到 token并主动上报: " + token);
            chrome.runtime.sendMessage({
                action: 'captured_token_fallback',
                token: token
            }, () => {
                if (chrome.runtime.lastError) {
                    // Ignore error when sidepanel is not open
                }
            });
        }
    } catch (e) {
        console.error("❌ [brbott] 提取 URL token 失败:", e);
    }
})();

