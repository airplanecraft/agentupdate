#!/bin/bash
# openclaweco.com 爬虫代理自动化配置脚本

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "🚀 开始配置 Cloudflare WARP 代理环境..."
echo -e "${BLUE}======================================${NC}"

# 1. 检查 warp-cli 是否安装
if ! command -v warp-cli &> /dev/null
then
    echo -e "${RED}❌ 未检测到 warp-cli。${NC}"
    echo -e "请先在终端运行: ${GREEN}brew install cloudflare-warp${NC}"
    exit 1
fi

# 2. 注册并连接 WARP
echo -e "📦 正在注册并连接 WARP (无感模式)..."
warp-cli register &> /dev/null || echo "已注册"
warp-cli mode proxy
warp-cli connect

# 3. 配置 Crawler 模块环境变量
echo -e "📝 正在配置 crawler/.env..."
CRAWLER_ENV="/Users/eric/work/openclaweco.com/crawler/.env"

if [ ! -f "$CRAWLER_ENV" ]; then
    cp "$CRAWLER_ENV.example" "$CRAWLER_ENV" 2>/dev/null || touch "$CRAWLER_ENV"
fi

# 写入代理配置到 crawler
sed -i '' '/HTTP_PROXY/d' "$CRAWLER_ENV"
sed -i '' '/HTTPS_PROXY/d' "$CRAWLER_ENV"
echo "HTTP_PROXY=socks5h://127.0.0.1:40000" >> "$CRAWLER_ENV"
echo "HTTPS_PROXY=socks5h://127.0.0.1:40000" >> "$CRAWLER_ENV"

# 4. 验证 Firecrawl 配置
echo -e "🔥 验证 Firecrawl 代理配置..."
FIRECRAWL_ENV="/Users/eric/work/openclaweco.com/firecrawl/.env"
if grep -q "PROXY_SERVER=socks5://host.docker.internal:40000" "$FIRECRAWL_ENV"; then
    echo -e "${GREEN}✅ Firecrawl 代理已配置。${NC}"
else
    echo "PROXY_SERVER=socks5://host.docker.internal:40000" >> "$FIRECRAWL_ENV"
fi

echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}🎉 配置完成！${NC}"
echo -e "1. 您的本地爬虫现在默认通过 Cloudflare IP 发起请求。"
echo -e "2. 请运行 ${BLUE}cd firecrawl && ./start-local.sh${NC} 启动服务。"
echo -e "3. 验证命令: ${GREEN}curl -x socks5h://localhost:40000 https://www.cloudflare.com/cdn-cgi/trace${NC}"
echo -e "${BLUE}======================================${NC}"
