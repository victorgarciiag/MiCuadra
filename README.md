# MiCuadra — demo MVP

App para el jinete: el día a día de sus caballos (diario, salud, gastos y concursos).

## Arrancar en local

```bash
docker compose up -d                       # solo PostgreSQL (puerto 5432)
cd micuadra-backend && mvn spring-boot:run          # API en http://localhost:8080
cd micuadra-frontend && npm install && npx ng serve # http://localhost:4200 (proxy /api -> :8080)
```

La primera vez se cargan unos pocos datos de prueba (2 caballos y un par de registros de cada cosa). Para desactivarlo: `DATOS_DEMO=false`.
Para volver a cargar la demo desde cero: `docker compose down -v && docker compose up -d`.

## Qué hay

- **Inicio:** agenda de la semana (sesiones, cuidados y concursos), lo pendiente de salud, próximos concursos y gasto del mes.
- **Caballo:** foto, diario (tipo, minutos y cómo fue), salud con próxima fecha, gastos y ficha.
- **Concursos:** próximos concursos y qué caballos van.
- **Gastos:** total del mes por categoría y por caballo.

## API

| Método | Ruta |
|---|---|
| GET/POST/PUT/DELETE | `/api/caballos` |
| GET/POST | `/api/caballos/{id}/sesiones`, `/api/caballos/{id}/salud`, `/api/caballos/{id}/gastos` |
| DELETE | `/api/sesiones/{id}`, `/api/salud/{id}`, `/api/gastos/{id}` |
| GET | `/api/gastos?mes=2026-11`, `/api/avisos`, `/api/agenda?desde=&hasta=` |
| GET/POST/DELETE | `/api/concursos` |

## Pendiente a propósito

- Login (siguiente paso).
- Subida de documentos (pasaporte, facturas) y audio en el diario.
- Migraciones con Flyway (ahora `ddl-auto=update`).
- Pasar a Oracle: cambiar la dependencia `postgresql` por `ojdbc11` y la URL JDBC.
