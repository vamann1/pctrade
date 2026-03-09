Workflow de pornire pctrade — Windows

Pre-requisite (o singură dată): Docker Desktop cu WSL2 activ, IntelliJ, Node.js, Stripe CLI, Git. Rulează terminalele ca Administrator.

Pasul 1 — Pornește infrastructura:
În terminal rulează 
  cd C:\projects\pctrade 
apoi 
  docker compose -f docker-compose-dev.yml up -d 
apoi 
  docker ps 

Trebuie să vezi pctrade-db, pctrade-minio, pctrade-redis.

Pasul 2 — Verifică MinIO:
Deschide http://localhost:9001, login cu minioadmin / minioadmin.
Asigură-te că bucket-ul pctrade-images există. Dacă nu, îl creezi din Buckets → Create Bucket → pctrade-images.

Pasul 3 — Verifică PostgreSQL: În DBeaver/pgAdmin conectează-te la:
Host localhost 
Port 5432
Database pctrade
User pctrade_user
Password pctrade_pass

Pasul 4 — Pornește Stripe CLI:
În terminal rulează 
  stripe listen --forward-to localhost:8080/api/webhooks/stripe.
Copiază whsec_... afișat și pune-l în application-dev.yml la stripe.webhook-secret.

Pasul 5 — Pornește Spring Boot: Deschide IntelliJ,
  asigură-te că în application.properties ai spring.profiles.active=dev, 
  apoi click ▶️ pe DemoApplication. 
  Așteaptă mesajul Tomcat started on port 8080.
  
Pasul 6 — Pornește Frontend: 
În terminal rulează 
  cd C:\projects\pctrade\pctrade-frontend
apoi 
  npm run dev. 
Așteaptă mesajul Ready on http://localhost:3000.

Pasul 7 — Deschide aplicația: http://localhost:3000 în browser ✅

Oprire: Pentru Docker rulează docker compose -f docker-compose-dev.yml down. 
Pentru Spring Boot click ⏹ în IntelliJ. 
Pentru Frontend apasă Ctrl+C în terminal.
⚠️ Important Windows: Asigură-te că WSL2 e activ și Docker Desktop rulează înainte de orice altceva. 
Dacă Docker nu pornește, verifică Virtualization în Task Manager → Performance → CPU.
