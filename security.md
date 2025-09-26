# SECURITY

## Principios de seguridad aplicados
- **Uso de HTTPS:** Todas las peticiones al backend se realizan mediante HTTPS para cifrar la información en tránsito.
- **Autenticación con JWT:** Se utiliza JSON Web Token (JWT) para verificar la identidad del usuario en cada petición.
- **Almacenamiento seguro:** En móviles, los tokens se guardan en `SecureStore` (expo-secure-store). En web, se usa `localStorage` solo para pruebas, asegurándose de que el backend esté protegido.
- **Validación de datos:** Todos los formularios validan entradas usando `Yup` para evitar inyecciones y datos inválidos.
- **Cifrado y hashing de contraseñas:** En el backend, las contraseñas se almacenan cifradas (hash con bcrypt).

## Amenazas identificadas y mitigaciones
- **Riesgo de fuga de tokens:** Solo se almacena el JWT localmente en lugar de información sensible del usuario. Se eliminan los tokens al cerrar sesión.
- **Datos inválidos:** Se valida email, password y confirmPassword en frontend y backend.
- **Acceso no autorizado a rutas:** Se verifica la existencia del JWT antes de permitir el acceso a pantallas protegidas como `Home`.
- **Exposición de claves en repositorio:** Las claves de API (ej. NASA API Key) se manejan mediante variables de entorno (`.env`), no se suben al repositorio.

## Lineamientos de seguridad para el equipo
- Nunca subir claves privadas ni `.env` al repositorio.
- Revisar dependencias y librerías antes de agregarlas al proyecto.
- Usar HTTPS siempre que sea posible.
- Eliminar tokens del dispositivo al cerrar sesión.
- Revisar y validar cualquier nueva API consumida por la app.
