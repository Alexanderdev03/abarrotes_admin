# Roadmap: Beta App Android con React Native

Este documento detalla el plan paso a paso para crear una versión Beta de la aplicación "Abarrotes Alex" para Android utilizando **React Native** con **Expo**.

## 🎯 Objetivo
Crear una aplicación móvil nativa instalable (.apk) que replique las funcionalidades clave de la tienda online actual (Catálogo, Carrito, Pedidos) para pruebas en dispositivos Android.

## 🛠️ Stack Tecnológico Recomendado
*   **Framework:** React Native (vía **Expo**).
    *   *¿Por qué Expo?* Facilita enormemente la configuración, el desarrollo y la generación de APKs sin necesitar Android Studio complejo al inicio.
*   **Lenguaje:** JavaScript / React.
*   **Navegación:** React Navigation (Stack & Tabs).
*   **UI:** NativeWind (Tailwind para RN) o React Native Paper.
*   **Estado:** Context API (reutilizando lógica existente) o Zustand.
*   **Backend:** Firebase (ya integrado en la web, fácil de conectar).

---

## 📅 Fases del Desarrollo

### Fase 1: Configuración del Entorno (Día 1)
1.  **Instalar Node.js** (Ya lo tienes).
2.  **Instalar Expo CLI:**
    ```bash
    npm install -g eas-cli
    ```
3.  **Crear Proyecto:**
    ```bash
    npx create-expo-app abarrotes-mobile
    cd abarrotes-mobile
    ```
4.  **Ejecutar en Móvil:**
    *   Descargar app **Expo Go** en tu celular Android.
    *   Correr `npx expo start` y escanear el QR.

### Fase 2: Estructura y Navegación (Día 2-3)
1.  **Instalar React Navigation:**
    ```bash
    npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
    ```
2.  **Definir Rutas:**
    *   **Tab Navigator (Menú Inferior):** Inicio, Buscar, Carrito, Perfil.
    *   **Stack Navigator:** Detalle de Producto, Checkout, Login.
3.  **Crear Pantallas Base:** (Archivos vacíos por ahora: `HomeScreen.js`, `CartScreen.js`, etc.).

### Fase 3: Portar Lógica y UI (Día 4-7)
1.  **Adaptar Componentes:**
    *   No puedes copiar y pegar HTML (`<div>`, `<span>`).
    *   Debes traducir a nativo:
        *   `<div>` -> `<View>`
        *   `<span>` / `<p>` -> `<Text>`
        *   `<button>` -> `<TouchableOpacity>` o `<Pressable>`
        *   `<img>` -> `<Image>`
    *   *Tip:* Copia la lógica (funciones JS) de tus componentes web, pero reescribe el `return` (JSX).
2.  **Estilos:**
    *   Si usas **NativeWind**, puedes reutilizar muchas clases de Tailwind.
    *   Si no, tendrás que crear `StyleSheet.create({...})`.
3.  **Conectar Firebase:**
    *   Instalar Firebase para RN: `npx expo install firebase`.
    *   Copiar tu configuración de `firebase.js` de la web.

### Fase 4: Funcionalidades Core (Día 8-12)
1.  **Catálogo:**
    *   Lista de productos (usar `FlatList` para rendimiento, no `map`).
    *   Tarjetas de producto con imagen y botón "Agregar".
2.  **Carrito:**
    *   Estado global del carrito.
    *   Persistencia: Usar `AsyncStorage` (equivalente a `localStorage`).
3.  **Pedidos:**
    *   Enviar pedido a Firebase (misma lógica que la web).

### Fase 5: Generación del APK (Beta) (Día 13)
1.  **Configurar EAS (Expo Application Services):**
    *   Crear cuenta en expo.dev.
    *   `eas login`
    *   `eas build:configure`
2.  **Generar Build para Android:**
    ```bash
    eas build -p android --profile preview
    ```
    *   Esto generará un archivo `.apk` que puedes descargar e instalar en cualquier Android manualmente.

---

## 🚀 Pasos Inmediatos para Ti

Si quieres empezar **YA**:

1.  Abre una nueva terminal.
2.  Navega a la carpeta donde quieres el proyecto (fuera de `abarrotes_store` actual, o al lado).
3.  Ejecuta: `npx create-expo-app abarrotes-mobile`.
4.  Dime cuando esté listo para ayudarte a configurar la estructura de carpetas.
