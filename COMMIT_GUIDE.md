## 📘 Guía de Commits para Milkasa

Esta guía te ayudará a mantener un historial de commits claro, consistente y profesional, usando la convención **Conventional Commits**.

---

### 🎯 Estructura básica

```
<tipo>(opcional: contexto): descripción breve
```

#### 📌 Ejemplos válidos:
```
feat: agregar campo de presupuesto en clientes
fix: corregir bug al editar cliente sin correo
style(modal): permitir scroll en móviles
refactor(clientes): simplificar lógica de edición
chore: actualizar dependencias
```

---

### 🔠 Tipos de commit comunes

| Tipo       | ¿Cuándo usarlo?                                                                 |
|------------|----------------------------------------------------------------------------------|
| `feat`     | Cuando agregas una nueva funcionalidad o feature.                               |
| `fix`      | Cuando corriges un bug o error.                                                  |
| `style`    | Cambios de estilo que **no** afectan la lógica (CSS, formato, espacios, etc).    |
| `refactor` | Cambios en el código que no agregan ni corrigen, solo mejoran estructura interna.|
| `docs`     | Cambios en la documentación (README, comentarios, etc).                          |
| `chore`    | Tareas menores del proyecto (actualizar paquetes, configs, scripts).             |
| `test`     | Agregar o modificar pruebas.                                                     |

---

### ✅ Buenas prácticas

- Usa el imperativo en la descripción: `agregar`, `corregir`, `permitir` (no "agregando", "agregado").
- Sé conciso pero claro.
- Usa el campo opcional para indicar el archivo o módulo si es útil.
- Si el commit es muy grande, considera dividirlo en varios pequeños commits con su propia intención.

---

### 🧪 Ejemplos reales en este proyecto:

```
feat(clientes): agregar campo de tipo de propiedad
fix(clientes): evitar crash al no incluir correo
style: mejorar responsividad en modal
refactor(api): mover validaciones a un solo archivo
chore: instalar dependencia react-hook-form
```

---

Con esta guía vas a tener un historial limpio y profesional, ideal para trabajo en equipo y revisión de cambios 🚀

