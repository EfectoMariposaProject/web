/**
 * Tipos de datos para el Análisis Literario Estructural
 * basándose en Genette, Greimas, Pimentel, Bajtín y Beristáin.
 */

export type ActantRole = 
  | 'SUBJECT'       // Sujeto (Desea y busca el objeto)
  | 'OBJECT'        // Objeto de Deseo (Meta, persona, secreto o valor)
  | 'DESTINATOR'    // Destinador (Motiva u otorga el objeto)
  | 'DESTINATARY'   // Destinatario (Recibe el beneficio del objeto)
  | 'HELPER'        // Ayudante (Facilita la tarea del sujeto)
  | 'OPPONENT';     // Oponente (Obstaculiza la tarea del sujeto)

export type SyntaxElement = 
  | 'NUCLEUS'       // Núcleo narrativo (Acción decisiva encadenada causa-efecto)
  | 'CATALYSIS'     // Catálisis (Acción de relleno/suspenso entre núcleos)
  | 'INDEX'         // Indicio (Señal temática, psicológica o climática)
  | 'INFORMANT';    // Informante (Dato concreto de tiempo y espacio)

export type AnachronyType = 
  | 'LINEAL'              // Relato lineal (Discurso = Historia)
  | 'ANALEPSIS_EXTERNAL'  // Flashback externo (Aclara antecedentes sin interferir)
  | 'ANALEPSIS_INTERNAL'  // Flashback interno (Interfiere con el relato principal)
  | 'PROLEPSIS_EXTERNAL'  // Flashforward externo (Epílogo/predicción)
  | 'PROLEPSIS_INTERNAL'  // Flashforward interno (Anticipación de evento futuro)
  | 'SIMULTANEITY';       // Historias paralelas simultáneas

export type FocalizationType = 
  | 'OMNISCIENT'          // Focalización 0 (Narrador sabe todo)
  | 'INTERNAL_FIXED'      // Focalización Interna Fija (Un solo personaje)
  | 'INTERNAL_VARIABLE'   // Focalización Interna Variada (Alterna personajes)
  | 'INTERNAL_MULTIPLE'   // Focalización Interna Múltiple/Prismática (Versiones distintas)
  | 'EXTERNAL';           // Focalización Externa (Conductista/Objetiva)

export interface LiteraryAnalysisResult {
  contribution_id: string;
  actant_role: ActantRole;
  syntax_element: SyntaxElement;
  anachrony_type: AnachronyType;
  focalization_type: FocalizationType;
  dramatic_weight: number; // 1 to 10
  keywords: string[];
  literary_summary: string;
}

export interface TikTokLiteraryPrompt {
  id: string;
  target_actant: ActantRole;
  target_syntax: SyntaxElement;
  suggested_focalization: FocalizationType;
  call_to_action_es: string;
  creative_example_es: string;
  narrative_goal: string;
}
