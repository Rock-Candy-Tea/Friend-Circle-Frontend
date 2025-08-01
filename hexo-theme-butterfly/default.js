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

    const randomArticleContainer = document.createElement('div');
    randomArticleContainer.id = 'random-article';
    root.appendChild(randomArticleContainer);

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

        statsContainer.innerHTML = `
            <div>Powered by: <a href="https://github.com/Rock-Candy-Tea/hexo-circle-of-friends" target="_blank">Hexo Circle of Friends</a><br></div>
            <div>Designed By: <a href="https://www.liushen.fun/" target="_blank">LiuShen</a><br></div>
            <div>订阅:${globalStats.friends_num} 活跃:${globalStats.active_num} 总文章数:${globalStats.article_num}<br></div>
            <div>更新时间:${globalStats.last_updated_time}</div>
        `;

        displayRandomArticle();

        const articles = allArticles.slice(start, start + UserConfig.page_turning_number);
        articles.forEach(article => {
            const card = document.createElement('div');
            card.className = 'card';

            const title = document.createElement('div');
            title.className = 'card-title';
            title.innerText = article.title;
            title.onclick = () => window.open(article.link, '_blank');
            card.appendChild(title);

            const author = document.createElement('div');
            author.className = 'card-author';
            const authorImg = document.createElement('img');
            authorImg.className = 'no-lightbox';
            authorImg.src = article.avatar || UserConfig.error_img;
            authorImg.onerror = () => authorImg.src = UserConfig.error_img;
            author.appendChild(authorImg);
            author.appendChild(document.createTextNode(article.author));
            card.appendChild(author);

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

    function displayRandomArticle() {
        const randomArticle = allArticles[Math.floor(Math.random() * allArticles.length)];
        const sortRule = getSortRule();
        const sourceRule = getDataSource();

        const statsCard = `
            <div class="random-stats-card">
                <div class="random-stats-info">
                    <span class="stats-item stats-subscribe">订阅: ${globalStats.friends_num}</span>
                    <span class="stats-item stats-active">活跃: ${globalStats.active_num}</span>
                    <span class="stats-item stats-articles">文章: ${globalStats.article_num}</span>
                </div>
                <div class="random-stats-controls">
                    <button id="sort-toggle-btn">${sortRule === 'created' ? '发布时间' : '更新时间'}</button>
                    <button id="source-toggle-btn">${sourceRule === 'private' ? '私有订阅' : '公共订阅'}</button>
                </div>
            </div>
        `;

        const randomCard = `
            <div class="random-container">
                <div class="random-content-container">
                    <div class="random-content">
                        <span class="random-container-title">🎣随机钓鱼: </span>钓到了 <span class="random-author">${randomArticle.author}</span> 的文章: <span class="random-title">${randomArticle.title}</span>
                    </div>
                </div>
                <div class="random-button-container">
                    <button href="#" id="refresh-random-article">刷新</button>
                    <button class="random-link-button" onclick="window.open('${randomArticle.link}', '_blank')">看看</button>
                </div>
            </div>
        `;

        randomArticleContainer.innerHTML = statsCard + randomCard;

        document.getElementById('refresh-random-article').addEventListener('click', function (event) {
            event.preventDefault();
            displayRandomArticle();
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
    }

    function showAuthorArticles(author, avatar, link) {
        if (!document.getElementById('fclite-modal')) {
            const modal = document.createElement('div');
            modal.id = 'modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <img id="modal-author-avatar" src="" alt="">
                    <a id="modal-author-name-link"></a>
                    <div id="modal-articles-container"></div>
                    <img id="modal-bg" src="" alt="">
                </div>
            `;
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
