function initialize_fc_lite() {
    UserConfig = {
        private_api_url: UserConfig?.private_api_url || "",
        page_turning_number: UserConfig?.page_turning_number || 24,
        error_img: UserConfig?.error_img || "https://fastly.jsdelivr.net/gh/Rock-Candy-Tea/Friend-Circle-Frontend/logo.png"
    };

    const PUBLIC_API_URL = 'https://fc-example.430070.xyz';

    const root = document.getElementById('friend-circle-container');
    if (!root) return;
    root.innerHTML = '';

    const TopContainer = document.createElement('div');
    TopContainer.id = 'top-fc-container';
    root.appendChild(TopContainer);

    const container = document.createElement('div');
    container.className = 'articles-container';
    container.id = 'articles-container';
    root.appendChild(container);

    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.id = 'load-more-btn';
    loadMoreBtn.innerText = '再来亿点';
    root.appendChild(loadMoreBtn);

    const statsContainer = document.createElement('div');
    statsContainer.id = 'stats-container';
    root.appendChild(statsContainer);

    let start = 0;
    let allArticles = [];
    let globalStats = {};

    function getSortRule() {
        return localStorage.getItem('friend-circle-sort') || 'created';
    }

    function setSortRule(rule) {
        localStorage.setItem('friend-circle-sort', rule);
    }

    function getDataSource() {
        return localStorage.getItem('friend-circle-source') || 'private';
    }

    function setDataSource(source) {
        localStorage.setItem('friend-circle-source', source);
    }

    function getApiUrl() {
        return getDataSource() === 'public' ? PUBLIC_API_URL : UserConfig.private_api_url;
    }

    function clearCache() {
        localStorage.removeItem('friend-circle-cache');
        localStorage.removeItem('friend-circle-cache-time');
    }

    function loadMoreArticles() {
        const cacheKey = 'friend-circle-cache';
        const cacheTimeKey = 'friend-circle-cache-time';
        const cacheTime = localStorage.getItem(cacheTimeKey);
        const now = new Date().getTime();

        if (cacheTime && (now - cacheTime < 10 * 60 * 1000)) {
            const cachedData = JSON.parse(localStorage.getItem(cacheKey));
            if (cachedData) {
                processArticles(cachedData);
                return;
            }
        }

        const apiUrl = getApiUrl();
        const finalUrl = apiUrl.endsWith('/') ? apiUrl + 'all' : apiUrl + '/all';

        fetch(finalUrl)
            .then(response => response.json())
            .then(data => {
                localStorage.setItem(cacheKey, JSON.stringify(data));
                localStorage.setItem(cacheTimeKey, now.toString());
                processArticles(data);
            })
            .finally(() => {
                loadMoreBtn.innerText = '再来亿点';
            });
    }

    function processArticles(data) {
        allArticles = data.article_data;
        globalStats = data.statistical_data;

        const sortRule = getSortRule();
        allArticles.sort((a, b) => b[sortRule].localeCompare(a[sortRule]));

        statsContainer.innerHTML = `<div>Powered by: <a href="https://github.com/Rock-Candy-Tea/hexo-circle-of-friends" target="_blank">Hexo Circle of Friends</a><br></div><div>Designed By: <a href="https://www.liushen.fun/" target="_blank">LiuShen</a><br></div><div>更新时间: ${globalStats.last_updated_time}</div>`;

        initializeTopSection();

        const articles = allArticles.slice(start, start + UserConfig.page_turning_number);
        articles.forEach(article => {
            const card = document.createElement('div');
            card.className = 'card';

            const title = document.createElement('div');
            title.className = 'card-title';
            title.innerText = article.title;
            title.onclick = () => window.open(article.link, '_blank');
            card.appendChild(title);

            const authorContainer = document.createElement('div');
            authorContainer.className = 'author-container';
            
            const author = document.createElement('div');
            author.className = 'card-author';
            const authorImg = document.createElement('img');
            authorImg.className = 'no-lightbox';
            authorImg.src = article.avatar || UserConfig.error_img;
            authorImg.onerror = () => authorImg.src = UserConfig.error_img;
            author.appendChild(authorImg);
            author.appendChild(document.createTextNode(article.author));
            authorContainer.appendChild(author);
            
            const summaryIndicator = document.createElement('div');
            summaryIndicator.className = 'summary-indicator';
            if (article.summary) {
                const gptSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M260.4 249.8L260.4 201.2C260.4 197.1 261.9 194 265.5 192L363.3 135.7C376.6 128 392.5 124.4 408.9 124.4C470.3 124.4 509.3 172 509.3 222.7C509.3 226.3 509.3 230.4 508.8 234.5L407.3 175.1C401.2 171.5 395 171.5 388.9 175.1L260.4 249.8zM488.7 439.2L488.7 323C488.7 315.8 485.6 310.7 479.5 307.1L351 232.4L393 208.3C396.6 206.3 399.7 206.3 403.2 208.3L501 264.7C529.2 281.1 548.1 315.9 548.1 349.7C548.1 388.6 525.1 424.5 488.7 439.3L488.7 439.3zM230.2 336.8L188.2 312.2C184.6 310.2 183.1 307.1 183.1 303L183.1 190.4C183.1 135.6 225.1 94.1 281.9 94.1C303.4 94.1 323.4 101.3 340.3 114.1L239.4 172.5C233.3 176.1 230.2 181.2 230.2 188.4L230.2 336.9L230.2 336.9zM320.6 389L260.4 355.2L260.4 283.5L320.6 249.7L380.8 283.5L380.8 355.2L320.6 389zM359.3 544.7C337.8 544.7 317.8 537.5 300.9 524.7L401.8 466.3C407.9 462.7 411 457.6 411 450.4L411 301.9L453.5 326.5C457.1 328.5 458.6 331.6 458.6 335.7L458.6 448.3C458.6 503.1 416.1 544.6 359.3 544.6L359.3 544.6zM237.8 430.5L140.1 374.2C111.9 357.8 93 323 93 289.2C93 249.8 116.6 214.4 152.9 199.6L152.9 316.3C152.9 323.5 156 328.6 162.1 332.2L290.1 406.4L248.1 430.5C244.5 432.5 241.4 432.5 237.9 430.5zM232.2 514.5C174.3 514.5 131.8 471 131.8 417.2C131.8 413.1 132.3 409 132.8 404.9L233.7 463.3C239.8 466.9 246 466.9 252.1 463.3L380.6 389.1L380.6 437.7C380.6 441.8 379.1 444.9 375.5 446.9L277.7 503.2C264.4 510.9 248.5 514.5 232.1 514.5L232.1 514.5zM359.2 575.4C421.2 575.4 472.9 531.4 484.6 473C541.9 458.1 578.8 404.4 578.8 349.6C578.8 313.8 563.4 278.9 535.8 253.9C538.4 243.1 539.9 232.4 539.9 221.6C539.9 148.4 480.5 93.6 411.9 93.6C398.1 93.6 384.8 95.6 371.5 100.3C348.5 77.8 316.7 63.4 281.9 63.4C219.9 63.4 168.2 107.4 156.5 165.8C99.2 180.6 62.3 234.4 62.3 289.2C62.3 325 77.7 359.9 105.3 384.9C102.7 395.7 101.2 406.4 101.2 417.2C101.2 490.4 160.6 545.2 229.2 545.2C243 545.2 256.3 543.2 269.6 538.5C292.6 561 324.4 575.4 359.2 575.4z"/></svg>`;
                summaryIndicator.innerHTML = gptSvg;
                authorContainer.appendChild(summaryIndicator);

                let hideTimeout;

                const showPopup = (event) => {
                    // 清除隐藏定时器
                    if (hideTimeout) {
                        clearTimeout(hideTimeout);
                        hideTimeout = null;
                    }
                    
                    // 如果弹窗已存在，直接返回
                    if (summaryIndicator._popup) {
                        // 删掉弹窗
                        summaryIndicator.removeChild(summaryIndicator._popup);
                        summaryIndicator._popup = null;
                    }
                    
                    // 创建弹窗元素
                    const popup = document.createElement('div');
                    const model = article.ai_model.split('/').pop();
                    popup.className = 'summary-popup';
                    popup.innerHTML = `
                        <div class="summary-popup-title"><span>${gptSvg}文章摘要</span><div class="summary-model">${model}</div></div><div class="summary-popup-content">${article.summary}</div><div class="summary-popup-updated-at">🕙Update at: <span>${new Date(article.summary_updated_at).toLocaleDateString('zh-CN', {month: '2-digit', day: '2-digit'}).replace(/\//g, '-')} ${new Date(article.summary_updated_at).toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit', hour12: false})}</span></div>`;
                    
                    // 添加到body中，先设置为不可见以便测量
                    popup.style.visibility = 'hidden';
                    popup.style.position = 'fixed';
                    document.body.appendChild(popup);
                    
                    // 获取鼠标位置和屏幕尺寸
                    const mouseX = event.clientX;
                    const mouseY = event.clientY;
                    const screenWidth = window.innerWidth;
                    const screenHeight = window.innerHeight;
                    
                    // 计算响应式宽度
                    const maxWidth = Math.min(400, screenWidth - 40);
                    popup.style.width = maxWidth + 'px';
                    
                    // 获取实际高度
                    const popupRect = popup.getBoundingClientRect();
                    const popupWidth = popupRect.width;
                    const popupHeight = popupRect.height;
                    
                    // 计算弹窗位置
                    let left = mouseX + 10;
                    let top = mouseY + 10;
                    
                    // 检查是否超出右边界，如果是则显示在左侧
                    if (left + popupWidth > screenWidth) {
                        left = mouseX - popupWidth - 10;
                    }
                    
                    // 检查是否超出下边界，如果是则显示在上方
                    if (top + popupHeight > screenHeight) {
                        top = mouseY - popupHeight - 10;
                    }
                    
                    // 确保不会超出左边界和上边界
                    left = Math.max(10, left);
                    top = Math.max(10, top);
                    
                    // 设置弹窗最终位置和样式
                    popup.style.cssText = `left: ${left}px;top: ${top}px;width: ${maxWidth}px;visibility: visible;transform: scale(0.8) translateY(-10px);opacity: 0;`;
                    
                    // 添加动画效果
                    requestAnimationFrame(() => {
                        popup.style.transform = 'scale(1) translateY(0)';
                        popup.style.opacity = '1';
                    });
                    
                    // 存储弹窗引用
                    summaryIndicator._popup = popup;
                    
                    // 为弹窗添加鼠标事件
                    popup.addEventListener('mouseenter', () => {
                        if (hideTimeout) {
                            clearTimeout(hideTimeout);
                            hideTimeout = null;
                        }
                    });
                    
                    popup.addEventListener('mouseleave', hidePopup);
                };

                const hidePopup = () => {
                    hideTimeout = setTimeout(() => {
                        const popup = summaryIndicator._popup;
                        if (popup) {
                            popup.style.transform = 'scale(0.8) translateY(-10px)';
                            popup.style.opacity = '0';
                            
                            setTimeout(() => {
                                if (popup.parentNode) {
                                    document.body.removeChild(popup);
                                }
                                summaryIndicator._popup = null;
                            }, 300);
                        }
                        hideTimeout = null;
                    }, 30); // 100ms延迟，给鼠标移动到弹窗的时间
                };

                summaryIndicator.addEventListener('mouseenter', showPopup);
                summaryIndicator.addEventListener('mouseleave', hidePopup);
            }
            card.appendChild(authorContainer);

            author.onclick = () => {
                showAuthorArticles(article.author, article.avatar, article.link);
            };

            const date = document.createElement('div');
            date.className = 'card-date';
            date.innerText = "🗓️" + article.created.substring(0, 10);
            card.appendChild(date);

            const bgImg = document.createElement('img');
            bgImg.className = 'card-bg no-lightbox';
            bgImg.src = article.avatar || UserConfig.error_img;
            bgImg.onerror = () => bgImg.src = UserConfig.error_img;
            card.appendChild(bgImg);

            container.appendChild(card);
        });

        start += UserConfig.page_turning_number;
        if (start >= allArticles.length) {
            loadMoreBtn.style.display = 'none';
        }
    }

    // 初始化统计卡片和随机文章结构
    function initializeTopSection() {
        const sortRule = getSortRule();
        const sourceRule = getDataSource();

        const statsCard = `<div class="stats-card-container"><div class="stats-card-left"><div class="stats-item"><div class="stats-value">${globalStats.friends_num}</div><div class="stats-label">订阅</div></div><div class="stats-item"><div class="stats-value">${globalStats.active_num}</div><div class="stats-label">活跃</div></div><div class="stats-item"><div class="stats-value">${globalStats.article_num}</div><div class="stats-label">文章</div></div></div><div class="stats-card-right"><div class="stats-controls"><button id="sort-toggle-btn">${sortRule==='created'?'发布时间':'更新时间'}</button><button id="source-toggle-btn">${sourceRule==='private'?'私有订阅':'公共订阅'}</button></div><div class="stats-version"><span id="version-text">加载中</span><span id="version-info">正在与主机通讯中</span></div></div></div>`;

        const randomCard = `<div class="random-container"><div class="random-content-container"><div class="random-content"><span class="random-container-title">🎣随机钓鱼:</span>钓到了<span class="random-author"id="random-author"></span>的文章:<span class="random-title"id="random-title"></span></div></div><div class="random-button-container"><button id="refresh-random-article">刷新</button><button class="random-link-button"id="random-link-button">看看</button></div></div>`;

        TopContainer.innerHTML = statsCard + randomCard;

        // 绑定事件监听器
        document.getElementById('refresh-random-article').addEventListener('click', function (event) {
            event.preventDefault();
            updateRandomArticle();
        });

        document.getElementById('sort-toggle-btn').addEventListener('click', () => {
            const next = sortRule === 'created' ? 'updated' : 'created';
            setSortRule(next);
            start = 0;
            container.innerHTML = '';
            processArticles({ article_data: allArticles, statistical_data: globalStats });
        });

        document.getElementById('source-toggle-btn').addEventListener('click', () => {
            const next = sourceRule === 'private' ? 'public' : 'private';
            setDataSource(next);
            clearCache();
            start = 0;
            container.innerHTML = '';
            loadMoreArticles();
        });

        // 初始化显示第一篇随机文章
        updateRandomArticle();
        
        // 异步检查版本更新，不阻塞主流程
        Promise.resolve().then(() => {
            checkVersionUpdate();
        });
    }

    // 更新随机文章数据
    function updateRandomArticle() {
        const randomArticle = allArticles[Math.floor(Math.random() * allArticles.length)];
        
        document.getElementById('random-author').textContent = randomArticle.author;
        document.getElementById('random-title').textContent = randomArticle.title;
        document.getElementById('random-link-button').onclick = () => window.open(randomArticle.link, '_blank');
    }



    // 异步检查版本更新
    async function checkVersionUpdate() {
        const versionText = document.getElementById('version-text');
        const versionInfo = document.getElementById('version-info');
        
        if (!versionText || !versionInfo) {
            console.warn('版本元素未找到');
            return;
        }

        try {
            // 使用 Promise.all 并行请求，但设置超时避免阻塞
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('请求超时')), 5000)
            );

            const baseApiUrl = getApiUrl();
            const VersionApiUrl = baseApiUrl.endsWith('/') ? baseApiUrl + 'version' : baseApiUrl + '/version';
            const [localVersionResponse, latestVersionResponse] = await Promise.race([
                Promise.all([
                    fetch(`${VersionApiUrl}`),
                    fetch('https://fcircle-doc.yyyzyyyz.cn/version.txt')
                ]),
                timeoutPromise
            ]);

            const localVersionData = await localVersionResponse.json();
            const latestVersion = await latestVersionResponse.text();
            const localVersion = localVersionData.version;
            
            // 更新版本显示 - 显示时加上v前缀
            versionText.textContent = `v${localVersion.trim()}`;
            
            // 标准化版本号进行比较（都去掉v前缀）
            const normalizedLocal = localVersion.trim().replace(/^v/, '');
            const normalizedLatest = latestVersion.trim().replace(/^v/, '');
            
            if (normalizedLocal === normalizedLatest) {
                // 最新版 - 绿色
                versionText.className = 'version-latest';
                versionText.title = '当前已为最新版本';
                versionInfo.textContent = '当前已为最新版本';
            } else {
                // 有更新 - 橙色
                versionText.className = 'version-update';
                versionText.title = `现有新版本可更新`;
                versionInfo.textContent = `新版本可用:${latestVersion.trim()}`;
            }
        } catch (error) {
            // 获取失败 - 红色
            versionText.textContent = 'v0.0.0';
            versionText.className = 'version-error';
            versionText.title = '版本信息获取失败';
            versionInfo.textContent = '版本信息获取失败';
            console.error('版本检查失败:', error);
        }
    }

    function showAuthorArticles(author, avatar, link) {
        if (!document.getElementById('modal')) {
            const modal = document.createElement('div');
            modal.id = 'modal';
            modal.className = 'modal';
            modal.innerHTML = `<div class="modal-content"><img id="modal-author-avatar"src=""alt=""><a id="modal-author-name-link"></a><div id="modal-articles-container"></div><img id="modal-bg"src=""alt=""></div>`;
            root.appendChild(modal);
        }

        const modal = document.getElementById('modal');
        const modalArticlesContainer = document.getElementById('modal-articles-container');
        const modalAuthorAvatar = document.getElementById('modal-author-avatar');
        const modalAuthorNameLink = document.getElementById('modal-author-name-link');
        const modalBg = document.getElementById('modal-bg');

        modalArticlesContainer.innerHTML = '';
        modalAuthorAvatar.src = avatar || UserConfig.error_img;
        modalAuthorAvatar.onerror = () => modalAuthorAvatar.src = UserConfig.error_img;
        modalBg.src = avatar || UserConfig.error_img;
        modalBg.onerror = () => modalBg.src = UserConfig.error_img;
        modalAuthorNameLink.innerText = author;
        modalAuthorNameLink.href = new URL(link).origin;

        const authorArticles = allArticles.filter(article => article.author === author);
        authorArticles.slice(0, 4).forEach(article => {
            const articleDiv = document.createElement('div');
            articleDiv.className = 'modal-article';

            const title = document.createElement('a');
            title.className = 'modal-article-title';
            title.innerText = article.title;
            title.href = article.link;
            title.target = '_blank';
            articleDiv.appendChild(title);

            const date = document.createElement('div');
            date.className = 'modal-article-date';
            date.innerText = "📅" + article.created.substring(0, 10);
            articleDiv.appendChild(date);

            modalArticlesContainer.appendChild(articleDiv);
        });

        modal.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('modal-open');
        }, 10);
    }

    function hideModal() {
        const modal = document.getElementById('modal');
        modal.classList.remove('modal-open');
        modal.addEventListener('transitionend', () => {
            modal.style.display = 'none';
            root.removeChild(modal);
        }, { once: true });
    }

    loadMoreArticles();
    loadMoreBtn.addEventListener('click', loadMoreArticles);
    window.onclick = function (event) {
        const modal = document.getElementById('modal');
        if (event.target === modal) hideModal();
    };
}

function whenDOMReady() {
    initialize_fc_lite();
}

whenDOMReady();
document.addEventListener("pjax:complete", initialize_fc_lite);
