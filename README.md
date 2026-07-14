# GitHub Pages Registration App

This is a lightweight registration app for GitHub Pages. Visitors submit a name and phone number, see an in-page success message, and never need to sign in to GitHub.

The recommended privacy-preserving structure is:

- Public Pages repository: hosts only the static registration page.
- Private data repository: stores registration records as private GitHub Issues.
- Cloudflare Worker: receives form submissions and creates Issues in the private data repository using a securely stored GitHub token.

## Files

- `index.html`, `styles.css`, `script.js`: static files for the public GitHub Pages site.
- `backend/cloudflare-worker.js`: the backend API that writes registrations to GitHub Issues.
- `backend/wrangler.toml`: Cloudflare Worker deployment configuration.

## Deployment

### 1. Create two GitHub repositories

- Public Pages repository, for example `event-signup-page`: hosts the GitHub Pages site.
- Private data repository, for example `event-signup-data`: stores registration Issues. Keep this repository private.

### 2. Create a GitHub token

Create a fine-grained personal access token in GitHub with access only to the private data repository:

- Repository access: select only the private data repository.
- Permissions: set `Issues` to `Read and write`.

Copy the generated token. You will store it as a Cloudflare Worker secret.

### 3. Configure and deploy the backend API

Open `backend/wrangler.toml` and update these values:

```toml
PRIVATE_DATA_REPO_OWNER = "your-github-user-or-organization"
PRIVATE_DATA_REPO_NAME = "your-private-data-repository"
PAGES_ORIGIN = "your-github-pages-origin"
```

Example:

```toml
PRIVATE_DATA_REPO_OWNER = "octocat"
PRIVATE_DATA_REPO_NAME = "event-signup-data"
PAGES_ORIGIN = "https://octocat.github.io"
```

Add the GitHub token as a Worker secret:

```bash
wrangler secret put GITHUB_TOKEN
```

Deploy the Worker:

```bash
wrangler deploy
```

After deployment, Cloudflare will provide a Worker URL such as:

```text
https://signup-api.your-name.workers.dev
```

### 4. Configure the public page

Open `script.js` and set the Worker URL:

```js
const CONFIG = {
  apiUrl: "https://signup-api.your-name.workers.dev"
};
```

### 5. Publish with GitHub Pages

Upload only these files to the public Pages repository root:

- `index.html`
- `styles.css`
- `script.js`

Then open the public Pages repository settings and enable GitHub Pages from the main branch.

Do not upload the `backend` folder to the public Pages repository. It is only used to deploy the Worker.

## Viewing registrations

Open the private data repository and go to the `Issues` tab. Registration records use the `registration` label.

## Privacy notes

Names and phone numbers are personal data. Do not write registration Issues to a public repository. Keep the page repository public and the data repository private. The GitHub token should only have Issues write access to the private data repository.
