# Q-Sort

Participant URLs: `/<experimentId>/<lang>` (e.g. `/virtual-idol/ko`). Old links (`/ko`, `/en`) redirect to `/kpop/...`.
Admin: `/admin/<experimentId>`.

## Adding an experiment

1. Convert the statement sheet to `src/experiments/<id>.json` (`{ "ko": [{ "id", "text", "category" }], ... }`). Source sheets live in `data/`.
2. Register it in `src/experiments/index.js` with its languages, column distribution (-4…+4), and landing-page preference key (strings under `preference.<key>` in `src/locales/*.json`).

## Database

All experiments share `q_method_results`; `results` is JSONB (`{ statementId: score }`), so statement counts can differ per experiment.
Each participant session is upserted by `session_id` on every action (`status = in_progress`) and marked `completed` on submit.

Schema changes live in `scripts/migrate.sql` (idempotent):

```sh
vercel env pull .env.local
node --env-file=.env.local scripts/migrate.mjs
```
