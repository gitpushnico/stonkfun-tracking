# Long Filt

Combined StonkFun scanner. Market cap, 24h volume, and newest at the same time — the site only lets you sort by one.

## Run

```bash
npm install
npm run dev
```

Opens on [http://localhost:5173](http://localhost:5173).

Default band is **$4k–$25k market cap**, **min $1k volume**, **last 24h**, sorted newest first. Change any of the three without leaving the others.

Data comes from the public StonkFun API (`GET /api/public/v1/tokens?sort=newest`). No key. Live rescan every 20 seconds.
