/*
Last Modified time : 20220326 15:38 by https://immmmm.com
已适配 FriendCircle 公共库和主库
*/

//默认数据
var fdata = {
    jsonurl: '',
    apiurl: '',
    apipublieurl: 'https://fc-example.430070.xyz/',
    initnumber: 20,
    stepnumber: 10,
    article_sort: 'created',
    error_img: 'https://fastly.jsdelivr.net/gh/Rock-Candy-Tea/Friend-Circle-Frontend/logo.png'
};

// 从 UserConfig 覆盖配置（若已定义）
if (typeof UserConfig !== 'undefined') {
    if (UserConfig.private_api_url) {
        fdata.apiurl = UserConfig.private_api_url;
    }
    if (UserConfig.page_turning_number) {
        fdata.stepnumber = UserConfig.page_turning_number;
    }
    if (UserConfig.error_img) {
        fdata.error_img = UserConfig.error_img;
    }
}

var article_num = '',
    sortNow = '',
    UrlNow = '',
    friends_num = ''
var container = document.getElementById('friend-circle-container');
// 获取本地 排序值、加载apiUrl，实现记忆效果
var localSortNow = localStorage.getItem("sortNow")
var localUrlNow = localStorage.getItem("urlNow")
if (localSortNow && localUrlNow) {
    sortNow = localSortNow
    UrlNow = localUrlNow
} else {
    sortNow = fdata.article_sort
    if (fdata.jsonurl) {
        UrlNow = fdata.apipublieurl + 'postjson?jsonlink=' + fdata.jsonurl + "&"
    } else if (fdata.apiurl) {
        UrlNow = fdata.apiurl + 'all?'
    } else {
        UrlNow = fdata.apipublieurl + 'all?'
    }
    console.log("当前模式：" + UrlNow)
    localStorage.setItem("urlNow", UrlNow)
    localStorage.setItem("sortNow", sortNow)
}
// 打印基本信息
function loadStatistical(sdata) {
    article_num = sdata.article_num
    friends_num = sdata.friends_num
    var messageBoard = `
  <div id="cf-state" class="cf-new-add">
    <div class="cf-state-data">
      <div class="cf-data-friends" onclick="openToShow()">
        <span class="cf-label">订阅</span>
        <span class="cf-message">${sdata.friends_num}</span>
      </div>
      <div class="cf-data-active" onclick="changeEgg()">
        <span class="cf-label">活跃</span>
        <span class="cf-message">${sdata.active_num}</span>
      </div>
      <div class="cf-data-article" onclick="clearLocal()">
        <span class="cf-label">日志</span>
        <span class="cf-message">${sdata.article_num}</span>
      </div>
    </div>
    <div id="cf-change">
        <span id="cf-change-created" data-sort="created" onclick="changeSort(event)" class="${sortNow == 'created' ? 'cf-change-now':''}">Created</span> | <span id="cf-change-updated" data-sort="updated" onclick="changeSort(event)" class="${sortNow == 'updated' ? 'cf-change-now':''}" >Updated</span>
    </div>
  </div>
  `;
    var loadMoreBtn = `
    <div id="cf-more" class="cf-new-add" onclick="loadNextArticle()"><i class="fas fa-angle-double-down"></i></div>
    <div id="cf-footer" class="cf-new-add">
     <span id="cf-version-up" onclick="checkVersion()"></span>
     <span class="cf-data-lastupdated">更新于：${sdata.last_updated_time}</span>
      Powered by <a target="_blank" href="https://github.com/Rock-Candy-Tea/hexo-circle-of-friends" target="_blank">FriendCircle</a><br>
      Designed by <a target="_blank" href="https://immmmm.com/" target="_blank">林木木</a>
    </div>
    <div id="cf-overlay" class="cf-new-add" onclick="closeShow()"></div>
    <div id="cf-overshow" class="cf-new-add"></div>
  `;
    if (container) {
        container.insertAdjacentHTML('beforebegin', messageBoard);
        container.insertAdjacentHTML('afterend', loadMoreBtn);
    }
}
// 打印文章内容 cf-article
function loadArticleItem(datalist, start, end) {
    var articleItem = '';
    var articleNum = article_num;
    var endFor = end
    if (end > articleNum) {
        endFor = articleNum
    }
    if (start < articleNum) {
        for (var i = start; i < endFor; i++) {
            var item = datalist[i];
            articleItem += `
      <div class="cf-article">
        <a class="cf-article-title" href="${item.link}" target="_blank" rel="noopener nofollow" data-title="${item.title}">${item.title}</a>
        <span class="cf-article-floor">${item.floor}</span>
        <div class="cf-article-avatar no-lightbox flink-item-icon">
          <img class="cf-img-avatar avatar" src="${item.avatar}" alt="avatar" onerror="this.src='${fdata.error_img}'; this.onerror = null;">
          <a onclick="openMeShow(event)" data-link="${item.link}" class="" target="_blank" rel="noopener nofollow" href="javascript:;"><span class="cf-article-author">${item.author}</span></a>
          <span class="cf-article-time">
            <span class="cf-time-created" style="${sortNow == 'created' ? '':'display:none'}"><i class="far fa-calendar-alt">发表于</i>${item.created}</span>
            <span class="cf-time-updated" style="${sortNow == 'updated' ? '':'display:none'}"><i class="fas fa-history">更新于</i>${item.updated}</span>
          </span>
        </div>
      </div>
      `;
        }
        container.insertAdjacentHTML('beforeend', articleItem);
        // 预载下一页文章
        fetchNextArticle()
    } else {
        // 文章加载到底
        document.getElementById('cf-more').outerHTML = `<div id="cf-more" class="cf-new-add" onclick="loadNoArticle()"><small>一切皆有尽头！</small></div>`
    }
}
// 打印个人卡片 cf-overshow
function loadFcircleShow(userinfo, articledata) {
    var showHtml = `
      <div class="cf-overshow">
        <div class="cf-overshow-head">
          <img class="cf-img-avatar avatar" src="${userinfo.avatar}" alt="avatar" onerror="this.src='${fdata.error_img}'; this.onerror = null;">
          <a class="" target="_blank" rel="noopener nofollow" href="${userinfo.link}">${userinfo.name}</a>
        </div>
        <div class="cf-overshow-content">
  `
    for (var i = 0; i < userinfo.article_num; i++) {
        var item = articledata[i];
        showHtml += `
      <p><a class="cf-article-title"  href="${item.link}" target="_blank" rel="noopener nofollow" data-title="${item.title}">${item.title}</a><span>${item.created}</span></p>
    `
    }
    showHtml += '</div></div>'
    document.getElementById('cf-overshow').insertAdjacentHTML('beforeend', showHtml);
    document.getElementById('cf-overshow').className = 'cf-show-now';
}

// 预载下一页文章，存为本地数据 nextArticle
function fetchNextArticle() {
    var start = document.getElementsByClassName('cf-article').length
    var end = start + fdata.stepnumber
    var articleNum = article_num;
    if (end > articleNum) {
        end = articleNum
    }
    if (start < articleNum) {
        UrlNow = localStorage.getItem("urlNow")
        var fetchUrl = UrlNow + "rule=" + sortNow + "&start=" + start + "&end=" + end
        //console.log(fetchUrl)
        fetch(fetchUrl)
            .then(res => res.json())
            .then(json => {
                var nextArticle = eval(json.article_data);
                console.log("已预载" + "?rule=" + sortNow + "&start=" + start + "&end=" + end)
                localStorage.setItem("nextArticle", JSON.stringify(nextArticle))
            })
    } else if (start = articleNum) {
        document.getElementById('cf-more').outerHTML = `<div id="cf-more" class="cf-new-add" onclick="loadNoArticle()"><small>一切皆有尽头！</small></div>`
    }
}
// 显示下一页文章，从本地缓存 nextArticle 中获取
function loadNextArticle() {
    var nextArticle = JSON.parse(localStorage.getItem("nextArticle"));
    var articleItem = ""
    for (var i = 0; i < nextArticle.length; i++) {
        var item = nextArticle[i];
        articleItem += `
      <div class="cf-article">
        <a class="cf-article-title" href="${item.link}" target="_blank" rel="noopener nofollow" data-title="${item.title}">${item.title}</a>
        <span class="cf-article-floor">${item.floor}</span>
        <div class="cf-article-avatar no-lightbox flink-item-icon">
          <img class="cf-img-avatar avatar" src="${item.avatar}" alt="avatar" onerror="this.src='${fdata.error_img}'; this.onerror = null;">
          <a onclick="openMeShow(event)" data-link="${item.link}" class="" target="_blank" rel="noopener nofollow" href="javascript:;"><span class="cf-article-author">${item.author}</span></a>
          <span class="cf-article-time">
            <span class="cf-time-created" style="${sortNow == 'created' ? '':'display:none'}"><i class="far fa-calendar-alt">发表于</i>${item.created}</span>
            <span class="cf-time-updated" style="${sortNow == 'updated' ? '':'display:none'}"><i class="fas fa-history">更新于</i>${item.updated}</span>
          </span>
        </div>
      </div>
      `;
    }
    container.insertAdjacentHTML('beforeend', articleItem);
    // 同时预载下一页文章
    fetchNextArticle()
}
// 没有更多文章
function loadNoArticle() {
    var articleSortData = sortNow + "ArticleData"
    localStorage.removeItem(articleSortData)
    localStorage.removeItem("statisticalData")
    //localStorage.removeItem("sortNow")
    document.getElementById('cf-more').remove()
    window.scrollTo(0, document.getElementsByClassName('cf-state').offsetTop)
}
// 清空本地数据
function clearLocal() {
    localStorage.removeItem("updatedArticleData")
    localStorage.removeItem("createdArticleData")
    localStorage.removeItem("nextArticle")
    localStorage.removeItem("statisticalData")
    localStorage.removeItem("sortNow")
    localStorage.removeItem("urlNow")
    location.reload();
}
//
function checkVersion() {
    var url = fdata.apiurl + "version"
    fetch(url)
        .then(res => res.json())
        .then(json => {
            console.log(json)
            var nowStatus = json.status,
                nowVersion = json.current_version,
                newVersion = json.latest_version
            var versionID = document.getElementById('cf-version-up')
            if (nowStatus == 0) {
                versionID.innerHTML = "当前版本：v" + nowVersion
            } else if (nowStatus == 1) {
                versionID.innerHTML = "发现新版本：v" + nowVersion + " ↦ " + newVersion
            } else {
                versionID.innerHTML = "网络错误，检测失败！"
            }
        })
}
// 切换为公共全库
function changeEgg() {
    //有自定义json或api执行切换
    if (fdata.jsonurl || fdata.apiurl) {
        document.querySelectorAll('.cf-new-add').forEach(el => el.remove());
        localStorage.removeItem("updatedArticleData")
        localStorage.removeItem("createdArticleData")
        localStorage.removeItem("nextArticle")
        localStorage.removeItem("statisticalData")
        container.innerHTML = ""
        UrlNow = localStorage.getItem("urlNow")
        //console.log("新"+UrlNow)
        var UrlNowPublic = fdata.apipublieurl + 'all?'
        if (UrlNow !== UrlNowPublic) { //非完整默认公开库
            changeUrl = fdata.apipublieurl + 'all?'
        } else {
            if (fdata.jsonurl) {
                changeUrl = fdata.apipublieurl + 'postjson?jsonlink=' + fdata.jsonurl + "&"
            } else if (fdata.apiurl) {
                changeUrl = fdata.apiurl + 'all?'
            }
        }
        localStorage.setItem("urlNow", changeUrl)
        FetchFriendCircle(sortNow, changeUrl)
    } else {
        clearLocal()
    }
}
// 首次加载文章
function FetchFriendCircle(sortNow, changeUrl) {
    var end = fdata.initnumber
    var fetchUrl = UrlNow + "rule=" + sortNow + "&start=0&end=" + end
    if (changeUrl) {
        fetchUrl = changeUrl + "rule=" + sortNow + "&start=0&end=" + end
    }
    //console.log(fetchUrl)
    fetch(fetchUrl)
        .then(res => res.json())
        .then(json => {
            var statisticalData = json.statistical_data;
            var articleData = eval(json.article_data);
            var articleSortData = sortNow + "ArticleData";
            loadStatistical(statisticalData);
            loadArticleItem(articleData, 0, end)
            localStorage.setItem("statisticalData", JSON.stringify(statisticalData))
            localStorage.setItem(articleSortData, JSON.stringify(articleData))
        })
}
// 点击切换排序
function changeSort(event) {
    sortNow = event.currentTarget.dataset.sort
    localStorage.setItem("sortNow", sortNow)
    document.querySelectorAll('.cf-new-add').forEach(el => el.remove());
    container.innerHTML = "";
    changeUrl = localStorage.getItem("urlNow")
    //console.log(changeUrl)
    initFriendCircle(sortNow, changeUrl)
    if (fdata.apiurl) {
        checkVersion()
    }
}
//查询个人文章列表
function openMeShow(event) {
    event.preventDefault()
    var parse_url = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
    var meLink = event.currentTarget.dataset.link.replace(parse_url, '$1:$2$3')
    console.log(meLink)
    var fetchUrl = ''
    if (fdata.apiurl) {
        fetchUrl = fdata.apiurl + "post?num=5&link=" + meLink
    } else {
        fetchUrl = fdata.apipublieurl + "post?num=5&link=" + meLink
    }
    //console.log(fetchUrl)
    if (noClick == 'ok') {
        noClick = 'no'
        fetchShow(fetchUrl)
    }
}
// 关闭 show
function closeShow() {
    document.getElementById('cf-overlay').className -= 'cf-show-now';
    document.getElementById('cf-overshow').className -= 'cf-show-now';
    document.getElementById('cf-overshow').innerHTML = ''
}
// 点击开往
var noClick = 'ok';

function openToShow() {
    var fetchUrl = ''
    if (fdata.apiurl) {
        fetchUrl = fdata.apiurl + "post"
    } else {
        fetchUrl = fdata.apipublieurl + "post"
    }
    //console.log(fetchUrl)
    if (noClick == 'ok') {
        noClick = 'no'
        fetchShow(fetchUrl)
    }
}
// 展示个人文章列表
function fetchShow(url) {
    var closeHtml = `
    <div class="cf-overshow-close" onclick="closeShow()"></div>
  `
    document.getElementById('cf-overlay').className = 'cf-show-now';
    document.getElementById('cf-overshow').insertAdjacentHTML('afterbegin', closeHtml);
    console.log("开往" + url)
    fetch(url)
        .then(res => res.json())
        .then(json => {
            console.log(json)
            noClick = 'ok'
            var statisticalData = json.statistical_data;
            var articleData = eval(json.article_data);
            loadFcircleShow(statisticalData, articleData)
        })
}
// 初始化方法，如有本地数据首先调用
function initFriendCircle(sortNow, changeUrl) {
    var articleSortData = sortNow + "ArticleData";
    var localStatisticalData = JSON.parse(localStorage.getItem("statisticalData"));
    var localArticleData = JSON.parse(localStorage.getItem(articleSortData));
    container.innerHTML = "";
    if (localStatisticalData && localArticleData) {
        loadStatistical(localStatisticalData);
        loadArticleItem(localArticleData, 0, fdata.initnumber)
        console.log("本地数据加载成功")
        var fetchUrl = UrlNow + "rule=" + sortNow + "&start=0&end=" + fdata.initnumber
        fetch(fetchUrl)
            .then(res => res.json())
            .then(json => {
                var statisticalData = json.statistical_data;
                var articleData = eval(json.article_data);
                //获取文章总数与第一篇文章标题
                var localSnum = localStatisticalData.article_num
                var newSnum = statisticalData.article_num
                var localAtile = localArticleData[0].title
                var newAtile = articleData[0].title
                //判断文章总数或文章标题是否一致，否则热更新
                if (localSnum !== newSnum || localAtile !== newAtile) {
                    document.getElementById('cf-state').remove()
                    document.getElementById('cf-more').remove()
                    document.getElementById('cf-footer').remove()
                    container.innerHTML = "";
                    var articleSortData = sortNow + "ArticleData";
                    loadStatistical(statisticalData);
                    loadArticleItem(articleData, 0, fdata.initnumber)
                    localStorage.setItem("statisticalData", JSON.stringify(statisticalData))
                    localStorage.setItem(articleSortData, JSON.stringify(articleData))
                    console.log("热更新完成")
                } else {
                    console.log("API数据未更新")
                }
            })
    } else {
        FetchFriendCircle(sortNow, changeUrl)
        console.log("第一次加载完成")
    }
}
// 执行初始化
initFriendCircle(sortNow)