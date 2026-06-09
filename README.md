# HeartFeel Foundation Website

This is a static website for the HeartFeel Foundation. It is ready to deploy as a static site using GitHub Pages, Netlify, Vercel, or Cloudflare Pages.

## Recommended deployment: GitHub Pages

1. Create a new GitHub repository.
2. In this project folder, run:

```powershell
cd "d:\heartfeel foundtion"
git init
git add .
git commit -m "Initial HeartFeel Foundation website"
```

3. Add the GitHub remote and push:

```powershell
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

4. On GitHub, open the repository settings, enable GitHub Pages, and choose:
   - Branch: `main`
   - Folder: `/ (root)`

5. Visit the published site URL shown in GitHub Pages.

## Alternate deployments

### Netlify

1. Create a Netlify account.
2. Connect your GitHub repo or drag-and-drop this folder to Netlify.
3. Set the build command to empty and publish directory to `./`.

### Vercel

1. Create a Vercel account.
2. Import the GitHub repo.
3. Set framework to "Other" and the root directory to this folder.

### Cloudflare Pages

1. Create a Cloudflare Pages project.
2. Connect your GitHub repo.
3. Set build settings to default, and publish from the root directory.

## Local preview

Open `index.html` in your browser, or use a local static server if you want:

```powershell
# Windows example with Python
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Live admin publishing

The admin panel can save content changes live to the GitHub repository using a personal access token.

1. Generate a GitHub personal access token with the `public_repo` scope.
2. Open `admin.html` and log in with your admin password.
3. Paste the token into the GitHub publish field in the admin panel.
4. Save changes. This updates `site-data.json` in the repository and publishes the data live.

> Note: the token is only used in your browser session and is not saved to the repository.
