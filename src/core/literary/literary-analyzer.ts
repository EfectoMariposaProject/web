import {
  ActantRole,
  SyntaxElement,
  AnachronyType,
  FocalizationType,
  LiteraryAnalysisResult,
  TikTokLiteraryPrompt,
} from './literary-types';

export class LiteraryAnalyzer {
  /**
   * Analiza un texto de contribución y determina su categoría estructural
   */
  public analyzeContribution(id: string, text: string): LiteraryAnalysisResult {
    const lower = text.toLowerCase();

    // 1. Determinar Actante de Greimas
    let actant_role: ActantRole = 'SUBJECT';
    if (lower.includes('ayudar') || lower.includes('aliado') || lower.includes('rescata') || lower.includes('apoyo')) {
      actant_role = 'HELPER';
    } else if (lower.includes('enemigo') || lower.includes('traicion') || lower.includes('freno') || lower.includes('impedir') || lower.includes('amenaza')) {
      actant_role = 'OPPONENT';
    } else if (lower.includes('secreto') || lower.includes('tesoro') || lower.includes('verdad') || lower.includes('libro') || lower.includes('llave')) {
      actant_role = 'OBJECT';
    } else if (lower.includes('revela') || lower.includes('envia') || lower.includes('carta') || lower.includes('mensaje') || lower.includes('orden')) {
      actant_role = 'DESTINATOR';
    } else if (lower.includes('hereda') || lower.includes('recibe') || lower.includes('pueblo') || lower.includes('familia')) {
      actant_role = 'DESTINATARY';
    }

    // 2. Determinar Sintaxis Narrativa
    let syntax_element: SyntaxElement = 'NUCLEUS';
    if (lower.includes('mientras') || lower.includes('sintio') || lower.includes('pensaba') || lower.includes('mira')) {
      syntax_element = 'CATALYSIS';
    } else if (lower.includes('oscuro') || lower.includes('frio') || lower.includes('miedo') || lower.includes('simbolo')) {
      syntax_element = 'INDEX';
    } else if (lower.includes('reloj') || lower.includes('mañana') || lower.includes('habitacion') || lower.includes('calle')) {
      syntax_element = 'INFORMANT';
    }

    // 3. Determinar Anacronía Temporal
    let anachrony_type: AnachronyType = 'LINEAL';
    if (lower.includes('recordo') || lower.includes('hace años') || lower.includes('infancia') || lower.includes('pasado')) {
      anachrony_type = 'ANALEPSIS_INTERNAL';
    } else if (lower.includes('soñaba') || lower.includes('descubriria') || lower.includes('mas tarde') || lower.includes('futuro')) {
      anachrony_type = 'PROLEPSIS_INTERNAL';
    } else if (lower.includes('al mismo tiempo') || lower.includes('mientras tanto')) {
      anachrony_type = 'SIMULTANEITY';
    }

    // 4. Determinar Focalización
    let focalization_type: FocalizationType = 'INTERNAL_FIXED';
    if (lower.includes('yo ') || lower.includes('mi ') || lower.includes('sentí')) {
      focalization_type = 'INTERNAL_FIXED';
    } else if (lower.includes('sabia todo') || lower.includes('sin saberlo ambos')) {
      focalization_type = 'OMNISCIENT';
    } else if (lower.includes('otra version') || lower.includes('sin embargo ella vio')) {
      focalization_type = 'INTERNAL_MULTIPLE';
    }

    // Calculamos el peso dramático (1 a 10)
    const dramatic_weight = Math.min(10, Math.max(1, Math.floor(text.length / 15) + (syntax_element === 'NUCLEUS' ? 3 : 1)));

    // Extraer palabras clave
    const words = text
      .replace(/[^\w\s]/gi, '')
      .split(/\s+/)
      .filter((w) => w.length > 4);
    const keywords = Array.from(new Set(words)).slice(0, 5);

    return {
      contribution_id: id,
      actant_role,
      syntax_element,
      anachrony_type,
      focalization_type,
      dramatic_weight,
      keywords,
      literary_summary: `Contribución clasificada como ${actant_role} (${syntax_element}) con anacronía ${anachrony_type}.`,
    };
  }

  /**
   * Genera un catálogo de convocatorias estratégicas para TikTok basadas en el análisis literario
   */
  public getTikTokLiteraryPrompts(): TikTokLiteraryPrompt[] {
    return [
      {
        id: 'prompt_opponent_01',
        target_actant: 'OPPONENT',
        target_syntax: 'NUCLEUS',
        suggested_focalization: 'INTERNAL_VARIABLE',
        call_to_action_es: '¡Buscamos un Oponente Inesperado para el Capítulo 3!',
        creative_example_es: '"De entre las sombras surgió el antiguo mentor de Elena, bloqueándole el paso con una llave misteriosa..."',
        narrative_goal: 'Generar conflicto directo y obstaculizar el deseo del protagonista.',
      },
      {
        id: 'prompt_helper_01',
        target_actant: 'HELPER',
        target_syntax: 'CATALYSIS',
        suggested_focalization: 'INTERNAL_FIXED',
        call_to_action_es: '¡Comenta un Ayudante clave o un aliado oculto!',
        creative_example_es: '"Un desconocido le entregó un mapa cifrado antes de abordar el tren a medianoche..."',
        narrative_goal: 'Brindar al protagonista las herramientas para resolver la encrucijada actual.',
      },
      {
        id: 'prompt_anachrony_01',
        target_actant: 'OBJECT',
        target_syntax: 'INDEX',
        suggested_focalization: 'INTERNAL_MULTIPLE',
        call_to_action_es: '¡Crea una Analepsis (Flashback)! Revela un secreto de la infancia.',
        creative_example_es: '"Elena recordó la caja de música de su infancia y la frase que su madre murmuró antes de desaparecer..."',
        narrative_goal: 'Profundizar la psicología del personaje mediante una mirada al pasado.',
      },
      {
        id: 'prompt_prolepsis_01',
        target_actant: 'DESTINATOR',
        target_syntax: 'NUCLEUS',
        suggested_focalization: 'OMNISCIENT',
        call_to_action_es: '¡Anticipación del Futuro (Prolepsis)! Propón una profecía o visión.',
        creative_example_es: '"Lo que nadie sabía esa noche era que el incendio del puerto cambiaría sus vidas para siempre..."',
        narrative_goal: 'Crear suspenso e incertidumbre hacia los próximos capítulos.',
      },
    ];
  }
}
