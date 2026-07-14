# GitHub 报名小程序

这是一个可以放到 GitHub Pages 的报名页。报名需要填写姓名和电话号码，提交后页面会直接显示成功，不需要报名者登录 GitHub。

更稳妥的部署结构是：

- 公开 Pages 仓库：只放报名页面，不保存报名数据。
- 私有报名数据仓库：只用于保存报名 Issues，仓库保持 private。
- Cloudflare Worker：接收报名表单，并用安全保存的 GitHub Token 向私有仓库创建 Issue。

## 文件说明

- `index.html`、`styles.css`、`script.js`：放到 GitHub Pages 的报名页面。
- `backend/cloudflare-worker.js`：后端接口，负责安全写入 GitHub Issues。
- `backend/wrangler.toml`：Cloudflare Worker 部署配置。

## 部署步骤

### 1. 创建两个 GitHub 仓库

- 公开页面仓库，例如 `event-signup-page`：用于开启 GitHub Pages。
- 私有数据仓库，例如 `event-signup-data`：用于保存报名 Issues，请设置为 private。

### 2. 创建 GitHub Token

在 GitHub 创建一个 Fine-grained personal access token，只给私有数据仓库开放权限：

- Repository access：只选择私有数据仓库
- Permissions：`Issues` 选择 `Read and write`

复制生成的 token，后面会放到 Cloudflare Worker 的 secret 里。

### 3. 部署后端接口

进入 `backend/wrangler.toml`，把下面三项改成你的信息：

```toml
PRIVATE_DATA_REPO_OWNER = "你的 GitHub 用户名或组织名"
PRIVATE_DATA_REPO_NAME = "你的私有数据仓库名"
PAGES_ORIGIN = "你的 GitHub Pages 地址"
```

然后在 Cloudflare Worker 里添加 secret：

```bash
wrangler secret put GITHUB_TOKEN
```

再部署：

```bash
wrangler deploy
```

部署成功后，你会得到一个 Worker 地址，例如：

```text
https://signup-api.your-name.workers.dev
```

### 4. 配置报名页面

打开 `script.js`，把接口地址填进去：

```js
const CONFIG = {
  apiUrl: "https://signup-api.your-name.workers.dev"
};
```

### 5. 开启 GitHub Pages

把 `index.html`、`styles.css`、`script.js` 上传到公开页面仓库根目录。然后打开公开页面仓库的 `Settings` -> `Pages`，选择从主分支发布。

`backend` 文件夹不用放到公开 Pages 仓库里；它只用于部署 Worker。

## 查看报名数据

进入私有数据仓库的 `Issues` 页面，带有 `报名` 标签的 Issue 就是报名记录。

## 隐私提醒

电话号码属于隐私数据。请不要把报名 Issues 写入公开仓库。公开仓库只放页面，报名数据只写入私有数据仓库，并且 GitHub Token 只授予这个私有仓库的 Issues 写入权限。
