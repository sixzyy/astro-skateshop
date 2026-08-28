# 🛹 Astro SkateShop

Tienda en línea completa de skate construida con **Next.js 16**, TypeScript, Tailwind CSS v4, Prisma 7 + SQL Server y Stripe.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons |
| Backend | Next.js API Routes (REST) |
| Base de datos | SQL Server + Prisma ORM 7 (driver adapter `@prisma/adapter-mssql`) |
| Autenticación | JWT (`jose`) en cookies HttpOnly + bcrypt |
| Validación | Zod v4 (esquemas compartidos) |
| Pagos | Stripe Checkout en COP (moneda sin decimales) + fallback sin Stripe |
| Estado carrito | Zustand con persistencia en localStorage |

## Estructura

```
src/
├── app/
│   ├── api/
│   │   ├── auth/{register,login,logout,me}/   # Autenticación
│   │   ├── products/[id]/                     # CRUD productos (GET público, POST/PATCH/DELETE admin)
│   │   ├── categories/                        # Categorías
│   │   ├── orders/                            # Órdenes + checkout
│   │   └── webhooks/stripe/                   # Confirmación de pago
│   ├── admin/                                 # Panel: dashboard, CRUD productos, órdenes
│   ├── account/                               # Mis pedidos
│   ├── armador/                               # Armador 3D interactivo (tabla, trucks, ruedas, grip)
│   ├── checkout/                              # Checkout + éxito
│   ├── products/                              # Catálogo con filtros + ficha producto
│   ├── login/ · register/
│   └── page.tsx                               # Home
├── components/                                # UI, layout, product, cart, admin...
├── lib/
│   ├── prisma.ts          # Cliente Prisma singleton (adapter mssql)
│   ├── jwt.ts / auth.ts   # Firma JWT y sesión cookie HttpOnly
│   ├── orders.ts          # Creación de orden + descuento atómico de stock
│   ├── rate-limit.ts      # Rate limiting en login/register/checkout
│   ├── validators.ts      # Esquemas Zod
│   └── stripe.ts          # SDK lazy
├── proxy.ts               # Protección de rutas /admin (rol ADMIN) y /account
└── store/cart.ts          # Carrito global (Zustand)
prisma/
├── schema.prisma          # User, Category, Brand, Product, ProductVariant, Order, OrderItem
└── seed.ts                # Datos demo + usuario admin
```

## Puesta en marcha

### 1. Base de datos

El proyecto usa SQL Server (p. ej. Azure SQL o contenedor Docker). Configura la cadena de conexión en `.env` con el formato del adapter `@prisma/adapter-mssql`, luego:
```bash
npm run db:push        # crea/sincroniza tablas
npm run db:seed        # datos demo (opcional pero recomendado)
```

### 2. Variables de entorno

Copia `.env.example` → `.env`. La `AUTH_SECRET` ya viene generada para desarrollo; regenera en producción:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Instalar y correr

```bash
npm install
npm run db:push        # crea tablas
npm run db:seed        # datos demo (opcional pero recomendado)
npm run dev            # http://localhost:3000
```

### Usuarios demo (del seed)

| Rol | Correo | Contraseña |
|---|---|---|
| Admin | `admin@astroskate.co` | `admin123!` |
| Cliente | `cliente@demo.co` | `cliente123!` |

Panel admin: `/admin`

## Pagos con Stripe (opcional)

Sin configurar Stripe, el checkout funciona en modo directo: valida stock, descuenta inventario y registra la orden.

Con Stripe activo:
1. `.env`: agrega `STRIPE_SECRET_KEY=sk_test_...`
2. Webhook local: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` y copia el secreto a `STRIPE_WEBHOOK_SECRET`
3. El flujo pasa a Checkout Session; al confirmarse el pago, el webhook marca `PAID` y descuenta stock **transaccionalmente**

## Seguridad implementada

- ✅ JWT HS256 firmado, expiración 7 días, cookie **HttpOnly + SameSite=Lax** (inaccesible a JS → mitigación XSS)
- ✅ Roles CLIENT/ADMIN; rutas `/admin` protegidas en proxy + verificación server-side redundante
- ✅ Rate limiting: login 5/min, registro 10/min, checkout 10/min por IP
- ✅ Validación Zod en todos los endpoints; Prisma previene SQLi (queries parametrizadas); React escapa contenido (XSS)
- ✅ bcrypt con cost factor 12
- ✅ Headers HTTP: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- ✅ Descuento de stock atómico (`UPDATE ... WHERE stock >= qty`) dentro de transacciones — evita sobrevender
- ✅ Snapshots de precio/producto en OrderItem: el historial no cambia si editas o eliminas productos

## API REST

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/auth/register` · `/api/auth/login` · `/api/auth/logout` | Público |
| GET | `/api/auth/me` | Sesión |
| GET | `/api/products?category=&brand=&q=&min=&max=&stock=&sort=&page=` | Público |
| POST/PATCH/DELETE | `/api/products[/:id]` | ADMIN |
| GET/POST | `/api/categories` | Público / ADMIN |
| GET | `/api/orders` · `?scope=all` (admin) | Sesión |
| POST | `/api/orders` | Público (checkout) |
| GET/PATCH | `/api/orders/:id` | Dueño / ADMIN |
| POST | `/api/webhooks/stripe` | Firma Stripe |

## Scripts

```bash
npm run dev         # desarrollo
npm run build       # build producción (Turbopack)
npm run start       # servir build
npm run lint        # ESLint
npm run db:push     # sincronizar esquema
npm run db:seed     # datos demo
npm run db:studio   # Prisma Studio
```
