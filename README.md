# Marc's Library

Needs Node 22.5 or newer.

```sh
npm install
npm run dev            # http://localhost:3000

npm run build && npm start   # production
```

## Environment variables

| Variable | Default | What it's for |
| --- | --- | --- |
| `DB_FILE` | `data/library.db` | Where the local database file lives (ignored once `TURSO_DATABASE_URL` is set) |
| `TURSO_DATABASE_URL` | — | Turso database URL; when set, the app uses Turso instead of a local file |
| `TURSO_AUTH_TOKEN` | — | Auth token for the Turso database |
| `PORT` | `3000` | Port to listen on (`next start`) |
