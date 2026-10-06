# Eurotur Portal

Portal interno de Eurotur (DMC): backend Laravel 13 + frontend React 19 vía
Inertia v3, con PostgreSQL como base de datos. Reúne el portal de
información/intranet de la empresa (por sector: Institucional, Sales, RRHH,
Administración, etc.) y un backoffice de administración (usuarios, roles y
herramientas internas).

> Este documento es la referencia para levantar el proyecto y entender qué
> hace falta para que funcione completo. `CLAUDE.md`/`AGENTS.md` tienen
> convenciones de código pensadas originalmente para agentes de IA, pero
> también sirven como referencia de arquitectura para cualquier persona que
> se sume. **`INFORME-CAMBIOS.md` es un changelog puntual de una fecha vieja
> (20/08/2026) — no lo tomes como documentación vigente del estado actual.**

## Qué es este proyecto

- **El portal** (`routes/portal.php`): página de inicio con accesos por
  sector (Institucional, Sales, Customer Care, Producto, Operaciones,
  Contrataciones, RRHH, Administración/Impuestos/Legales, IT, Mesa de
  Información, Q.Rated, Sala de Reuniones, Tipo de Cambio, Travel Designers,
  Innovación, Responsables), más un buscador global y páginas especiales
  como Rendición de Gastos y Pre-Balance dentro de Administración.
- **El backoffice** (`routes/admin.php`, prefijo `/administracion`):
  gestión de usuarios y roles/permisos, y un área de **Herramientas (CRM)**
  que hoy incluye el **Cargador de Facturas** (carga de facturas de
  proveedores a Tourplan, con un flujo de propuesta → aprobación humana →
  ejecución, e Histórico de corridas) y el acceso al **Panel de Prepagos**
  (redirect a una app externa).
- **Cuenta** (`routes/settings.php`): perfil, seguridad (contraseña) y
  apariencia, vía Laravel Fortify.
- Varias secciones **dependen de microservicios externos** que viven en
  repos separados (ver [Dependencias externas](#dependencias-externas-microservicios)
  más abajo) — sin esos servicios corriendo, el resto del portal funciona
  igual, pero esas pantallas puntuales van a fallar o mostrar error de
  conexión.

## Requisitos

- **PHP 8.3** o superior (`composer.json` pide `^8.3`; producción corre
  específicamente 8.3 vía Docker).
- **Composer 2**.
- **Node.js** (LTS reciente — el repo no fija una versión con `.nvmrc` ni
  `engines`, así que no hay una versión "oficial"; usar una LTS actual evita
  sorpresas) y **npm**.
- **PostgreSQL** (ver nota importante en la sección de `.env` — el
  `.env.example` trae SQLite por defecto, pero este proyecto usa Postgres
  tanto en desarrollo como en producción).
- **Opcional — Docker + Docker Compose**: para levantar el proyecto como se
  despliega en producción (ver [Despliegue](#despliegue-producción)).
- **Opcional — el microservicio `cagardor-facturas`**: solo si vas a
  trabajar en o probar el Cargador de Facturas. Es un repo Python/FastAPI
  aparte; trae su propio modo "fake" (sin tocar Tourplan real) pensado
  justamente para desarrollar sin depender de Tourplan.

## Cómo correrlo en desarrollo

```bash
git clone <repo>
cd eurotur-portal

composer install
npm install

cp .env.example .env
php artisan key:generate
```

Después editar el `.env` recién creado:

1. Cambiar la sección de base de datos a Postgres (el `.env.example` trae
   SQLite comentado por defecto):
   ```
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=eurotur
   DB_USERNAME=postgres
   DB_PASSWORD=<tu password local>
   ```
   (el nombre de base `eurotur` es el que se usa en desarrollo local — no
   confundir con el de producción, ver [Despliegue](#despliegue-producción)).
2. Crear esa base en tu Postgres local (`createdb eurotur` o el equivalente
   en tu cliente).
3. Completar las variables de los microservicios externos que necesites
   (ver la tabla de abajo) — podés dejarlas vacías si no vas a usar esas
   pantallas todavía.

Luego:

```bash
php artisan migrate --seed
composer run dev
```

`composer run dev` levanta en paralelo `php artisan serve`, un worker de
colas (`queue:listen`) y Vite — es el único comando que necesitás para
desarrollar. El worker de colas es necesario para que, por ejemplo, el
Histórico del Cargador de Facturas pueda archivar los resultados en segundo
plano.

Entrá a `http://127.0.0.1:8000` (o el puerto que indique `php artisan
serve`) y logueate con el usuario que siembra el seeder:

- **Usuario:** `test@example.com`
- **Contraseña:** `password` (el default del factory de usuarios de
  Laravel — es un usuario de desarrollo, no algo que exista así en
  producción)

Este usuario se crea con rol administrador, así que tiene acceso a todo el
backoffice.

## Variables de entorno (`.env`)

### Core de la aplicación

| Variable | Para qué sirve | Notas |
|---|---|---|
| `APP_NAME` | Nombre mostrado en el portal y en emails | — |
| `APP_ENV` | `local` / `production` | Cambia comportamiento de logs, cache de errores, etc. |
| `APP_KEY` | Clave de cifrado de Laravel (sesiones, cookies) | Generar con `php artisan key:generate`, nunca a mano |
| `APP_DEBUG` | Muestra stack traces detallados en errores | `true` en local, **`false` en producción** |
| `APP_URL` | URL base usada para generar links absolutos | — |
| `APP_LOCALE` | Idioma de la app | `es` |
| `DB_CONNECTION` / `DB_HOST` / `DB_PORT` / `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` | Conexión a PostgreSQL | **Ver nota arriba**: `.env.example` trae SQLite comentado, pero el proyecto real usa Postgres |
| `SESSION_DRIVER` | Dónde se guardan las sesiones | `database` — requiere la tabla `sessions` migrada |
| `QUEUE_CONNECTION` | Dónde se encolan los jobs en segundo plano | `database` — requiere que algo corra `queue:work`/`queue:listen` para que se procesen |
| `CACHE_STORE` | Dónde se guarda la cache de la app | `database` |
| `FILESYSTEM_DISK` | Disco de archivos por defecto | `local` — los archivos sensibles (ej. Histórico del Cargador de Facturas) se guardan en `storage/app/private`, no público |
| `MAIL_MAILER` y demás `MAIL_*` | Envío de emails (reset de contraseña, etc.) | En local suele dejarse en `log` (los emails quedan en el log en vez de enviarse) |

### Integraciones externas (microservicios)

Estas son las variables más importantes para que **funcionen secciones
específicas** del portal — cada una apunta a un servicio que vive **fuera**
de este repo:

| Variable | Para qué sirve | Si falta... |
|---|---|---|
| `BOT_MONITOR_URL` / `BOT_MONITOR_API_KEY` | URL y API key del monitor del bot que carga tipos de cambio en Tourplan (sector "Tipo de Cambio" / widget de estado del bot) | El panel de monitoreo del bot no va a poder conectarse |
| `RECEIPT_OCR_URL` / `RECEIPT_OCR_API_KEY` | Microservicio de OCR que lee comprobantes para autocompletar la Rendición de Gastos (Administración) | La rendición de gastos sigue funcionando, pero sin autocompletado — hay que cargar todo a mano |
| `INVOICE_LOADER_URL` / `INVOICE_LOADER_API_KEY` | Microservicio **`cagardor-facturas`** (repo aparte) que valida y carga facturas de proveedores en Tourplan — es lo que usa el Cargador de Facturas (Herramientas → CRM) | Subir una propuesta falla con "no se pudo conectar con el cargador de facturas" |
| `PREPAGOS_URL` | URL del Panel de Prepagos, una app externa (Streamlit) a la que el backoffice solo redirige | El link "Panel de Prepagos" no funciona. Ojo: es una **IP de red interna** (`192.168.98.4:8498` en el `.env.example`), solo accesible desde dentro de la red de Eurotur/VPN |
| `MEETING_ROOM_CALENDAR_URL` / `MEETING_ROOM_INSTRUCTIVO_URL` | Links externos que usa la Sala de Reuniones (calendario e instructivo) | Esos links salen vacíos en esa pantalla |

**Para conseguir los valores reales** de las API keys hay que pedirlos a
quien administre cada uno de esos microservicios (o, para
`INVOICE_LOADER_API_KEY`, coincide con el `API_KEY` del `.env` del propio
repo `cagardor-facturas` — tienen que ser el mismo valor en ambos lados para
que la autenticación entre los dos servicios funcione).

> Por seguridad, este README no incluye ningún valor real de API key,
> password ni URL interna sensible — esos valores viven únicamente en los
> `.env` de cada entorno (nunca se commitean).

## Testing / calidad

```bash
composer run ci:check
```

Corre, en este orden: `npm run lint:check` (ESLint), `npm run format:check`
(Prettier), `npm run types:check` (`tsc --noEmit`), y después `composer
test` (que a su vez limpia la config, corre Pint en modo chequeo, PHPStan, y
finalmente `php artisan test`).

Para correr solo los tests de PHP:

```bash
php artisan test --compact
php artisan test --compact tests/Feature/Admin/Crm   # una carpeta puntual
php artisan test --compact --filter=nombreDelTest     # un test puntual
```

## Despliegue (producción)

El proyecto se despliega vía Docker (`Dockerfile`, `docker-compose.yml`,
`docker/`):

- `Dockerfile` arma la imagen en 3 etapas (dependencias de Composer, build
  de assets con Vite/Node, imagen final con PHP-FPM + Nginx).
- `docker/entrypoint.sh` corre, cada vez que arranca el contenedor:
  migraciones (`migrate --force`), sincronización de permisos
  (`db:seed --class=RolePermissionSeeder`), y cacheo de config/rutas/vistas.
- `docker/supervisord.conf` mantiene corriendo, dentro del mismo
  contenedor: PHP-FPM, Nginx, un **worker de colas**
  (`queue:work --tries=3 --sleep=3`) y el **scheduler**
  (`schedule:work`).

**Importante:** `docker-compose.yml` usa una base de datos **distinta** a la
de desarrollo local — `DB_HOST=global-postgres`, `DB_DATABASE=eurotur_portal`
(vs. `127.0.0.1`/`eurotur` en local). No son la misma base; no hay que
asumir que los datos de un entorno están en el otro.

## Dependencias externas (microservicios)

Ninguno de estos vive en este repo — son proyectos aparte que este portal
consume por HTTP:

- **Cargador de Facturas / Tourplan** (`INVOICE_LOADER_*`) — repo
  `cagardor-facturas`. Microservicio FastAPI que valida un Excel de Tango,
  genera una propuesta de carga, y ejecuta la inserción en Tourplan
  (automatizada vía Playwright). Trae un **modo fake** (`USE_FAKE_TRANSPORT=true`
  en su propio `.env`) pensado para desarrollar/probar el circuito completo
  sin tocar Tourplan real — se recomienda arrancar por ahí.
- **OCR de comprobantes** (`RECEIPT_OCR_*`) — lee imágenes de comprobantes
  para autocompletar la Rendición de Gastos.
- **Monitor del bot de tipo de cambio** (`BOT_MONITOR_*`) — expone el
  estado de un bot que carga automáticamente los tipos de cambio del día en
  Tourplan.
- **Panel de Prepagos** (`PREPAGOS_URL`) — app Streamlit interna; el portal
  solo la enlaza (no hay integración más profunda), accesible únicamente
  desde la red interna de Eurotur.

## Notas para quien continúe

- `INFORME-CAMBIOS.md` es un snapshot de cambios de una fecha puntual
  (agosto 2026) — hubo trabajo significativo después (roles y permisos,
  Cargador de Facturas, Panel de Prepagos, entre otros). No lo uses como
  changelog vigente; para ver qué cambió realmente, `git log`.
- `CLAUDE.md` y `AGENTS.md` documentan convenciones de código, patrones del
  proyecto y arquitectura con bastante detalle — vale la pena leerlos aunque
  no se use un agente de IA para seguir trabajando.
- El worker de colas (`queue:listen` en desarrollo, `queue:work` en
  producción) es imprescindible para cualquier funcionalidad que dependa de
  jobs en segundo plano (hoy, el archivado del Histórico del Cargador de
  Facturas) — si algo "se sube pero nunca se archiva", lo primero a
  chequear es si el worker está corriendo.
