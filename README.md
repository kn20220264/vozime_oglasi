# VozimeOglasi

Oglasnik za vozila u Crnoj Gori — Laravel (backend) + React/Vite (frontend) + MySQL + Redis, sve u Docker-u.

## Servisi i adrese

| Servis     | Kontejner        | Adresa                  |
|------------|------------------|-------------------------|
| Frontend   | vozime_frontend  | http://localhost:5173   |
| Backend API| vozime_backend   | http://localhost:8000   |
| phpMyAdmin | vozime_pma       | http://localhost:8080   |
| MySQL      | vozime_db        | localhost:3306          |
| Redis      | vozime_redis     | localhost:6379          |

Pristup bazi: baza `vozime_oglasi`, korisnik `vozime_user`, lozinka `vozime_pass` (root lozinka: `secret`).

---

## Podizanje sajta (svaki dan)

Sve komande se kucaju iz root foldera projekta (`vozime_oglasi/`), tamo gdje je `docker-compose.yml`.

```bash
# 1. Podigni sve kontejnere u pozadini
docker compose up -d

# 2. Provjeri da li svih 5 kontejnera radi
docker ps
```

To je sve — frontend je na http://localhost:5173. Kod se mijenja uživo (folderi su mount-ovani u kontejnere), ne treba restart za izmjene PHP/JSX fajlova.

## Gašenje sajta

```bash
# Ugasi sve kontejnere (podaci u bazi OSTAJU sačuvani)
docker compose down
```

> ⚠️ `docker compose down -v` briše volume-e: bazu I `vendor` folder — posle toga moraš ponovo `composer install` (vidi dolje) i migracije!

## Restart ispočetka (ugasi pa podigni)

```bash
docker compose down
docker compose up -d
```

## Rebuild (kad se mijenja Dockerfile ili dodaju novi npm/composer paketi)

```bash
docker compose up -d --build
```

## Composer paketi (backend)

**Važno:** `vendor/` živi u Docker volume-u (zbog brzine na Windows-u), pa se composer
komande pokreću **u kontejneru**, ne na hostu:

```bash
# Instalacija paketa (posle git pull-a sa izmjenom composer.json, ili posle `down -v`)
docker compose exec backend composer install

# Dodavanje novog paketa
docker compose exec backend composer require neki/paket

# Ako je backend u restart petlji (prazan vendor), koristi run umjesto exec:
docker compose run --rm --no-deps backend composer install
```

---

## Baza: migracije i seedovanje

Sve artisan komande se izvršavaju **unutar backend kontejnera** (sa hosta ne rade jer host ne vidi `db` hostname):

```bash
# Pokreni nove migracije (posle svakog git pull-a sa novim migracijama)
docker compose exec backend php artisan migrate

# Status migracija
docker compose exec backend php artisan migrate:status

# Seedovanje SVIH seedera (kategorije, marke, gradovi, paketi, filteri...)
docker compose exec backend php artisan db:seed

# Seedovanje samo jednog seedera (npr. paketi)
docker compose exec backend php artisan db:seed --class=PackagesSeeder

# ⚠️ NUKLEARNA OPCIJA: obriši sve tabele + migriraj + seeduj ispočetka (briše sve podatke!)
docker compose exec backend php artisan migrate:fresh --seed
```

## Ostale korisne artisan komande

```bash
# Očisti keš (posle izmjene .env ili konfiguracije)
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan cache:clear

# Storage link (ako slike ne rade — samo jednom posle svježe instalacije)
docker compose exec backend php artisan storage:link

# Ručno pokreni auto-refresh oglasa (AUTO-REFRESH paket)
docker compose exec backend php artisan ads:auto-refresh

# Scheduler — izvršava zakazane komande (auto-refresh svakih sat, featured refresh u ponoć).
# Pokrenuti u posebnom terminalu i ostaviti da radi:
docker compose exec backend php artisan schedule:work

# Uđi u kontejner (shell)
docker compose exec backend bash

# Tinker (Laravel konzola)
docker compose exec backend php artisan tinker
```

## Logovi (kad nešto ne radi)

```bash
# Logovi svih kontejnera uživo
docker compose logs -f

# Samo backend
docker compose logs -f backend

# Samo frontend
docker compose logs -f frontend

# Laravel log fajl
docker compose exec backend tail -50 storage/logs/laravel.log
```

## Frontend komande (van Docker-a, opciono)

Frontend radi u kontejneru automatski. Ove komande trebaju samo za ručni rad:

```bash
cd frontend
npm install          # instalacija paketa
npm run dev          # dev server (ako ne koristiš Docker za frontend)
npm run build        # produkcijski build (provjera da sve kompajlira)
npm run lint         # eslint provjera
```

## Prva instalacija na novoj mašini

```bash
git clone <repo-url>
cd vozime_oglasi

# 1. Backend .env — kopiraj primjer i upiši svoje ključeve (ANTHROPIC_API_KEY itd.)
#    DB podaci moraju biti: DB_HOST=db, DB_DATABASE=vozime_oglasi,
#    DB_USERNAME=vozime_user, DB_PASSWORD=vozime_pass, REDIS_HOST=redis
cp backend/.env.example backend/.env    # pa ručno dopuni ključeve

# 2. Build + podizanje
docker compose up -d --build

# 3. Composer paketi + app key + storage link
docker compose exec backend composer install
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan storage:link

# 4. Baza
docker compose exec backend php artisan migrate --seed
```

## Tipični problemi

| Problem | Rješenje |
|---|---|
| `SQLSTATE Connection refused` | Baza se još podiže — sačekaj 10-20s pa probaj ponovo |
| Slike se ne prikazuju | `docker compose exec backend php artisan storage:link` |
| Izmjene u .env se ne vide | `docker compose exec backend php artisan config:clear` |
| Frontend ne vidi nove npm pakete | `docker compose up -d --build frontend` |
| Backend se stalno restartuje | Prazan vendor volume → `docker compose run --rm --no-deps backend composer install` pa `docker compose restart backend` |
| API je spor (sekunde po zahtjevu) | Provjeri da je vendor u volume-u (`docker-compose.yml` mora imati `vendor_data:/var/www/html/vendor`) i da je backend rebuildovan sa opcache (`docker compose up -d --build backend`) |
| Port zauzet (3306/5173/8000) | Ugasi lokalni MySQL/node proces ili promijeni port u docker-compose.yml |
| Sve čudno / ništa ne radi | `docker compose down` pa `docker compose up -d`, pa pogledaj `docker compose logs -f` |

## Zašto je brzo (ne dirati!)

Na Windows-u je čitanje projekta kroz bind mount ekstremno sporo za PHP (hiljade `vendor/` fajlova po zahtjevu).
Zato su primijenjene tri optimizacije — API je time ubrzan sa ~6s na ~0.3s po zahtjevu:
1. `vendor/` je u Docker **named volume-u** (`vendor_data`) — Linux fajl sistem umjesto Windows mosta
2. **opcache** uključen u `backend/Dockerfile` (izmjene koda se i dalje vide odmah)
3. Cache i sesije idu kroz **Redis** umjesto fajlova (`CACHE_DRIVER=redis`, `SESSION_DRIVER=redis` u `backend/.env`)
