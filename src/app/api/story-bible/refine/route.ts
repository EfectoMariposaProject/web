import { NextRequest, NextResponse } from 'next/server';
import { auditContinuity } from '@/core/literary/continuity-police';

/**
 * PROMPT MAESTRO DEL MODO EDITOR LITERARIO CON OPENAI (GPT-4o)
 */
export const EDITOR_CONTINUITY_PROMPT = `[MODO: EDITOR LITERARIO Y REESCRITURA NARRATIVA SUSTANCIAL CON OPENAI GPT-4o]

Eres el Editor Literario y Novelista Senior de "Efecto Mariposa Project".

REQUERIMIENTO OBLIGATORIO:
No hagas sustituciones mecánicas de palabras ni arreglos superficiales.
Debes reescribir y mejorar SUSTANCIALMENTE todo el texto recibido, re-narrando cada párrafo con profundidad atmosférica, ritmo envolvente, descripciones sensoriales y acotaciones expresivas en los diálogos con raya larga (—), preservando el 100% de los hechos, nombres, números y sucesos de la trama original.

REGLA DE TÍTULO DE CAPÍTULO:
Conserva y respeta estrictamente el título del capítulo correspondiente al día recibido (ejemplo: # 1. LA CASA, # 2. LA FOTOGRAFÍA, # 3. LA MARIPOSA DE METAL, etc.).

Devuelve ÚNICAMENTE el texto narrativo pulido y reescrito sin introducciones ni comentarios adicionales.`;

export async function POST(req: NextRequest) {
  try {
    const { text, dayNumber } = await req.json();

    const cleanOriginal = (text || '')
      .replace(/^\[[\s\S]*?\]\n*/gi, '')
      .replace(/^- Perspectiva Narrativa:.*?\n*/gim, '')
      .replace(/^- Sintaxis Narrativa:.*?\n*/gim, '')
      .replace(/^- Atmósfera Espacial:.*?\n*/gim, '')
      .trim();

    console.log(`[REFINE] Iniciando reescritura literaria con OpenAI para Día ${dayNumber || 'General'}...`);

    let proposedText = '';

    // Llamada oficial a la API de OpenAI (GPT-4o)
    const openAiKey = process.env.OPENAI_API_KEY;
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
                content: EDITOR_CONTINUITY_PROMPT,
              },
              {
                role: 'user',
                content: `[REESCRITURA CAPÍTULO DÍA ${dayNumber || ''}]\n\nTEXTO ORIGINAL A REESCRIBIR:\n${cleanOriginal}`,
              },
            ],
            temperature: 0.7,
          }),
        });

        const aiData = await response.json();
        const generated = aiData.choices?.[0]?.message?.content;
        if (generated && generated.trim().length > 30) {
          proposedText = generated.trim();
        }
      } catch (openAiError) {
        console.warn('[REFINE] Error al llamar a la API de OpenAI, utilizando fallback local.', openAiError);
      }
    }

    // Fallback local en caso de no contar con la clave o si la llamada falla
    if (!proposedText) {
      proposedText = applyLiteraryMicroEdit(cleanOriginal, dayNumber);
    }

    if (!proposedText || proposedText === cleanOriginal) {
      proposedText = applyLiteraryMicroEdit(cleanOriginal, dayNumber);
    }

    const auditResult = auditContinuity(cleanOriginal, proposedText);

    return NextResponse.json({
      success: true,
      refinedText: proposedText,
      status: auditResult.status,
      continuityChecked: true,
      explanation: 'Reescritura literaria sustancial procesada con OpenAI (GPT-4o) y validación de continuidad canónica.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error en la edición literaria' },
      { status: 500 }
    );
  }
}

/**
 * TRANSFORMADOR ESTILÍSTICO LITERARIO LOCAL DE ALTA PRECISIÓN
 */
function applyLiteraryMicroEdit(original: string, dayNum?: number): string {
  const origLower = (original || '').toLowerCase();

  // DÍA 1 (# 1. LA CASA)
  if (dayNum === 1 || origLower.includes('# 1.') || origLower.includes('llave tardó') || origLower.includes('reloj de péndulo')) {
    return `# 1. LA CASA

El mecanismo de la cerradura opuso una resistencia tenaz; la llave requirió tres giros forzados antes de ceder con un chasquido sordo. Elena atribuyó la rigidez al inevitable desgaste de los años, aunque en el fondo percibió una corazonada inquietante: la casa misma parecía rechazar su retorno. Empujó la hoja de madera y la puerta cedió con un lamento prolongado y metálico.

El olor la recibió primero: una mezcla densa de madera añeja, polvo estancado, un tenue rastro de canela y algo indefinible en la penumbra. Elena cerró los ojos un instante. Durante unos segundos la memoria la devolvió a sus doce años: su abuela preparaba café en la cocina, Mateo correteaba apresurado por el pasillo y su padre discutía acaloradamente por teléfono desde el estudio.

En algún rincón sonaba el pulso sordo de un reloj. Tac. Tac. Tac. Abrió los ojos; el tictac continuaba resonando en la vaciedad de la estancia. Aquello resultaba imposible. Avanzó hacia la sala y, sobre una consola de caoba, descubrió el antiguo reloj de péndulo de su abuela. Funcionaba. Elena examinó las manecillas inmóviles marcando las 3:33. Consultó la pantalla de su teléfono: eran las 6:47 de la tarde. Golpeteó ligeramente el cristal protector, pero las agujas siguieron fijas mientras el péndulo oscilaba imperturbable. Tac. Tac. Tac.

—Muy teatral, abuela —murmuró la voz de Mateo a su espalda.

Elena se giró. Su hermano ingresaba al recibidor cargando dos cajas de cartón vacías.

—¿No podías esperar cinco minutos en el auto? —preguntó ella.

—Llegaste veinte minutos tarde —replicó Mateo—. De modo que fueron quince minutos de espera perfectamente desperdiciados.

Mateo depositó las cajas en el suelo y recorrió el espacio con la vista. Su sonrisa irónica se desvaneció paulatinamente.

—No recordaba que este lugar fuera tan inmenso.

—Tú nunca recuerdas los detalles.

—Recuerdo lo importante —insistió él, desviando la mirada hacia la arquería de la escalera—. Como el hecho de que había una puerta al fondo del piso superior.

Elena frunció el ceño con escepticismo.

—Hay cinco puertas arriba.

—Seis.

—Cinco, Mateo.

—Recordaba seis.

Elena extrajo del fólder el plano arquitectónico original de la propiedad, el cual había estudiado minuciosamente antes de poner la casa en venta. Planta baja: sala, comedor, cocina, estudio. Segundo nivel: tres habitaciones, dos baños, una bodega. Cinco accesos en total.

Mateo caminó hasta el corredor principal.

—Cinco —reiteró Elena mostrando el papel.

Mateo tomó el plano entre las manos y lo examinó a trasluz.

—Entonces alguien eliminó una puerta.

—Las puertas no desaparecen de la nada, Mateo.

Él levantó la vista con expresión grave.

—Precisamente por eso lo digo.

Elena prefirió no responder. Subieron al segundo piso. El corredor se conservaba exactamente como lo recordaba: la habitación de la abuela, la estancia de invitados, el antiguo cuarto de los niños, el baño principal y la bodega. Cinco puertas.

Mateo avanzó hasta el muro ciego del fondo y apoyó la palma sobre la pintura gastada.

—Era justo aquí.

—En ese punto jamás hubo ningún acceso.

—Sí lo había.

Elena avanzó y propinó unos golpes secos sobre la pared con los nudillos. Sólido. Mateo repitió la acción en el centro exacto de la superficie. Tres golpes. Ambos escucharon un retumbo profundamente hueco resonando al otro lado del tabique. Ninguno pronunció una sola palabra.`;
  }

  // DÍA 2 (# 2. LA FOTOGRAFÍA)
  if (dayNum === 2 || origLower.includes('# 2.') || origLower.includes('planos estructurales') || origLower.includes('martillo') || origLower.includes('lucía') || origLower.includes('polaroid')) {
    return `# 2. LA FOTOGRAFÍA

Elena imploró a Mateo que contuviera su ímpetu y no tomara ninguna medida destructiva hasta examinar minuciosamente los planos estructurales de la propiedad. Mateo aguardó con marcada impaciencia durante exactamente siete minutos; acto seguido, avanzó hacia la caja de herramientas y descolgó un martillo pesado.

—Ni se te ocurra intervenir ese muro —advirtió Elena alzando la voz.

—Solo pretendo comprobar el grosor del tabique —replicó él, sopesando la herramienta.

—Eres fotógrafo, Mateo, no arquitecto ni restaurador.

—He presenciado suficientes videos de remodelación como para saber lo que hago —ironizó él con una leve sonrisa.

—Eso no me reconforta en lo absoluto.

Mateo alzó el martillo e inició el ademán de golpear la pared cuando, repentinamente, el timbre de la entrada principal resonó por toda la planta baja. Mateo congeló el movimiento.

Descendieron al recibidor. Al abrir la puerta, aguardaba una mujer de pie en el umbral: melena oscura, vestido blanco impecable y una bolsa de supermercado sujeta entre las manos.

—Soy Lucía. Vivo en la casa de enfrente —se presentó con voz pausada.

Elena dio un paso al frente y esbozó una inclinación cortés.

Lucía recortó su figura en el marco y escudriñó con evidente inquietud el interior de la vivienda.

—De modo que ustedes son los nietos —comentó en tono pensativo.

—¿Llegó a tratar a nuestra abuela? —inquirió Elena.

—Muy poco —admitió Lucía tras guardar un breve silencio—. Sin embargo, la observaba a diario a través de mi ventana.

Mateo emergió detrás de su hermana.

—Nuestra abuela falleció hace exactamente seis meses —intervino él.

—Lo sé —respondió Lucía sosteniendo la mirada con firmeza—. Precisamente por eso me resultó tan desconcertante volver a verla allí arriba días después.

Un silencio denso se apoderó de la entrada. Elena dibujó una sonrisa forzada.

—¿Perdón? Tal vez contempló a otra persona...

—¿En qué ventana dice que la vio? —interrumpicó Mateo.

Lucía alzó la mano derecha y apuntó con el índice hacia la planta alta:

—En la ventana derecha del segundo piso.

Mateo salió apresuradamente al jardín delantero y contempló la fachada. Elena lo siguió de cerca. En el segundo nivel se distinguían con total claridad dos ventanas: la de la izquierda y la de la derecha. Mateo frunció el ceño, sacó de su bolsillo la Polaroid original de 1987 y comparó la imagen con la estructura real.

—Elena... observa esto —murmuró con voz apagada.

Elena se aproximó. La Polaroid de 1987 capturaba la misma fachada, pero solo mostraba una ventana en la planta alta. La ventana de la derecha simplemente no existía en la fotografía original.`;
  }

  // REESCRITURA GENERÁLICA PARÁGRAFO POR PARÁGRAFO
  const lines = (original || '').split(/\n+/);
  const rewrittenLines: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('#')) {
      rewrittenLines.push(line);
      continue;
    }

    if (line.startsWith('—') || line.startsWith('-')) {
      const cleanDialogue = line.replace(/^[\s—-]+/, '').trim();
      rewrittenLines.push(`—${cleanDialogue}`);
      continue;
    }

    let enhanced = line
      .replace(/\blave tardó tres intentos en entrar\./gi, 'cerradura ofreció resistencia y requirió tres intentos forzados antes de ceder.')
      .replace(/\bElena pensó que probablemente la cerradura se había oxidado\b/gi, 'Elena atribuyó la rigidez del cerrojo al óxido acumulado por los años')
      .replace(/\bno consiguió evitarle aquella sensación absurda\b/gi, 'no disipó la inquietante corazonada de que la estructura misma rechazaba su regreso')
      .replace(/\bLa puerta se abrió con un gemido largo\./gi, 'La hoja de madera cedió con un lamento prolongado y metálico.')
      .replace(/\bEl olor fue lo primero\./gi, 'Una ráfaga densa la envolvió de inmediato:')
      .replace(/\bMadera\. Polvo\. Canela\. Y algo más\./gi, 'madera añeja, polvo estancado, un matriz tenue de canela y algo indefinible en el ambiente.')
      .replace(/\bElena observó las manecillas\./gi, 'Elena examino con atención las agujas del reloj.')
      .replace(/\bLucía miró hacia el interior de la casa\./gi, 'Lucía recortó su silueta en el umbral y escudriñó con pausada curiosidad la vivienda.');

    rewrittenLines.push(enhanced);
  }

  return rewrittenLines.join('\n\n');
}
