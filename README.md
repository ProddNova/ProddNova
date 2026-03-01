# ProddNova iOS WebApp

Web app **solo frontend** pensata per uso su iPhone/iPad.

Al momento è disponibile una sola azione:

- `GET /spot` → prende la posizione utente, copia le coordinate negli appunti e apre Google Maps.

## Come avviare in locale

> Per geolocalizzazione + clipboard su iOS è consigliato usare HTTPS o localhost.

1. Avvia un server statico dalla root del progetto:

```bash
python3 -m http.server 8080
```

2. Apri nel browser:

- `http://localhost:8080/spot`

## Come funziona il routing

L'app legge `window.location.pathname` e decide quale automazione eseguire.

- `/spot` = automazione attiva.
- Qualsiasi altro percorso = messaggio "azione non configurata".

Quando vorrai aggiungere nuove azioni, estenderemo la logica in `app.js` (es. `/azione1`, `/azione2`, ecc.).

## Deploy

Puoi pubblicare questa app su qualunque hosting statico (Netlify, Vercel static, GitHub Pages con rewrite, Nginx, ecc.) assicurando che `index.html` venga servito anche su `/spot`.

## Note iOS

- Alla prima esecuzione Safari chiederà il permesso di geolocalizzazione.
- Se il browser blocca la copia automatica negli appunti, usa il tasto **Riprova** (che fornisce un'interazione utente).
