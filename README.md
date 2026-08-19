# rustymusty

a simple search engine page. type a query, pick google or duckduckgo from the dropdown, and hit enter or click the arrow to search. searches open in a new tab.

recent searches are saved in your browser (localStorage) so you can quickly re-search something.

optional discord login so you can see your name and avatar in the corner. totally not required, search works fine without it.

## stack

- html
- css
- vanilla js
- vite
- vercel serverless functions (for the discord auth)

## run it

```bash
npm install
npm run dev
```

the vite config has a built-in middleware that handles the auth routes locally so you dont need a separate server.

## setup discord auth (optional)

1. go to https://discord.com/developers/applications and create an application
2. copy the **client id** and **client secret** from the OAuth2 page
3. under **Redirects**, add `http://localhost:5173/api/auth/callback` for local dev
4. copy `.env.example` to `.env` and fill in your values:

```
DISCORD_CLIENT_ID=your_id_here
DISCORD_CLIENT_SECRET=your_secret_here
REDIRECT_URI=http://localhost:5173/api/auth/callback
```

5. restart the dev server

## deploy to vercel

```bash
npm run build
```

the `dist/` folder is what vercel serves.

### env vars on vercel

go to your project → Settings → Environment Variables and add:

| key | value |
|---|---|
| `DISCORD_CLIENT_ID` | your discord client id |
| `DISCORD_CLIENT_SECRET` | your discord client secret |
| `REDIRECT_URI` | `https://idk.vercel.app/api/auth/callback` |

make sure the redirect URI in your discord app settings matches your vercel URL too. then redeploy.
