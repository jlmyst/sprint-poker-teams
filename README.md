# Sprint Poker for Teams

Fibonacci planning poker that runs inside a Teams meeting. Everyone on the call picks a card,
votes stay hidden (you only see who has voted) until someone clicks **Show votes**, then the
mean, median and mode are shown. **New round** clears everything.

Built on [Live Share](https://learn.microsoft.com/microsoftteams/platform/apps-in-teams-meetings/teams-live-share-overview):
Microsoft hosts the real-time sync for meetings, so there is **no backend**, only a static site.

Cards: `0 1 2 3 5 8 13 21 ?`. A `?` is shown but left out of the stats.

## Develop locally

```bash
npm install
npm run dev:local
```

Open http://localhost:5173/?local=1. The URL gets a `#<id>` session id. Open that full URL in
a second tab to act as another participant.

## Deploy

1. Pushing to `main` builds and publishes the site to GitHub Pages
   (`.github/workflows/pages.yml`). In the repo's **Settings → Pages**, set the source to
   **GitHub Actions**. The site lands at `https://<owner>.github.io/<repo>/`.
2. `APP_URL=https://<owner>.github.io/<repo> npm run manifest` writes `manifest/out/sprint-poker.zip`.
3. A Teams admin uploads the zip in **Teams admin center → Teams apps → Manage apps → Upload new app**.
   This publishes it to the org catalogue. There's no Microsoft review for org-only apps.

## Use in a meeting

Open the meeting → **Apps (+)** → Sprint Poker → **Save**. Each person opens it from the
meeting toolbar, or the organiser clicks **Share to stage** so everyone sees it on the main stage.

Votes are hidden in the UI, but every client receives them. Anyone with devtools open could
peek, which is fine for planning poker.
