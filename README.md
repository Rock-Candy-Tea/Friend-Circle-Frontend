# 🌐 Friend-Circle-Frontend

> 本仓库为 [hexo-circle-of-friends](https://github.com/Rock-Candy-Tea/hexo-circle-of-friends) 的前端展示资源仓库，提供 JS 和 CSS 文件，便于将朋友圈 API 接口以美观的方式嵌入任意网页中展示内容。

---

## ✨ 项目介绍

本仓库专为 [hexo-circle-of-friends](https://github.com/Rock-Candy-Tea/hexo-circle-of-friends) 提供前端展示支持，适用于静态网站或博客系统。通过引入 JS 与 CSS 文件，可实现「友链朋友圈」的文章流展示功能。

前端展示部分支持多主题，当前默认适配 [Hexo Butterfly](https://github.com/jerryc127/hexo-theme-butterfly) 主题，后续将支持更多主题样式，欢迎 PR！

---

## 🛠 使用方法

在你的网页或 Hexo 页面中插入以下代码片段：

```html
<div id="friend-circle-lite-root"></div>

<script>
    if (typeof UserConfig === 'undefined') {
        var UserConfig = {
            // 你的 hexo-circle-of-friends 后端地址（需部署后端 API）
            private_api_url: 'https://fc.liushen.fun/',

            // 每次点击“加载更多”时加载的文章数量，默认 24
            page_turning_number: 24,

            // 头像加载失败时的默认图片
            error_img: 'https://i.p-i.vip/30/20240815-66bced9226a36.webp',
        }
    }
</script>

<!-- 样式文件：以主题命名，目前默认支持 butterfly -->
<link rel="stylesheet" href="https://fastly.jsdelivr.net/gh/Rock-Candy-Tea/Friend-Circle-Frontend/hexo-theme-butterfly/default.min.css">

<!-- 脚本文件：对应主题样式功能 -->
<script src="https://fastly.jsdelivr.net/gh/Rock-Candy-Tea/Friend-Circle-Frontend/hexo-theme-butterfly/default.min.js"></script>
```

---

## 🎨 主题说明

* 当前仅适配 `hexo-theme-butterfly`，文件位于路径：

  ```
  hexo-theme-butterfly/default.min.css
  hexo-theme-butterfly/default.min.js
  ```

* 未来将考虑支持更多主题，或允许自定义样式引入，欢迎社区贡献新主题样式！

---

## 📦 CDN 支持

推荐通过 [jsDelivr](https://www.jsdelivr.com/) CDN 引入资源，全球节点分发，稳定可靠：

```html
<link rel="stylesheet" href="https://fastly.jsdelivr.net/gh/Rock-Candy-Tea/Friend-Circle-Frontend/hexo-theme-butterfly/default.min.css">
<script src="https://fastly.jsdelivr.net/gh/Rock-Candy-Tea/Friend-Circle-Frontend/hexo-theme-butterfly/default.min.js"></script>
```

> 💡 **国内用户提示**：
>
> * jsDelivr 在国内访问速度相对稳定，但在部分网络环境下可能较慢。
> * 可考虑通过加速镜像（如 `cdn.jsdmirror.com`）或将资源下载到本地并自行托管。
> * 自托管方式可有效避免网络波动导致的加载失败。

---

## 🙌 感谢与贡献

* 前端展示由社区成员整理维护，欢迎 Issues 与 PR。
* 若你适配了其他主题或优化了样式，欢迎提交 Pull Request 与大家分享！

---

## 📄 许可证

本项目遵循 [MIT License](./LICENSE)。
