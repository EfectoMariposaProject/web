import { NextResponse } from 'next/server';
import { LiteraryAnalyzer } from '@/core/literary/literary-analyzer';

const SYSTEM_TIKTOK_SUPER_INTELLIGENCE = `Eres el Director Estratégico de Contenido Viral, Psicológico y Guionista Máster de TikTok (BookTok & Mystery) para "Efecto Mariposa Project".

Tu objetivo es transformar la teoría literaria avanzada (Matriz Actancial de Greimas, Anacronías de Genette y Sintaxis de Barthes) en GUIONES DE TIKTOK HIPER-VIRALES, ADICTIVOS Y LLAMATIVOS.

REGLAS DE ORO DE VIRALIDAD PARA TIKTOK:
1. HOOK DE 3 SEGUNDOS: Interrupción de patrón visual/emocional instantánea ("No deslices...", "Alguien borró esto a las 3:33 AM...", "Si estás viendo esto solo...").
2. CONTRATO INTERACTIVO DE AUDIENCIA: Pedir de forma obsesiva a los espectadores que comenten entre 100 y 150 PALABRAS antes de las 3:33 AM para modificar el destino del siguiente capítulo de "La habitación que no existía".
3. ESTRUCTURA ACTANCIAL GREIMAS: Cada guion debe enfocarse en una función actancial específica (OPPONENT, HELPER, OBJECT, DESTINATOR, ANALEPSIS, PROLEPSIS).
4. GUION CON DIRECCIONES PARA EL CREADOR: Incluir acotaciones de actuación entre guiones, tono de voz, uso de utilería (como una cámara instantánea o una llave) y ritmo de dicción.

Debes responder ÚNICAMENTE en JSON válido con el siguiente formato exacto:
{
  "prompts": [
    {
      "id": "tiktok-1",
      "target_actant": "OPPONENT",
      "target_syntax": "NUCLEUS",
      "suggested_focalization": "INTERNAL_VARIABLE",
      "viral_hook": "🚨 STOP: Alguien acaba de borrar la habitación 304 del mapa... 🚨",
      "call_to_action_es": "🔥 ¡RETO URGENTE! Creemos al Oponente Inesperado del Capítulo 3",
      "creative_example_es": "«[Mira a cámara fijamente, tono susurrado y grave con la Polaroid de 1987 en mano] Elena pensaba que estaba sola en el hospital abandonado... pero escuchó tres golpes metálicos detrás del muro. Necesito que en EXACTAMENTE entre 100 y 150 palabras comentes en este video quién o qué está atrapado del otro lado antes de las 3:33 AM... Tu comentario se escribirá en el libro oficial.»",
      "narrative_goal": "Generar conflicto antagónico directo y tensión psicológica inmediata.",
      "suggested_hashtags": "#EfectoMariposa #LaHabitacionQueNoExistia #Reto100a150Palabras #BookTokEspañol #NovelaInteractiva",
      "engagement_trigger": "Comenta entre 100 y 150 palabras para desbloquear la pista oculta en el siguiente video.",
      "audio_recommendation": "Sonido de suspenso in crescendo o frecuencias binaurales 432Hz."
    }
  ]
}`;

export async function GET(req: Request) {
  const openAiKey = process.env.OPENAI_API_KEY;
  const analyzer = new LiteraryAnalyzer();
  const fallbackPrompts = analyzer.getTikTokLiteraryPrompts();

  const { searchParams } = new URL(req.url);
  const dayNumber = searchParams.get('dayNumber') || '1';
  const weekNumber = searchParams.get('weekNumber') || '1';
  const monthNumber = searchParams.get('monthNumber') || '1';
  const dayOfWeek = searchParams.get('dayOfWeek') || 'Lunes';
  const plotContext = searchParams.get('plotContext') || 'La llave tardó tres intentos en entrar. Elena descubre el reloj sonando a las 3:33 PM.';

  if (openAiKey && openAiKey.trim() && !openAiKey.includes('tu_api_key_de_openai')) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey.trim()}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: SYSTEM_TIKTOK_SUPER_INTELLIGENCE,
            },
            {
              role: 'user',
              content: `Genera 4 convocatorias de guion para TikTok con SUPER INTELIGENCIA VIRAL adaptadas específicamente para el DÍA ${dayNumber} (${dayOfWeek}, Semana ${weekNumber}, Mes ${monthNumber} de la parilla de 4 meses de Lunes a Viernes).
Punto de trama del día: "${plotContext}".
Cada guion debe pedir a la audiencia un comentario de entre 100 y 150 palabras antes de las 3:33 AM para moldear esta jornada del reto.`,
            },
          ],
          temperature: 0.88,
          response_format: { type: 'json_object' },
        }),
      });

      const aiData = await response.json();
      const content = aiData.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.prompts) && parsed.prompts.length > 0) {
          return NextResponse.json({ success: true, prompts: parsed.prompts, source: 'OPENAI_GPT4O', dayNumber, weekNumber, monthNumber, dayOfWeek });
        }
      }
    } catch (err) {
      console.warn('[TIKTOK_PROMPTS] Error al llamar a OpenAI, utilizando fallback.', err);
    }
  }

  return NextResponse.json({ success: true, prompts: fallbackPrompts, source: 'LOCAL_FALLBACK', dayNumber, weekNumber, monthNumber, dayOfWeek });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Si se solicita la generación explícita con OpenAI GPT-4o
    if (body.action === 'generate_tiktok_prompts') {
      const { dayNumber = 1, weekNumber = 1, monthNumber = 1, dayOfWeek = 'Lunes', plotContext = '' } = body;
      const openAiKey = process.env.OPENAI_API_KEY;

      if (openAiKey && openAiKey.trim() && !openAiKey.includes('tu_api_key_de_openai')) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey.trim()}`,
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: SYSTEM_TIKTOK_SUPER_INTELLIGENCE,
              },
              {
                role: 'user',
                content: `Genera 4 convocatorias de guiones virales de TikTok hiper-atractivas y super inteligentes para el DÍA ${dayNumber} (${dayOfWeek}, Semana ${weekNumber}, Mes ${monthNumber} de la parrilla de 4 meses de Lunes a Viernes).
Trama del día: "${plotContext || 'Misterio de la Polaroid de 1987 y la prueba de las 100 a 150 palabras a las 3:33 AM.'}".
IMPORTANTE: El script debe pedir exactamente que los comentarios tengan entre 100 y 150 palabras.`,
              },
            ],
            temperature: 0.9,
            response_format: { type: 'json_object' },
          }),
        });

        const aiData = await response.json();
        const content = aiData.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed.prompts) && parsed.prompts.length > 0) {
            return NextResponse.json({ success: true, prompts: parsed.prompts, source: 'OPENAI_GPT4O', dayNumber, weekNumber, monthNumber, dayOfWeek });
          }
        }
      }
    }

    const { id = 'c-01', text = '' } = body;

    if (!text) {
      return NextResponse.json({ success: false, error: 'Texto es requerido' }, { status: 400 });
    }

    const analyzer = new LiteraryAnalyzer();
    const result = analyzer.analyzeContribution(id, text);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

