# vozime_oglasi

## O aplikaciji

**VozimeOglasi** je full-stack web aplikacija razvijena korišćenjem React-a na frontend strani i Laravel-a na backend strani, koji funkcioniše kao REST API sistem za oglase vozila. Osnovna svrha aplikacije je da omogući korisnicima objavljivanje i pretragu oglasa za vozila na tržištu Crne Gore, dok administratorima i moderatorima pruža mogućnost upravljanja oglasima, korisnicima, kategorijama i statistikama.

Centralni entiteti aplikacije su **User**, **Ad**, **Make**, **VehicleModel**, **City** i **Equipment**. Korisnici sistema mogu biti neautentifikovani, registrovani (`user`), dileri (`dealer`), moderatori (`moderator`) ili administratori (`admin`). Svaki oglas sadrži detalje o vozilu (marka, model, godište, kilometraža, gorivo, mjenjač, oprema itd.), cijenu, slike i lokaciju.

Poseban akcenat stavljen je na **kontrolu pristupa i bezbjednost sistema**. Registrovani korisnici imaju uvid isključivo u sopstvene oglase i poruke, dok administratori imaju pristup svim resursima i dodatnim rutama za moderaciju, statistiku i upravljanje paketima. Za sve zaštićene rute koristi se autentifikacija putem **Laravel Sanctum**-a.

Aplikacija integriše **vanjske API-je** (Google Maps za prikaz lokacije oglasa i eksternih podataka o cijenama vozila) i nudi **vizualizaciju podataka** putem grafikona (Recharts) i interaktivnih mapa (Leaflet). Implementiran je i sistem **paketa i plaćanja**, koji omogućava korisnicima isticanje oglasa.

Svi podaci se vraćaju u konzistentnom JSON formatu, API je dokumentovan putem **Swagger (L5-Swagger)**, a aplikacija je kontejnerizovana pomoću **Docker**-a.

---

## Tehnički stack

| Sloj       | Tehnologija                              |
|------------|------------------------------------------|
| Frontend   | React + Vite + Tailwind CSS 3            |
| Backend    | Laravel 10 + Sanctum                     |
| Baza       | MySQL 8                                  |
| Cache      | Redis                                    |
| Kontejneri | Docker + docker-compose                  |
| API Docs   | L5-Swagger                               |
| Auth       | Laravel Sanctum (token-based)            |

---

## Instalacija i pokretanje

### Preduslovi

- instaliran **Docker Desktop**
- instaliran **Docker Compose**
- instaliran **Git**
- instaliran **Node.js** i **npm** (za frontend)
- instaliran **Composer** (za backend)

---

### Pokretanje aplikacije

#### 1. Kloniranje repozitorijuma

```bash
git clone https://github.com/<username>/vozime-oglasi.git
```

#### 2. Ulazak u folder projekta

```bash
cd vozime-oglasi
```

#### 3. Kreiranje `.env` fajla u `backend/` folderu

```bash
cp backend/.env.example backend/.env
```

> **NAPOMENA** — U `.env` fajlu podesiti `GOOGLE_MAPS_API_KEY` i ostale externe API ključeve.

#### 4. Pokretanje Docker kontejnera

```bash
docker compose down -v
docker compose up --build
```

#### 5. Nakon što se kontejneri uspješno pokrenu — u drugom terminalu:

Generisanje aplikacijskog ključa:

```bash
docker-compose exec backend php artisan key:generate
```

Brisanje postojećih tabela, pokretanje migracija i punjenje baze testnim podacima:

```bash
docker-compose exec backend php artisan migrate:fresh --seed
```

> Ovaj korak je obavezan — popunjava bazu gradovima Crne Gore, markama i modelima vozila, opremom i test korisnicima.

#### 6. Instalacija frontend (React) paketa lokalno (za VS Code IntelliSense)

```bash
npm --prefix frontend install
```

#### 7. Instalacija Laravel (backend) zavisnosti lokalno

```bash
composer install --no-interaction --prefer-source
```

#### 8. Generisanje Swagger dokumentacije

```bash
docker-compose exec backend php artisan l5-swagger:generate
```

#### 9. Pokretanje automatizovanih testova

```bash
docker-compose exec backend php artisan test
```

---

## Portovi i servisi

| Servis      | URL / Port                          |
|-------------|-------------------------------------|
| Frontend    | http://localhost:5173               |
| Backend API | http://localhost:8000               |
| Swagger UI  | http://localhost:8000/api/documentation |
| phpMyAdmin  | http://localhost:8080               |
| MySQL       | port 3306                           |
| Redis       | port 6379                           |

---

## Korisničke uloge

| Uloga       | Opis                                         |
|-------------|----------------------------------------------|
| `user`      | Registrovani korisnik — objavljuje oglase     |
| `dealer`    | Auto plac / firma — proširene mogućnosti      |
| `moderator` | Moderacija oglasa i prijava                  |
| `admin`     | Potpuna kontrola nad sistemom                |

---

## Test korisnici (nakon seedovanja)

| Email                   | Lozinka  | Uloga       |
|-------------------------|----------|-------------|
| admin@vozime.me         | password | admin       |
| moderator@vozime.me     | password | moderator   |
| dealer@vozime.me        | password | dealer      |
| korisnik@vozime.me      | password | user        |

---

## Git grane

| Grana            | Svrha                          |
|------------------|--------------------------------|
| `main`           | Produkcijska verzija           |
| `develop`        | Aktivni razvoj                 |
| `feature/auth`   | Autentifikacija i uloge        |
| `feature/ads`    | CRUD oglasa i slike            |
| `feature/search` | Pretraga i filtriranje         |
| `feature/admin`  | Admin panel i statistike       |
