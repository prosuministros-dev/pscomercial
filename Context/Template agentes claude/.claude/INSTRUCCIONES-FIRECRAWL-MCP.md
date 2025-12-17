# 🔧 INSTRUCCIONES: Activar Firecrawl MCP

**API Key configurada**: ✅ `fc-afbc1bd06c2d4ebf8380fcec402676d9`

---

## 📍 PASO 1: Localizar tu Archivo de Configuración MCP

El archivo se encuentra en **TU MÁQUINA LOCAL** (no en el repositorio):

### 🪟 Windows
Abre el Explorador de Archivos y pega esto en la barra de dirección:
```
%APPDATA%\Claude
```
Busca el archivo: **`claude_desktop_config.json`**

### 🍎 macOS
Abre Finder → Menú "Ir" → "Ir a la carpeta..." y pega:
```
~/Library/Application Support/Claude
```
Busca el archivo: **`claude_desktop_config.json`**

### 🐧 Linux
Abre tu explorador de archivos y ve a:
```
~/.config/Claude
```
Busca el archivo: **`claude_desktop_config.json`**

---

## 📝 PASO 2: Editar el Archivo

### Si el archivo YA EXISTE:

1. Abre `claude_desktop_config.json` con un editor de texto
2. Busca la sección `"mcpServers": {`
3. **Agrega** esta configuración dentro (respetando las comas):

```json
"firecrawl": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-firecrawl"],
  "env": {
    "FIRECRAWL_API_KEY": "fc-afbc1bd06c2d4ebf8380fcec402676d9"
  }
}
```

**Ejemplo completo** (agregando Firecrawl a tu configuración existente):
```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=hnkqgsiehshcyebaizuk"
    },
    "playwright": {
      "command": "node",
      "args": ["/path/to/playwright/server.js"]
    },
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-firecrawl"],
      "env": {
        "FIRECRAWL_API_KEY": "fc-afbc1bd06c2d4ebf8380fcec402676d9"
      }
    }
  }
}
```

⚠️ **IMPORTANTE**: Asegúrate de poner una **coma** después de cada bloque excepto el último.

---

### Si el archivo NO EXISTE (crear nuevo):

1. Crea un archivo nuevo llamado: **`claude_desktop_config.json`**
2. Pega este contenido completo:

```json
{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-firecrawl"],
      "env": {
        "FIRECRAWL_API_KEY": "fc-afbc1bd06c2d4ebf8380fcec402676d9"
      }
    }
  }
}
```

3. Guarda el archivo en la ubicación correcta (ver PASO 1)

---

## 🔄 PASO 3: Reiniciar Claude Code

1. **Cierra completamente** Claude Code (o Claude Desktop)
2. **Abre** Claude Code de nuevo
3. La herramienta Firecrawl estará disponible automáticamente

---

## ✅ PASO 4: Verificar que Funciona

Una vez reinicies, prueba enviándome:

```
usa Firecrawl para crawlear https://docs.auco.ai
```

Si funciona, verás que puedo:
- 🕷️ Crawlear múltiples páginas
- 📄 Extraer contenido completo en Markdown
- 🔍 Analizar toda la documentación de una vez

---

## 🆘 Solución de Problemas

### Error: "command not found: npx"
**Solución**: Necesitas tener Node.js instalado
- Descarga: https://nodejs.org/
- Versión recomendada: LTS (20.x o superior)

### Error: "Invalid API key"
**Solución**: Verifica que copiaste la API key completa:
```
fc-afbc1bd06c2d4ebf8380fcec402676d9
```

### Error: "MCP server not found"
**Solución**:
1. Verifica que guardaste el archivo en la ubicación correcta
2. Asegúrate que el JSON es válido (usa https://jsonlint.com)
3. Reinicia Claude Code completamente

---

## 📊 Capacidades de Firecrawl

Una vez configurado, podrás:

✅ **Crawling Completo**:
```
Crawlea https://docs.auco.ai y dame un resumen de todas las secciones
```

✅ **Scraping de Páginas Específicas**:
```
Extrae el contenido de https://docs.auco.ai/api-reference
```

✅ **Mapeo de Sitios**:
```
Dame un mapa completo de todas las URLs en https://docs.auco.ai
```

✅ **Búsqueda en Documentación**:
```
Busca en docs.auco.ai todo sobre webhooks y eventos
```

---

## 🔐 Seguridad

⚠️ **IMPORTANTE**:
- Este archivo contiene tu API key
- NO lo subas a Git (ya está en `.gitignore`)
- NO lo compartas públicamente
- La API key está configurada solo para tu máquina local

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas, dime:
1. ¿Qué sistema operativo usas? (Windows/Mac/Linux)
2. ¿Encontraste el archivo `claude_desktop_config.json`?
3. ¿Qué error aparece al reiniciar?

---

**Configuración creada**: 2025-11-27
**API Key configurada**: ✅ (válida hasta que la revoques en firecrawl.dev)
**Plan**: Gratuito (500 créditos/mes)
