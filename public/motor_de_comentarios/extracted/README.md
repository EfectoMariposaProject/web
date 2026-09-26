# EMP TikTok Comment Downloader

Paquete autónomo para recrear en otra plataforma la extracción que produjo el CSV administrativo de EMP.

## Entrada

Una URL pública de TikTok, por ejemplo:

```text
https://www.tiktok.com/@historiasinfin365/video/7673572849923214624
```

El script extrae el `aweme_id` de la URL, consulta los comentarios principales con cursor y después consulta las respuestas de cada comentario principal.

## Salida

El CSV administrativo contiene exactamente estas columnas:

```text
author,username,text,likes,replies,created_at,language
```

Mapeo:

| CSV | TikTok |
|---|---|
| author | `user.nickname` |
| username | `user.unique_id` |
| text | `text` |
| likes | `digg_count` |
| replies | `reply_comment_total` |
| created_at | `create_time` convertido de Unix seconds a ISO UTC |
| language | `comment_language` |

Se preservan emojis, acentos, símbolos, comillas y saltos de línea. Todos los valores CSV se escapan con comillas dobles conforme al estándar CSV.

## Ejecutar

Requiere Node.js 18+:

```bash
node fetch-comments.mjs "https://www.tiktok.com/@historiasinfin365/video/7673572849923214624" comments-admin.csv
```

El programa también guarda `comments-raw.json` junto al CSV si se activa la tercera ruta de salida:

```bash
node fetch-comments.mjs URL comments-admin.csv comments-raw.json
```

## Request de comentarios principales

```text
GET https://www.tiktok.com/api/comment/list/
  ?aweme_id={videoId}
  &count=50
  &cursor={cursor}
  &aid=1988
  &app_language=es-MX
  &region=MX
  &sort_type=1
```

## Request de respuestas

```text
GET https://www.tiktok.com/api/comment/list/reply/
  ?comment_id={commentId}
  &count=50
  &cursor={cursor}
  &item_id={videoId}
  &aid=1988
  &app_language=es-MX
  &region=MX
```

La ruta es una ruta web interna de TikTok y puede cambiar, limitarse o requerir headers/sesión. Mantenerla aislada en un adapter y no mezclarla con la lógica de administración.
