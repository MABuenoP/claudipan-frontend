# 🥖 Claudipan Frontend Application

Aplicación Frontend moderna y responsiva para la panadería y pastelería artesanal **Claudipan**, desarrollada con React 18, Vite, Tailwind CSS y TypeScript.

## 📁 Estructura del Proyecto

```text
├── public/
│   └── logo.png
├── src/
│   ├── assets/             (Imágenes y recursos multimedia)
│   ├── components/
│   │   ├── layout/         (Navbar, Footer, Sidebar)
│   │   ├── ui/             (Modal, Toast, Spinner, Button)
│   │   └── product/        (ProductCard, ProductCatalog)
│   ├── context/            (AuthContext, CartContext)
│   ├── pages/              (Home, Catalog, Cart, Dashboard, Login)
│   ├── services/           (api.ts, authService.ts, productService.ts)
│   ├── utils/              (helpers.ts, constants.ts)
│   ├── data/               (mockData.ts)
│   ├── hooks/              (useAuth.ts, useCart.ts)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .gitignore
├── README.md
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js >= 18.x
- npm / yarn / pnpm

### Pasos

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Iniciar el servidor de desarrollo local:
   ```bash
   npm run dev
   ```

3. Compilar para producción:
   ```bash
   npm run build
   ```

## ✨ Características Principal
- **Catálogo Interactivo**: Filtrado por categorías, búsqueda en tiempo real y vista detallada.
- **Carrito de Compras**: Control de cantidad de ítems, cupones de descuento y cálculo de envío.
- **Autenticación**: Inicio de sesión simulado con credenciales demo.
- **Dashboard de Usuario**: Resumen de pedidos recientes y estadísticas de consumo.
- **Notificaciones Toast**: Alertas interactivas de acciones del sistema.
