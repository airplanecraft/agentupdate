(function hookFingerprintComponentsAggressive() {
    console.log("🚀 [brbott] 部署深度 JSON 狙击网 (V2)...");

    const originalStringify = JSON.stringify;
    let grabbed = false;

    // 绝杀 1: 拦截一切即将被序列化的长条对象
    JSON.stringify = function (value, replacer, space) {
        if (!grabbed && value && typeof value === 'object') {
            try {
                // 如果序列化的对象巨大，且竟然恰好带着 'audio' 或 'fonts' 和 'canvas' 这种特征字眼，直接拿下
                const keys = Object.keys(value);
                if (keys.length > 10 && keys.includes('audio') && keys.includes('canvas') && keys.includes('fonts')) {
                    console.log("🚨 [brbott/Stringify] 抓捕成功！在序列化之前截获了疑似微信魔改的 Components！");
                    console.dir(value);
                    grabbed = true;

                    window.postMessage({
                        source: 'brbott-inject',
                        type: 'fingerprint_components',
                        data: JSON.parse(originalStringify(value))
                    }, '*');
                }
            } catch (e) { }
        }
        return originalStringify.apply(this, arguments);
    };

    // 绝杀 2: 万一它都没用到 JSON.stringify，我们过几秒种在窗体闲置时主动巡逻扫描 window 下的变异变量
    setTimeout(() => {
        if (grabbed) return;
        console.log("👀 [brbott] JSON 没网到？开始主动巡防全局 Window 变量...");
        try {
            for (let prop in window) {
                if (window[prop] && typeof window[prop] === 'object' && !Array.isArray(window[prop])) {
                    // 别碰到 DOM Element
                    if (window[prop] instanceof Element) continue;

                    if ('audio' in window[prop] && 'canvas' in window[prop] && 'fonts' in window[prop] && 'webGlBasics' in window[prop]) {
                        console.log(`🚨 [brbott/Scanner] 抓捕成功！在全局变量 'window.${prop}' 中发现了 Components！`);
                        console.dir(window[prop]);
                        grabbed = true;

                        window.postMessage({
                            source: 'brbott-inject',
                            type: 'fingerprint_components',
                            data: JSON.parse(originalStringify(window[prop]))
                        }, '*');
                        break;
                    }
                }
            }
        } catch (e) { }
    }, 4000); // 等微信稍微安分一点再巡逻
})();

(function () {
    console.log('🚀 [brbott] 拦截脚本已成功注入网页主流环境!');

    // 拦截 Fetch
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const fetchPromise = originalFetch.apply(this, args);

        fetchPromise.then(response => {
            const clone = response.clone();
            // 直接尝试转 text，不要局限 Content-Type，因为有时候 header 不标准但在客户端能解析
            clone.text().then(text => {
                if (!text) return;
                text = text.trim();
                let data = null;
                try {
                    data = JSON.parse(text); // 如果能成功 parse 成对象
                } catch (e) {
                    // 尝试匹配 JSONP
                    const jsonpMatch = text.match(/^[a-zA-Z0-9_$.]+\s*\(\s*([\[{].*[}\]])\s*\)[\s;]*$/s);
                    if (jsonpMatch && jsonpMatch[1]) {
                        try {
                            data = JSON.parse(jsonpMatch[1]);
                        } catch (err) { }
                    }
                }

                if (data && typeof data === 'object' && data !== null) {
                    const urlString = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : 'unknown_fetch_url');
                    let method = 'GET';
                    if (args[1] && args[1].method) {
                        method = args[1].method.toUpperCase();
                    } else if (args[0] && args[0].method) {
                        method = args[0].method.toUpperCase();
                    }

                    // 尝试从 URL 中偷取官方 fingerprint
                    let wxFingerprint = null;
                    try {
                        const urlObj = new URL(urlString, window.location.origin);
                        if (urlObj.searchParams.has('fingerprint')) {
                            wxFingerprint = urlObj.searchParams.get('fingerprint');
                        }
                    } catch (e) {
                        // ignore URL parse error
                    }

                    console.log('🌐 [brbott Fetch JSON]:', urlString, data);
                    window.postMessage({
                        source: 'brbott-interceptor',
                        type: 'network_json',
                        requestUrl: urlString,
                        requestMethod: method,
                        responseBody: data,
                        wxFingerprint: wxFingerprint
                    }, '*');
                }
            }).catch(e => {
                // Ignore clone read errors
            });
        }).catch(e => {
            // Ignore fetch errors
        });

        return fetchPromise;
    };

    // 拦截 XHR
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    const originalXhrSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this._requestUrl = url;
        this._requestMethod = method ? method.toUpperCase() : 'GET';
        return originalXhrOpen.call(this, method, url, ...rest);
    };

    XMLHttpRequest.prototype.send = function (body) {
        let hasIntercepted = false;

        const interceptData = () => {
            if (hasIntercepted) return;
            hasIntercepted = true;

            let data = null;
            if (this.responseType === '' || this.responseType === 'text') {
                if (this.responseText && this.responseText.trim().length > 0) {
                    const text = this.responseText.trim();
                    try {
                        data = JSON.parse(text);
                    } catch (e) {
                        // 尝试匹配 JSONP 格式: callbackName({ ... })
                        const jsonpMatch = text.match(/^[a-zA-Z0-9_$.]+\s*\(\s*([\[{].*[}\]])\s*\)[\s;]*$/s);
                        if (jsonpMatch && jsonpMatch[1]) {
                            try {
                                data = JSON.parse(jsonpMatch[1]);
                                console.log('🌐 [brbott JSONP提取成功]:', this._requestUrl);
                            } catch (err) { }
                        }
                    }
                }
            } else if (this.responseType === 'json') {
                data = this.response;
            }

            if (data && typeof data === 'object') {
                let wxFingerprint = null;
                try {
                    const urlObj = new URL(this._requestUrl, window.location.origin);
                    if (urlObj.searchParams.has('fingerprint')) {
                        wxFingerprint = urlObj.searchParams.get('fingerprint');
                    }
                } catch (e) { }

                console.log('🌐 [brbott XHR JSON]:', this._requestUrl, data);
                window.postMessage({
                    source: 'brbott-interceptor',
                    type: 'network_json',
                    requestUrl: this._requestUrl,
                    requestMethod: this._requestMethod,
                    responseBody: data,
                    wxFingerprint: wxFingerprint
                }, '*');
            }
        };

        this.addEventListener('load', interceptData);
        // Fallback catch it early if possible
        this.addEventListener('readystatechange', function () {
            if (this.readyState === 4) {
                interceptData();
            }
        });

        // 最强制的拦截：Hook response 和 responseText getter (针对微信公众号这种重度修改 XHR 的页面)
        if (!this._brbottHooked) {
            this._brbottHooked = true;

            const oResponse = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'response');
            if (oResponse) {
                Object.defineProperty(this, 'response', {
                    get: function () {
                        const val = oResponse.get.call(this);
                        if (this.readyState === 4) {
                            setTimeout(interceptData, 0);
                        }
                        return val;
                    }
                });
            }

            const oResponseText = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'responseText');
            if (oResponseText) {
                Object.defineProperty(this, 'responseText', {
                    get: function () {
                        const val = oResponseText.get.call(this);
                        if (this.readyState === 4) {
                            setTimeout(interceptData, 0);
                        }
                        return val;
                    }
                });
            }
        }

        return originalXhrSend.call(this, body);
    };
})();
