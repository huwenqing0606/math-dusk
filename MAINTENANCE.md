# 《数学的黄昏》 v.0.1 维护说明

基准文件：之前交付的 `数学的黄昏_v21_GitHubPages_标题修正版_huwenqing0606.zip` 内的 `index.html`。
**没有直接读取 private GitHub 仓库的最新文件**；请核对你是否在 GitHub 上另行修改过源文件。

- `index.html`：页面骨架、游戏公开名称（HTML `<title>` 采用你指定的 `数学的黄昏 · 选择决定命运 v.0.1`）。
- `style.css`：原版全部 CSS，内容未修改。
- `images.js`：图片键名到图片文件的映射；不含 Base64 图片。
- `story-data.js`：53 幕剧情、选项、图像绑定修正；按原版原样复制。
- `achievements.js`：属性标签、11 个结局文本、20 个成就定义；按原版原样复制。
- `game.js`：选择树判断、属性、存档、渲染、成就运行逻辑；按原版原样复制。
- `images/`：89 张图片，逐张由原发布版 Base64 解码，**未重采样、未重新压缩**。
- `images_manifest.json`：每张图片的键名、文件名、SHA-256，可用于核对。
- `.nojekyll` 和 `README.md`：从原发布包逐字节复制。

## 上传 GitHub Pages
将 ZIP 解压后，把**文件夹里面的所有内容**放到 `huwenqing0606/math-dusk` 仓库根目录。设置依旧是 `main` / `/(root)`，无需改 `.nojekyll`。第一次拆分须上传 `images/` 文件夹全部图片。

## 后续修改
- 改某幕台词或选项：编辑 `story-data.js` 对应的场景。
- 改图：只需替换 `images/` 中对应的 `.webp` 图片（若名称和格式不变）；不必动 HTML。
- 改游戏逻辑：修改 `game.js`。
- 改成就或结局名称说明：修改 `achievements.js`。
- 改公开版本号：编辑 `index.html` 的 `<title>`。游戏内存档键名仍保留原有 v20 标识，是为了**兼容旧存档**，不要随意修改。

注意：拆分版需通过 HTTP（如 GitHub Pages）访问。直接双击 index.html 在大多数浏览器通常也可加载外部相对路径脚本和图片，但请以 GitHub Pages 上线效果为准。
