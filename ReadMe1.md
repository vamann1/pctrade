\# ReSpec — Marketplace Componente PC Second-Hand



Platformă de tip marketplace pentru cumpărarea și vânzarea de componente PC și periferice second-hand, dezvoltată ca proiect de stagiu de practică.



\---



\## Funcționalități principale



\- 🛒 Marketplace C2C - orice utilizator poate vinde și cumpăra

\- 🔒 Sistem de plată prin escrow - banii sunt blocați până la confirmare

\- 💬 Sistem de mesagerie cu oferte de preț negociabile

\- 🤖 AI Assistant - sugestii de componente, verificare compatibilitate

\- ❤️ Lista de favorite cu notificări la schimbare preț

\- ⭐ Sistem de recenzii după tranzacții finalizate

\- 🔔 Notificări în timp real (polling)

\- 👤 Profil public pentru verificarea vânzătorilor



\---



\## Rulare cu Docker (recomandat)



\### Pre-requisite

\- \[Docker Desktop](https://www.docker.com/products/docker-desktop/) instalat și pornit

\- Cont \[Groq](https://console.groq.com) pentru AI (gratuit)



\### Pași



\*\*1. Clonează repository-ul:\*\*

```bash

git clone <url-repo>

cd pctrade

```



\*\*2. Creează fișierul `.env`:\*\*

```bash

cp .env.example .env

```



Deschide `.env` și completează:

```env

POSTGRES\_DB=pctrade

POSTGRES\_USER=pctrade\_user

POSTGRES\_PASSWORD=pctrade\_pass

MINIO\_ROOT\_USER=minioadmin

MINIO\_ROOT\_PASSWORD=minioadmin

GROQ\_API\_KEY=gsk\_xxxxxxxxxxxxxxxxxxxx

GROQ\_MODEL=llama-3.3-70b-versatile

```



\*\*3. Pornește aplicația:\*\*

```bash

docker compose up --build

```



Prima pornire durează 3-5 minute (descărcare imagini + build).



\*\*4. Configurează MinIO (o singură dată):\*\*

\- Deschide \[http://localhost:9001](http://localhost:9001)

\- Login: `minioadmin` / `minioadmin`

\- Mergi la \*\*Buckets → Create Bucket\*\*

\- Nume bucket: `pctrade-images`

\- Click \*\*Create Bucket\*\*



\*\*5. Accesează aplicația:\*\*



| Serviciu | URL |

|----------|-----|

| Frontend | \[http://localhost:3000](http://localhost:3000) |

| Backend API | \[http://localhost:8080/api](http://localhost:8080/api) |

| MinIO Console | \[http://localhost:9001](http://localhost:9001) |



\### Oprire

```bash

docker compose down

```



\### Oprire și ștergere date

```bash

docker compose down -v

```



\---



\## Rulare locală (development)



\### Pre-requisite

\- Java 21

\- Node.js 20+

\- Docker Desktop (pentru DB, MinIO, Redis)

\- IntelliJ IDEA



\### Pași



\*\*1. Pornește infrastructura:\*\*

```bash

docker compose -f docker-compose-dev.yml up -d

```



\*\*2. Configurează MinIO:\*\*

\- Deschide \[http://localhost:9001](http://localhost:9001)

\- Creează bucket `pctrade-images` dacă nu există



\*\*3. Pornește Backend:\*\*

\- Deschide folderul `pctrade-backend-main` în IntelliJ

\- Asigură-te că în `application.properties` ai `spring.profiles.active=dev`

\- Adaugă în `application-dev.yml` Groq API key-ul tău

\- Click ▶️ pe `PctradeBackendApplication`

\- Așteaptă mesajul `Tomcat started on port 8080`



\*\*4. Pornește Frontend:\*\*

```bash

cd pctrade-frontend

npm install

npm run dev

```



\*\*5. Accesează aplicația:\*\*

\- \[http://localhost:3000](http://localhost:3000)



\---



\## Structura proiectului

```

pctrade/

├── pctrade-backend-main/     # Spring Boot backend

│   ├── src/main/java/com/pctrade/pctrade\_backend/

│   │   ├── controller/       # REST Controllers

│   │   ├── model/            # Entități JPA

│   │   ├── repository/       # Spring Data repositories

│   │   ├── service/          # Logică business

│   │   ├── dto/              # Data Transfer Objects

│   │   ├── config/           # Configurații Spring

│   │   ├── security/         # Spring Security

│   │   └── specification/    # JPA Specifications

│   └── Dockerfile

├── pctrade-frontend/         # React frontend

│   ├── src/

│   │   ├── pages/            # Pagini principale

│   │   ├── components/       # Componente reutilizabile

│   │   ├── api/              # Axios API calls

│   │   └── context/          # React Context

│   ├── nginx.conf

│   └── Dockerfile

├── docker-compose.yml        # Production Docker Compose

├── docker-compose-dev.yml    # Development Docker Compose

├── .env.example              # Template variabile environment

└── README.md

```



\---



\## Flux de tranzacție (Escrow)

```

PENDING → PAID → CONFIRMED\_BY\_SELLER → SHIPPED  →  COMPLETED

&#x20;                         ↓                             ↓

&#x20;                  Gata de ridicare  → Ridicat →  Banii eliberați

```



| Status | Acțiune |

|--------|---------|

| `PENDING` | Cumpărătorul plasează comanda |

| `PAID` | Cumpărătorul plătește — bani blocați în escrow |

| `CONFIRMED\_BY\_SELLER` | Vânzătorul confirmă că trimite produsul |

| `SHIPPED` | Vânzătorul confirmă expedierea |

| `COMPLETED` | Cumpărătorul confirmă primirea — bani eliberați |

| `CANCELLED` | Tranzacție anulată |

| `DISPUTED` | Dispută deschisă |



\---



\## API Endpoints principale



| Method | Endpoint | Descriere |

|--------|----------|-----------|

| POST | `/api/auth/register` | Înregistrare utilizator |

| POST | `/api/auth/login` | Autentificare |

| POST | `/api/auth/forgot-password` | Generare cod resetare parolă |

| POST | `/api/auth/reset-password` | Resetare parolă cu cod |

| GET | `/api/listings` | Listă anunțuri cu filtre |

| POST | `/api/listings` | Adaugă anunț |

| GET | `/api/listings/{id}` | Detalii anunț |

| POST | `/api/listings/{id}/images` | Upload imagini |

| GET | `/api/transactions/buyer/{id}` | Istoricul achizițiilor |

| GET | `/api/transactions/seller/{id}` | Istoricul vânzărilor |

| POST | `/api/messages` | Trimite mesaj |

| GET | `/api/notifications/{userId}` | Notificări utilizator |

| POST | `/api/favorites` | Adaugă la favorite |

| POST | `/api/ai/chat` | Chat cu AI Assistant |

| GET | `/api/ai/similar` | Produse similare AI |



\---



\## Variabile de environment



| Variabilă | Descriere | Default |

|-----------|-----------|---------|

| `POSTGRES\_DB` | Numele bazei de date | `pctrade` |

| `POSTGRES\_USER` | Utilizator PostgreSQL | `pctrade\_user` |

| `POSTGRES\_PASSWORD` | Parolă PostgreSQL | `pctrade\_pass` |

| `MINIO\_ROOT\_USER` | Utilizator MinIO | `minioadmin` |

| `MINIO\_ROOT\_PASSWORD` | Parolă MinIO | `minioadmin` |

| `GROQ\_API\_KEY` | API key Groq pentru AI | — |

| `GROQ\_MODEL` | Modelul Groq folosit | `llama-3.3-70b-versatile` |



\---





Proiect dezvoltat în cadrul stagiului de practică universitară METAMINDS.



\---



\## Note importante



> ⚠️ \*\*Securitate:\*\* Această aplicație este un demo de facultate. Autentificarea folosește token-uri simple, nu JWT complet implementat. Nu folosiți în producție fără implementarea completă a securității.



> 💡 \*\*AI Demo:\*\* Codul de resetare a parolei este returnat direct în response (fără email) pentru simplificarea demo-ului.



> 🗄️ \*\*Date persistente:\*\* Datele sunt păstrate în volume Docker. Folosiți `docker compose down -v` pentru a șterge toate datele.

