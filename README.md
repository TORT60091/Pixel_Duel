# Pixel Duel — Multiplayer Setup

## Files
- `server.js` — WebSocket server
- `gun_duel_mp.html` — game client
- `package.json` — Node.js dependencies

## Deploy on Railway (free)

### 1. Create a GitHub repository
- Go to github.com → New repository
- Name it `pixel-duel`
- Upload all three files: `server.js`, `gun_duel_mp.html`, `package.json`

### 2. Deploy on Railway
- Go to railway.app
- Sign in with GitHub
- New Project → Deploy from GitHub repo → select `pixel-duel`
- Railway will automatically start the server
- Go to **Settings → Networking → Generate Domain** to get your public URL

### 3. Play
- Open the URL in your browser → you are **BILLY** (player)
- Send the same URL to a friend → they are **OUTLAW** (enemy)
- The first person to connect chooses the level
- The second player joins automatically

## Controls
- **A / D** or **← →** — move
- **Space / ↑** — jump (+ slow motion)
- **E (hold)** — slow motion
- **Mouse** — aim
- **LMB** — shoot
