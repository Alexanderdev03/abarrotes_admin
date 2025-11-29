# Plan de Desarrollo: Abarrotes Alex - Multi-App & Punto de Venta (POS)

Este documento detalla la estrategia para evolucionar "Abarrotes Alex" de una aplicación web monolítica a un ecosistema multi-plataforma robusto, separando la experiencia del cliente de la administración y el punto de venta.

## 1. Arquitectura del Sistema

El objetivo es desacoplar el frontend del cliente del panel de administración/POS.

### Componentes Propuestos:

1.  **App Cliente (Tienda Online)**
    *   **Tecnología:** React (Vite) + PWA.
    *   **Enfoque:** Móvil-first, velocidad, UX para compra rápida.
    *   **Funciones:** Catálogo, Carrito, Perfil, Pedidos, Click & Collect.
    *   **URL:** `tienda.abarrotesalex.com`

2.  **App Admin & POS (Punto de Venta)**
    *   **Tecnología:** React (Vite) o Electron (para escritorio nativo en caja).
    *   **Enfoque:** Escritorio/Tablet, eficiencia operativa, gestión de inventario.
    *   **Funciones:**
        *   **POS:** Interfaz de caja rápida, escáner de código de barras (físico/USB), impresión de tickets.
        *   **Admin:** Dashboard, Inventario, Clientes, Reportes.
    *   **URL:** `admin.abarrotesalex.com` o App de Escritorio.

3.  **Backend (API & Base de Datos)**
    *   **Tecnología:** Node.js (Express/NestJS) o Firebase (Serverless).
    *   **Base de Datos:** PostgreSQL (Relacional, robusta para inventario) o Firestore (NoSQL, rápida para tiempo real).
    *   **Funciones:** API REST/GraphQL, Autenticación centralizada, Sincronización en tiempo real.

---

## 2. Hoja de Ruta de Desarrollo (Roadmap)

### Fase 1: Separación y Backend (Mes 1-2)
*   **Objetivo:** Migrar la lógica de negocio a un backend real y separar los frontends.
*   **Tareas:**
    1.  Configurar proyecto Backend (Node.js + Base de Datos).
    2.  Migrar datos de `localStorage` a la Base de Datos.
    3.  Crear API Endpoints: `/products`, `/orders`, `/users`, `/auth`.
    4.  Refactorizar la App actual para consumir la API en lugar de `localStorage`.
    5.  Crear un nuevo repositorio para el `Admin Panel` y mover allí los componentes de administración.

### Fase 2: Punto de Venta (POS) Avanzado (Mes 3)
*   **Objetivo:** Convertir el Admin Panel en una herramienta de venta física profesional, replicando la eficiencia y UX de sistemas líderes como **SICAR X**.
*   **Diseño de Interfaz (Estilo SICAR X):**
    *   **Layout Dividido:**
        *   **Izquierda/Centro (Catálogo):** Grilla de productos visual con imágenes grandes, nombre y precio. Pestañas o barra lateral para filtrado rápido por categorías.
        *   **Derecha (Ticket Virtual):** Lista vertical de artículos escaneados, controles de cantidad (+/-), subtotal y total siempre visibles.
    *   **Barra Superior:** Buscador universal (foco automático para lector de código de barras), acceso rápido a menú de usuario y notificaciones.
    *   **Barra de Acciones (Inferior/Lateral):** Botones grandes y accesibles para:
        *   `COBRAR` (F12): Abre modal de pago (Efectivo, Tarjeta, Mixto).
        *   `PENDIENTE` (F5): Pone la venta en espera para atender a otro cliente.
        *   `ELIMINAR` (Del): Quita el artículo seleccionado.
        *   `BUSCAR` (F2): Búsqueda avanzada de productos sin código.
*   **Funcionalidades Clave:**
    1.  **Ventas Multitarea:** Capacidad de tener múltiples "carritos" o tickets abiertos simultáneamente (Ventas en espera).
    2.  **Corte de Caja (Cierre de Turno):** Módulo para contar efectivo inicial/final, registrar retiros y entradas de dinero, y generar reporte de cuadre.
    3.  **Verificador de Precios:** Modo kiosco para consultar precios sin agregar a venta.
    4.  **Atajos de Teclado:** Implementación de hotkeys (F-keys) para operar sin mouse.
    5.  **Integración de Hardware:** Soporte nativo para escáneres USB (modo teclado) e impresoras térmicas (ESC/POS).

### Fase 3: App Móvil Nativa (Mes 4)
*   **Objetivo:** Mejorar la fidelización con una app instalable en tiendas.
*   **Tareas:**
    1.  Usar **Capacitor** o **React Native** para empaquetar la App Cliente.
    2.  Implementar Notificaciones Push (Ofertas, Estado de Pedido).
    3.  Publicar en Play Store (y App Store si aplica).

---

## 3. Mejoras Específicas Solicitadas

### Base de Datos
*   **Migración a SQL/NoSQL:** Dejar `localStorage` es crítico para una multi-app.
*   **Sincronización:** Si se vende algo en el POS, el stock debe bajar inmediatamente en la Tienda Online.
*   **Offline Mode:** El POS debe poder vender aunque se vaya internet (sincronizando al volver).

### Dashboard & Reportes
*   **Business Intelligence:** Integrar herramientas como Metabase o PowerBI conectadas a la BD.
*   **Predicción de Demanda:** Usar historial para sugerir qué reabastecer.

### Separación de Vistas
*   **Roles y Permisos:**
    *   `Admin`: Acceso total.
    *   `Cajero`: Solo POS y Corte de Caja.
    *   `Cliente`: Solo Tienda Online.

---

## 4. Próximos Pasos Inmediatos (En este proyecto)

Para preparar el terreno sin reescribir todo hoy:

1.  **Estandarizar Datos:** Asegurar que todos los productos y pedidos tengan una estructura compatible con una BD real.
2.  **Exportación Robusta:** La función de "Exportar Excel" que acabamos de crear es el primer paso para respaldar datos antes de la migración.
3.  **Simulación de API:** Crear una capa de servicio (`services/api.js`) que centralice todas las llamadas a datos. Ahora leerá de `localStorage`, pero mañana apuntará al Backend sin romper la UI.
