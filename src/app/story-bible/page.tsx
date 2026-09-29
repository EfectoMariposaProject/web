'use client';

import { useState, useEffect } from 'react';
import { 
  Users, HelpCircle, Sprout, Plus, Sparkles, RefreshCw, Calendar, 
  BookOpen, Edit3, CheckCircle2, ChevronRight, Clock, MapPin, Feather, Filter,
  FileText, Lock, Unlock, Upload, Play, Trash2, AlertTriangle, ShieldCheck, X, Eye, FileCode, GitCompare, Code2,
  History, RotateCcw
} from 'lucide-react';
import { useEmpCache } from '@/lib/cache/CacheProvider';


interface NovelDay {
  dayNumber: number;
  weekNumber: number;
  monthNumber: number;
  dayOfWeek: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';
  narrativeLine: string;
  openingText?: string;
}

interface UIModalState {
  isOpen: boolean;
  type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'CONFIRM';
  title: string;
  message: string;
  details?: {
    novelTitle?: string;
    charactersCount?: number;
    chaptersCount?: number;
    mysteriesCount?: number;
  };
  onConfirm?: () => void;
}

interface AIProposalState {
  dayNumber: number;
  proposedText: string;
  explanation: string;
  status: string;
}

interface DayVersion {
  id: string;
  versionNumber: number;
  savedAt: string;
  text: string;
  wordCount: number;
  isAiEdited: boolean;
  notes?: string;
}

const DEMO_NOVEL_RAW_TEXT = `# LA HABITACIÓN QUE NO EXISTÍA

### Novela ficticia experimental • Demo para Efecto Mariposa Project

## PERSONAJES PRINCIPALES

**ELENA VARELA, 38 años**
Arquitecta. Metódica, escéptica y obsesionada con encontrar explicaciones racionales para todo. Regresa a Monterrey después de diecisiete años para vender la antigua casa de su abuela.

**MATEO VARELA, 34 años**
Hermano menor de Elena. Fotógrafo. Impulsivo, irónico y mucho más sentimental de lo que admite. Fue el último miembro de la familia que vio con vida a su abuela.

**SOFÍA ALCÁZAR, 37 años**
Amiga de infancia de Elena. Periodista. Curiosa hasta niveles peligrosos. Conserva una caja que la abuela de Elena le entregó años atrás con instrucciones precisas de no abrirla.

**TOMÁS LERMA, 42 años**
Notario encargado de la sucesión. Elegante, reservado y aparentemente ajeno a los asuntos familiares. Sin embargo, conoce detalles de la casa que nadie recuerda haberle contado.

**LUCÍA SALDAÑA, 29 años**
Vecina de la casa. Vive enfrente desde hace apenas dos años. Afirma haber visto en varias ocasiones a una mujer encendiendo la luz de una habitación del segundo piso, incluso después de la muerte de la abuela.

**GABRIEL VARELA, 67 años**
Padre de Elena y Mateo. Vive en otra ciudad y se niega a regresar a la casa. Cuando Elena menciona una habitación al final del pasillo, Gabriel le pide que abandone inmediatamente el lugar.

---

# 1. LA CASA

La llave tardó tres intentos en entrar. Elena pensó que probablemente la cerradura se había oxidado, aunque la explicación no consiguió evitarle aquella sensación absurda de que la casa estaba resistiéndose. Empujó. La puerta se abrió con un gemido largo. El olor fue lo primero. Madera. Polvo. Canela. Y algo más. Elena cerró los ojos. Durante unos segundos volvió a tener doce años. Su abuela estaba en la cocina preparando café. Mateo corría por el pasillo. Su padre discutía por teléfono en el estudio. Y en algún lugar de la casa sonaba un reloj. Tac. Tac. Tac. Abrió los ojos. El reloj seguía sonando. Eso era imposible. Caminó hacia la sala. Sobre una pequeña mesa encontró el antiguo reloj de péndulo de su abuela. Funcionaba. Elena observó las manecillas. 3:33. Sacó su teléfono. 6:47 de la tarde. Golpeó ligeramente el cristal. Las agujas permanecieron inmóviles. Pero el péndulo continuó moviéndose. Tac. Tac. Tac. —Muy teatral, abuela. La voz de Mateo apareció detrás de ella. Elena volteó. Su hermano entró cargando dos cajas vacías. —¿No podías esperar cinco minutos? —Llegaste veinte minutos tarde. —Entonces fueron quince minutos de espera perfectamente desperdiciados. Mateo dejó las cajas en el piso. Miró alrededor. Su sonrisa desapareció lentamente. —No recordaba que fuera tan grande. —Tú nunca recuerdas nada. —Recuerdo algunas cosas. Elena percibió el cambio en su voz. —¿Como qué? Mateo miró hacia la escalera. —Como que había una puerta arriba. Elena frunció el ceño. —Hay cinco. —Seis. —Cinco. —Había seis. Elena sacó de su carpeta el plano original de la propiedad. Lo había revisado decenas de veces antes de aceptar venderla. Planta baja. Sala. Comedor. Cocina. Estudio. Segundo nivel. Tres habitaciones. Dos baños. Bodega. Cinco puertas hacia el corredor. —Cinco. Mateo tomó el plano. —Entonces quitaron una. —Las puertas no desaparecen, Mateo. Él levantó la vista. —Precisamente por eso lo digo. Elena no respondió. Subieron. El corredor estaba exactamente como ella lo recordaba. La habitación de su abuela. La habitación de invitados. El antiguo cuarto de los niños. El baño. La bodega. Cinco puertas. Mateo caminó hasta el final. Tocó la pared. —Era aquí. —Ahí nunca hubo nada. —Sí había. Elena golpeó el muro con los nudillos. Sólido. Mateo hizo lo mismo. Tres golpes. Los dos escucharon el sonido hueco. Ninguno dijo nada. Entonces algo cayó al otro lado de la pared.

# 2. LA FOTOGRAFÍA

Elena pidió a Mateo que no hiciera nada hasta revisar los planos estructurales. Mateo esperó exactamente siete minutos. Después buscó un martillo. —Ni se te ocurra. —Solo quiero comprobar el espesor. —Eres fotógrafo. —He visto muchos videos de remodelaciones. —Eso me tranquiliza muchísimo. Mateo estaba a punto de golpear cuando sonó el timbre. Abajo esperaba una mujer. Cabello oscuro. Vestido blanco. Una bolsa de supermercado entre las manos. —Soy Lucía. Vivo enfrente. Elena se presentó. Lucía miró hacia el interior de la casa. —Entonces ustedes son los nietos. —¿Conoció a nuestra abuela? —Muy poco. Hizo una pausa. —Pero la veía mucho. Mateo apareció detrás de Elena. —Murió hace seis meses. —Lo sé. Lucía sostuvo la mirada. —Por eso me pareció extraño verla después. Silencio. Elena sonrió incómoda. —¿Perdón? —Tal vez era otra persona. —¿Dónde la vio? Lucía señaló hacia arriba. —En la ventana. Mateo salió al porche. —¿Cuál? Lucía se acercó a la banqueta y apuntó hacia el extremo derecho del segundo piso. Elena levantó la cabeza. Había una ventana. Exactamente donde se encontraba la pared hueca. Regresó inmediatamente al interior. Subió corriendo. Midió mentalmente el pasillo. Revisó nuevamente el plano. No tenía sentido. Desde el exterior existía una ventana. Desde el interior, no. Mateo apareció sosteniendo algo. —Encontré esto dentro del cajón de la cómoda. Era una fotografía Polaroid. Seis personas posaban frente a la casa. Elena reconoció inmediatamente a su abuela. También reconoció a su padre. Era muy joven. Quizá veinticinco años. Había otras tres personas que no conocía. Y una niña. Tendría aproximadamente ocho años. En la parte inferior alguien había escrito: “Verano de 1987. Antes de cerrar la habitación.” Elena sintió un escalofrío. Giró la fotografía. Había otra frase. “Si alguna vez vuelven a abrirla, no dejen que Gabriel entre primero.” Mateo leyó por encima de su hombro. —Papá. Elena sacó inmediatamente su teléfono. Gabriel contestó al cuarto tono. —¿Ya llegaron? —Sí. —Terminen rápido. No quiero que pasen la noche ahí. Elena miró a Mateo. —Papá, encontramos una fotografía. Silencio. —¿Qué fotografía? —De 1987. La respiración al otro lado cambió. —Elena. —¿Quién es la niña? Ninguna respuesta. —Papá. Gabriel finalmente habló. —Escúchame con mucha atención. Su voz temblaba. Elena jamás había escuchado temblar la voz de su padre. —Salgan de esa casa. —¿Por qué? —Ahora. —Hay una habitación detrás de una pared. Silencio. Después: —No la abras. La llamada terminó. Mateo miró el martillo. Después miró a Elena. —Bueno. Levantó el brazo. —Ahora definitivamente tenemos que abrirla.

# 3. LAS CIENTO CINCUENTA PALABRAS

No rompieron la pared. Todavía. Elena convenció a Mateo de esperar hasta encontrar alguna explicación. Aquella misma noche llegó Sofía. Traía una botella de vino y una caja metálica. —Tu abuela me pidió que te entregara esto cuando regresaras. Elena observó la caja. —Mi abuela murió hace seis meses. —Me la dio hace nueve años. Mateo soltó una carcajada. —Nuestra familia es completamente normal. Sofía dejó la caja sobre la mesa. Tenía una cerradura con combinación. En la tapa aparecía grabada una mariposa. —¿Cuál es la combinación? —No lo sé. —¿Nunca intentaste abrirla? —Claro que intenté abrirla. —Eso explica por qué somos amigas. Sofía sacó un sobre de su bolso. —También me dio esto. Dentro había una tarjeta. Solamente contenía una frase: “Cuando Elena vuelva a la casa, pregúntale qué recuerda de la habitación azul.” Elena dejó de respirar unos segundos. Había algo. No una memoria. Más bien la sombra de una memoria. Una pared azul. Una lámpara. Alguien cantando. Y un texto de entre 100 y 150 palabras. No sabía cómo podía estar segura. —Yo conocía esa habitación. Mateo se acercó. —Te dije que existía. —No recuerdo haber entrado. —Pero recuerdas algo. Elena cerró los ojos. Una niña hablaba. Otra niña escuchaba. Una de ellas era Elena. La otra... Nada. Abrió los ojos. —Había alguien conmigo. Sofía tomó una libreta. —¿Quién? —Una niña. Mateo colocó la fotografía de 1987 sobre la mesa. —¿Ella? Elena observó el rostro. No podía reconocerla. Pero sintió una presión inmediata en el pecho. —Creo que sí. En ese momento alguien golpeó la puerta. Tres veces. Tomás Lerma esperaba afuera. El notario. —Lamento venir sin avisar. Miró a las tres personas reunidas. Después vio la fotografía. Su expresión cambió. —¿Dónde encontraron eso? Elena cruzó los brazos. —¿La reconoce? Tomás tardó demasiado en responder. —No. Sofía sonrió. —Miente bastante mal para ser notario. Tomás ignoró el comentario. —Necesito hablar con ustedes sobre una cláusula del testamento. Sacó una carpeta. —Su abuela estableció una condición antes de vender la propiedad. Elena tomó el documento. Leyó. Volvió a leer. —Esto es absurdo. Mateo se acercó. —¿Qué dice? Elena dejó la hoja sobre la mesa. La cláusula era sencilla. Durante siete noches consecutivas, los dos hermanos debían permanecer dentro de la casa. Si abandonaban voluntariamente la propiedad durante ese periodo, perderían la herencia. Sofía levantó una ceja. —Tu abuela tenía sentido del espectáculo. Tomás cerró la carpeta. —Hay otra condición. —Por supuesto que hay otra condición. El notario señaló el reloj detenido. 3:33. —Cada noche, exactamente a esa hora, tienen que escribir un comentario de entre 100 y 150 palabras sobre lo ocurrido durante ese día. Elena soltó una pequeña risa. —¿Entre 100 y 150 palabras? —Exactamente. —¿Y después? Tomás miró hacia la escalera. —Después deberán introducirlas debajo de la puerta. Silencio. Mateo señaló el segundo piso. —No hay puerta. Tomás respondió: —Todavía.

# 4. LA PRIMERA NOCHE

A las 3:28 de la madrugada estaban los cuatro sentados en el corredor. Elena. Mateo. Sofía. Tomás. Lucía observaba desde la calle. Elena había insistido en que permaneciera afuera. Nadie había roto la pared. No había puerta. Solo yeso. 3:31. Mateo sostenía el teléfono grabando. 3:32. Elena miró el reloj digital. 3:33. Las luces se apagaron. Un sonido recorrió la pared. No fue un golpe. Pareció el movimiento de un cerrojo. Cuando volvieron las luces, algo había cambiado. En el muro apareció una línea vertical. Después otra. Un rectángulo. Mateo retrocedió. —No puede ser. Una puerta comenzaba a dibujarse lentamente sobre la pared. Como humedad atravesando pintura vieja. Primero apareció el marco. Luego el picaporte. Finalmente una pequeña ranura cerca del suelo. Elena no podía moverse. Sofía tampoco. Tomás fue el único que no parecía sorprendido. Elena lo vio. —Tú sabías. Tomás respondió: —Sabía que podía ocurrir. —Eso significa que ya lo habías visto. No contestó. Mateo sacó la hoja. Habían discutido durante veinte minutos qué escribir. Finalmente redactaron un fragmento de 125 palabras: “Regresamos buscando vender una casa, pero encontramos una habitación escondida, una fotografía, una niña desconocida y demasiadas preguntas. Si alguien está detrás de esta puerta, queremos saber quién es y qué ocurrió aquí.” Mateo dobló el papel. Lo introdujo por la ranura. Nada. Esperaron. Un minuto. Dos. Cinco. Entonces escucharon pasos. Al otro lado. Alguien caminaba dentro. Los pasos se acercaron. Se detuvieron frente a ellos. Una hoja apareció lentamente por debajo. Elena la recogió. Había una frase escrita a mano. “Yo también quiero saber qué me ocurrió.” Sofía se llevó una mano a la boca. Mateo dejó de grabar. Elena reconoció aquella letra. La había visto cientos de veces durante su infancia. Era su propia letra.

# 5. LA NIÑA SIN NOMBRE

A la mañana siguiente Elena llamó nuevamente a su padre. Gabriel no contestó. Lo intentó seis veces. Nada. Mateo amplió digitalmente la fotografía. La niña aparecía ligeramente separada del resto. Cabello corto. Vestido amarillo. Una pulsera roja. Sobre su brazo podía distinguirse una pequeña mancha de nacimiento. Sofía encontró otra fotografía. Luego otra. En todas aparecía la misma niña. Pero alguien había raspado su rostro. —Alguien quería borrarla —dijo Sofía. Elena examinó los álbumes familiares. 1985. 1986. 1987. Después nada. —¿Cómo desaparece una persona de todas las historias de una familia? Mateo la miró. —Haciendo que nadie hable de ella. Tomás llegó poco después del mediodía. Elena lo esperaba. Colocó las fotografías frente a él. —Nombre. —No puedo. —Nombre. —Elena... Ella golpeó la mesa. —¡Nombre! Tomás respiró profundamente. —Clara. Mateo frunció el ceño. —¿Clara qué? —Clara Varela. Silencio. Elena sintió que el piso desaparecía. —Varela. Tomás asintió. —Era hermana de Gabriel. —Nuestra tía. —Sí. —Nunca tuvimos una tía Clara. Tomás la miró fijamente. —Exactamente. Sofía abrió su computadora. —No puedes borrar registros oficiales. Tomás respondió: —No murió. Elena sintió nuevamente aquella memoria incompleta. La habitación azul. Dos niñas. Una canción. —Entonces ¿dónde está? Tomás miró hacia arriba. —Esa es la pregunta que su abuela intentó responder durante treinta y nueve años. En ese instante Mateo recibió una notificación. La cámara que había instalado durante la noche frente a la puerta había detectado movimiento. Abrió la aplicación. 3:33 de la madrugada. La imagen mostraba el corredor vacío. Después aparecía una persona. Una mujer. Caminaba desde la habitación inexistente hacia la cámara. Pero había algo todavía más extraño. La mujer no parecía tener más de treinta años. Mateo detuvo el video. Amplió su rostro. Todos miraron a Elena. La mujer era idéntica a ella.

# 6. EL SECRETO DE GABRIEL

Gabriel llegó aquella tarde. No avisó. Entró a la casa, subió directamente las escaleras y se detuvo frente a la pared. La puerta había desaparecido. —¿La abrieron? —No —respondió Elena. Su padre cerró los ojos. Pareció aliviado. Mateo le mostró el video. Gabriel observó a la mujer. No reaccionó. Eso fue suficiente. —Sabes quién es —dijo Elena. Gabriel se sentó. Durante algunos segundos pareció haber envejecido diez años. —No sé qué es. —No pregunté qué es. Pregunté quién. Gabriel miró a sus hijos. —Clara desapareció el 17 de julio de 1987. Tenía veintiocho años. Elena hizo el cálculo. —La niña de la fotografía tiene ocho. Gabriel negó lentamente. —La niña no es Clara. Nadie habló. —Entonces ¿quién es? Gabriel miró directamente a Elena. —Tú. Elena sintió que la sangre abandonaba su rostro. —Yo nací en 1988. —Eso dice tu acta. Mateo se levantó. —¿Qué demonios significa eso? Gabriel comenzó a llorar. No dramáticamente. No hizo ruido. Simplemente aparecieron lágrimas en sus ojos. —Significa que durante treinta y meve años he vivido intentando olvidar algo que ocurrió en esta casa. Elena tomó la fotografía. La niña. El vestido amarillo. La pulsera roja. La mancha en el brazo. Elena miró su propio brazo. Tenía exactamente la misma marca. —No. Gabriel continuó. —La última noche que vi a Clara ocurrió algo aquí. Tu abuela estaba presente. También otras personas. —¿Qué ocurrió? —No lo sé completo. —Mientes. —No lo sé porque todos recordamos cosas diferentes. Sofía dejó de escribir. —¿Diferentes cómo? Gabriel miró el reloj. 3:33. —En mi recuerdo, Clara desapareció. Hizo una pausa. —En el recuerdo de tu abuela, fui yo quien desapareció. Mateo soltó una risa nerviosa. —Pero tú estás aquí. —Eso mismo le dije. Entonces Gabriel miró a Elena. —En otro recuerdo, Elena nunca nació. La casa quedó completamente silenciosa. Desde arriba llegó el sonido de una puerta abriéndose.

# 7. LA HABITACIÓN AZUL

Subieron. La puerta estaba abierta. Por primera vez. Nadie quería entrar. Elena fue la primera. La habitación era pequeña. Las paredes eran azules. En el centro había una mesa. Dos sillas. Una lámpara. Una caja de madera. Nada parecía haber envejecido. Sobre la mesa había decenas de papeles. Cada uno contenía entre 100 y 150 palabras. Elena tomó uno. Fecha: 14 de julio de 1987. Leyó: “Gabriel asegura que la puerta apareció ayer. Clara quiere entrar. Yo digo que debemos cerrarla. La niña asegura haber visto dentro una casa idéntica a esta, pero completamente vacía y sin nosotros.” Otro. 15 de julio de 1987. “Clara cruzó durante seis minutos. Cuando regresó dijo que habían pasado tres días. Trajo una fotografía donde aparecemos todos, excepto Gabriel. Él quiere destruirla. Yo quiero entender qué está ocurriendo aquí.” Otro. 16 de julio de 1987. “La niña volvió a entrar sin permiso. Dice que encontró otra versión de sí misma. Clara cree que la habitación no muestra el futuro ni el pasado, sino posibilidades. Gabriel quiere sellarla mañana.” Elena buscó desesperadamente el siguiente. 17 de julio. No estaba. —Falta uno. Gabriel permanecía en la puerta. —Ese día desapareció Clara. Mateo abrió la caja de madera. Dentro había cientos de Polaroids. Diferentes versiones de la misma familia. En algunas, Gabriel no aparecía. En otras faltaba Mateo. En otras Elena era adulta en 1987. En una fotografía, Sofía aparecía junto a ellos aunque todavía no había nacido. —Esto es imposible —susurró Sofía. Elena encontró una fotografía distinta. Mostraba la casa incendiándose. Detrás había una fecha: 24 de septiembre de 2026. Dos días después. Entonces encontraron otra. La misma fecha. La casa intacta. Otra. La casa abandonada. Otra. Una ambulancia frente a la puerta. Otra. Seis personas sonriendo en el jardín. Elena contó. Ella. Mateo. Sofía. Lucía. Gabriel. Y Clara. —Entonces puede regresar. Gabriel negó. —No sabemos eso. Elena lo miró. —Tampoco sabemos que no. Desde el interior de la caja surgió un sonido. Un teléfono. Mateo comenzó a retirar fotografías. Debajo había un celular. La pantalla se encendió. Llamada entrante. El nombre decía: ELENA VARELA. Elena levantó su propio teléfono. Lo tenía en la mano. Mateo contestó. Una voz habló al otro lado. Era Elena. —Escúchame. No tienen mucho tiempo. Interferencia. —No permitan que Sofía abra la caja metálica. Todos voltearon. Sofía ya tenía la caja entre las manos. Y acababa de descubrir la combinación.

# 8. LA CAJA DE SOFÍA

—No la abras. Sofía tenía los dedos sobre la cerradura. —¿Por qué? Elena señaló el teléfono. —Porque acabo de pedírnoslo yo misma. —Una versión tuya. —Eso no mejora la situación. Sofía observó la caja. Después retiró las manos. —Está bien. Mateo suspiró. Click. La caja se abrió sola. Todos retrocedieron. En el interior había una cinta de casete. Una llave. Una carta. Y una fotografía. Sofía tomó la carta. Estaba dirigida a ella. “Sofía: si estás leyendo esto, significa que Elena regresó.” Sofía continuó. Su expresión cambió. —¿Qué dice? No respondió. Elena tomó la carta. Solo había dos párrafos. El primero decía: “Necesito que recuerdes algo que decidiste olvidar.” El segundo: “Tú ya estuviste dentro de la habitación.” Sofía negó. —Nunca había entrado a esta casa antes de conocer a Elena. Gabriel levantó lentamente la cabeza. —Sí entraste. —Eso es imposible. —Tenías seis años. Sofía lo miró. —Yo conocí a Elena cuando tenía once. Gabriel señaló la fotografía. En ella aparecían dos niñas. Elena. Y Sofía. Fecha: 1987. Sofía dejó caer la imagen. —Yo nací en 1989. —En esta versión —respondió Gabriel. Nadie supo qué decir. Lucía apareció entonces en la puerta de la habitación. Elena se sobresaltó. —Te dije que esperaras afuera. Lucía no respondió. Miraba la caja. Específicamente la llave. —¿Dónde encontraron eso? Sofía la sostuvo. —Dentro. Lucía comenzó a llorar. —Esa llave es mía. Elena se acercó. —¿Tuya? Lucía sacó algo de debajo de su blusa. Un collar. Colgaba de él una pequeña pieza metálica. Era la mitad de una llave. Sofía acercó la encontrada en la caja. Ambas piezas encajaban. Gabriel retrocedió. Su rostro se volvió pálido. —¿Cómo te llamas? —Lucía Saldaña. —Tu nombre completo. Lucía dudó. —Lucía Clara Saldaña. Gabriel dejó de respirar durante un instante. —¿Cómo se llamaba tu madre? Lucía respondió: —Clara. Silencio. Gabriel dejó de respirar durante un instante. —¿Clara qué? —Clara Varela.

# 9. LAS VERSIONES

Lucía había crecido creyendo que su madre no tenía familia. Clara jamás hablaba de Monterrey. Jamás mencionaba aquella casa. Había muerto ocho años atrás. O eso creía Lucía. —¿Por qué viniste a vivir enfrente? —preguntó Elena. Lucía miró la habitación. —Porque recibí una carta. —¿De quién? —De mi madre. —Dijiste que murió hace ocho años. —La carta llegó hace dos. Sofía dejó de escribir. —¿Qué decía? Lucía respiró profundamente. —“Alquila la casa frente al número 143. Espera hasta que Elena regrese. No intentes entrar antes.”— Elena sintió un escalofrío. —¿Por qué nunca dijiste nada? —Porque pensé que Elena era otra persona. Mateo caminó por la habitación observando las fotografías. —Entonces tenemos versiones diferentes de todos. Señaló las imágenes. —En unas Clara desaparece. En otras regresa. Elena nace antes de su propia fecha de nacimiento. Sofía aparece antes de nacer. Lucía recibe cartas de una mujer muerta. Elena completó: —Y dentro de dos días esta casa puede incendiarse. Gabriel tomó asiento. —No son predicciones. —¿Cómo lo sabes? —Porque en 1987 entendimos algo. Todos lo miraron. —Cada decisión genera posibilidades. Normalmente nunca podemos verlas. Esta habitación sí. Elena negó. —Eso sigue sin explicar nada. —No solo las muestra. Gabriel señaló la puerta. —Permite intercambiarlas. Silencio. Elena comenzó a entender. —Clara no desapareció. Gabriel cerró los ojos. —No. —Cambió de posibilidad. —Eso creemos. —¿Y la niña? Gabriel miró a Elena. —También. Mateo se quedó inmóvil. —Entonces Elena... —La Elena que salió de aquella habitación probablemente no pertenecía a nuestra realidad. Nadie habló durante varios segundos. Elena sintió vértigo. Todos sus recuerdos. Su infancia. Su carrera. Sus relaciones. Todo lo que consideraba suyo. Quizá había comenzado en otro lugar. —¿Qué pasó con la Elena original? Gabriel señaló la puerta. —Nunca lo supimos. El teléfono escondido volvió a sonar. Otra vez: ELENA VARELA. Elena contestó. —¿Quién eres? Su propia voz respondió: —Tú. —¿Dónde estás? —Del otro lado. —¿Desde cuándo? Silencio. Después: —Desde 1987. Elena sintió que las piernas le fallaban. La voz continuó. —Y necesito que me devuelvas mi vida.

# 10. EL PRIMER CAMBIO

Nadie durmió. A las 3:20 estaban nuevamente dentro de la habitación. El reloj había aparecido sobre la mesa. 3:20. Avanzaba. Por primera vez. Elena observaba la puerta. Si aquella mujer decía la verdad, su existencia completa era consecuencia de un intercambio ocurrido cuando era niña. Mateo permanecía junto a ella. —No tienes que hacer nada. —¿Y si ella lleva treinta y nueve años esperando? —Tú no elegiste esto. —Ella tampoco. Sofía sostenía la llave. Lucía tenía la otra mitad. Gabriel observaba las fotografías. Tomás, que había permanecido extrañamente silencioso, finalmente habló. —Hay algo que todos están ignorando. Elena lo miró. —¿Qué? —El testamento. Sacó el documento. —La condición no dice simplemente que permanezcan siete días en la casa. Leyó. “Durante siete noches deberán registrar entre 100 y 150 palabras. Cada registro modificará aquello que la habitación considere posible.” Mateo levantó la vista. —¿Modificar? Tomás asintió. —Las palabras no describen únicamente lo ocurrido. Señaló la ranura. —También pueden influir en lo siguiente. Sofía comprendió primero. —Entonces lo que escribamos esta noche importa. 3:27. Elena tomó una hoja. —¿Qué podemos escribir? Gabriel respondió: —Cualquier cosa. —¿Podemos pedir que Clara regrese? —Tal vez. —¿Que la otra Elena salga? —Tal vez. —¿Evitar el incendio? —Tal me. Mateo añadió: —O provocarlo. 3:29. Los seis comenzaron a discutir. Lucía quería recuperar a su madre. Gabriel quería cerrar la habitación para siempre. Mateo quería proteger a Elena. Sofía quería descubrir qué había sucedido realmente en 1987. Tomás insistía en cumplir exactamente las instrucciones del testamento. Elena quería algo diferente. Quería conocer a la persona que había esperado treinta y nueve años al otro lado. 3:31. —Tenemos que decidir. 3:32. La puerta comenzó a vibrar. Desde el otro lado llegaron golpes. Uno. Dos. Tres. Después una voz. La voz de Elena. —¡No escriban todavía! Mateo miró el reloj. Quedaban segundos. Una hoja apareció debajo de la puerta. Elena la tomó. Solo había una frase: “Hay siete personas en esta habitación, aunque ustedes solamente pueden ver seis.” Todos se quedaron inmóviles. 3:33. Entonces una séptima voz habló detrás de ellos. —Por fin. Elena giró lentamente. Alguien estaba sentado en la silla que segundos antes se encontraba vacía. Era una mujer anciana. Elena la reconoció inmediatamente. Su abuela. Pero su abuela llevaba seis meses muerta. La mujer sonrió. —Ahora sí podemos empezar.

### Punto de partida para Efecto Mariposa Project

¿Quién es realmente Elena?
¿Qué ocurrió el 17 de julio de 1987?
¿Dónde estuvo Clara?
¿Por qué existen diferentes versiones de los personajes?
¿Cómo puede estar viva la abuela?
¿Qué sabe realmente Tomás?
¿Qué ocurre cuando se introducen entre 100 y 150 palabras debajo de la puerta?
¿Las palabras modifican el futuro, el pasado o la realidad completa?
¿Quién provocará el incendio que aparece en una de las fotografías?
¿Puede recuperarse una realidad descartada?
¿Existen consecuencias por intercambiar personas entre posibilidades?
¿Hay más habitaciones como esta?
¿Quién creó la habitación?

¿Qué 100 a 150 palabras escribirán ahora?`;

interface IDEDiffLine {
  type: 'same' | 'added' | 'removed';
  origLineNum?: number;
  editLineNum?: number;
  content: string;
}

interface IDEDiffResult {
  lines: IDEDiffLine[];
  addedCount: number;
  removedCount: number;
}

function computeIDEDiff(original: string, edited: string): IDEDiffResult {
  if (!original && !edited) return { lines: [], addedCount: 0, removedCount: 0 };

  const splitToLines = (str: string) => {
    if (!str || !str.trim()) return [];
    const rawParagraphs = str.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const resultLines: string[] = [];
    rawParagraphs.forEach((p) => {
      const sentences = p.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g);
      if (sentences && sentences.length > 1) {
        sentences.forEach((s) => {
          if (s.trim()) resultLines.push(s.trim());
        });
      } else {
        resultLines.push(p);
      }
    });
    return resultLines;
  };

  const origLines = splitToLines(original);
  const editLines = splitToLines(edited);

  const lines: IDEDiffLine[] = [];
  let origCounter = 1;
  let editCounter = 1;
  let addedCount = 0;
  let removedCount = 0;

  let i = 0;
  let j = 0;

  while (i < origLines.length || j < editLines.length) {
    if (i < origLines.length && j < editLines.length && origLines[i] === editLines[j]) {
      lines.push({
        type: 'same',
        origLineNum: origCounter++,
        editLineNum: editCounter++,
        content: origLines[i],
      });
      i++;
      j++;
    } else {
      let origNextInEdit = -1;
      for (let k = j; k < Math.min(j + 8, editLines.length); k++) {
        if (origLines[i] === editLines[k]) {
          origNextInEdit = k;
          break;
        }
      }

      let editNextInOrig = -1;
      for (let k = i; k < Math.min(i + 8, origLines.length); k++) {
        if (editLines[j] === origLines[k]) {
          editNextInOrig = k;
          break;
        }
      }

      if (origNextInEdit !== -1) {
        while (j < origNextInEdit) {
          const words = editLines[j].split(/\s+/).filter(Boolean).length;
          addedCount += words;
          lines.push({
            type: 'added',
            editLineNum: editCounter++,
            content: editLines[j],
          });
          j++;
        }
      } else if (editNextInOrig !== -1) {
        while (i < editNextInOrig) {
          const words = origLines[i].split(/\s+/).filter(Boolean).length;
          removedCount += words;
          lines.push({
            type: 'removed',
            origLineNum: origCounter++,
            content: origLines[i],
          });
          i++;
        }
      } else {
        if (i < origLines.length) {
          const words = origLines[i].split(/\s+/).filter(Boolean).length;
          removedCount += words;
          lines.push({
            type: 'removed',
            origLineNum: origCounter++,
            content: origLines[i],
          });
          i++;
        }
        if (j < editLines.length) {
          const words = editLines[j].split(/\s+/).filter(Boolean).length;
          addedCount += words;
          lines.push({
            type: 'added',
            editLineNum: editCounter++,
            content: editLines[j],
          });
          j++;
        }
      }
    }
  }

  return { lines, addedCount, removedCount };
}

function IDEDiffViewer({
  fileName,
  originalText,
  editedText,
  compact = false,
}: {
  fileName: string;
  originalText: string;
  editedText: string;
  compact?: boolean;
}) {
  const diffResult = computeIDEDiff(originalText, editedText);

  return (
    <div className="rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-[#1e1e1e] font-mono text-xs">
      {/* VS Code Diff Title Header */}
      <div className="bg-[#252526] px-4 py-2.5 flex items-center justify-between border-b border-[#333333] select-none">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-slate-200 text-xs font-mono">{fileName}</span>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
            git diff (original ↔ editado)
          </span>
        </div>
        <div className="flex items-center gap-2.5 font-mono font-bold text-xs">
          <span className="text-emerald-400 bg-emerald-950/90 px-2.5 py-0.5 rounded border border-emerald-700/80 shadow-xs">
            +{diffResult.addedCount}
          </span>
          <span className="text-red-400 bg-red-950/90 px-2.5 py-0.5 rounded border border-red-700/80 shadow-xs">
            -{diffResult.removedCount}
          </span>
        </div>
      </div>

      {/* VS Code Code Area */}
      <div className={`bg-[#181818] ${compact ? 'max-h-64' : 'max-h-96'} overflow-y-auto font-mono text-xs divide-y divide-slate-900/30`}>
        {diffResult.lines.length === 0 ? (
          <div className="p-6 text-slate-500 italic text-center font-mono">
            No se detectaron diferencias entre el texto original y la versión adaptada.
          </div>
        ) : (
          diffResult.lines.map((line, idx) => {
            const isRemoved = line.type === 'removed';
            const isAdded = line.type === 'added';

            return (
              <div
                key={idx}
                className={`flex items-start font-mono text-[12px] leading-relaxed transition-colors ${
                  isRemoved
                    ? 'bg-[#3c1718] text-red-200 border-l-4 border-red-500 hover:bg-[#4a1d1e]'
                    : isAdded
                    ? 'bg-[#0f2d1e] text-emerald-200 border-l-4 border-emerald-500 hover:bg-[#133824]'
                    : 'bg-[#181818] text-slate-300 border-l-4 border-transparent hover:bg-[#202020]'
                }`}
              >
                {/* Line Numbers Gutter */}
                <div className="w-14 flex-shrink-0 flex items-center justify-between px-2 py-1 text-slate-500 text-[10px] select-none border-r border-[#2d2d2d] bg-[#1e1e1e]/80">
                  <span className="w-5 text-right font-mono">{line.origLineNum ?? ''}</span>
                  <span className="w-5 text-right font-mono">{line.editLineNum ?? ''}</span>
                </div>

                {/* Diff Prefix (+ / -) */}
                <div className="w-6 flex-shrink-0 text-center py-1 font-bold select-none text-[12px]">
                  {isRemoved && <span className="text-red-400 font-extrabold">-</span>}
                  {isAdded && <span className="text-emerald-400 font-extrabold">+</span>}
                  {!isRemoved && !isAdded && <span className="text-slate-600">&nbsp;</span>}
                </div>

                {/* Text Line with Word-Level Highlighting */}
                <div className="flex-1 py-1 pr-3 font-serif text-xs break-words whitespace-pre-wrap leading-relaxed">
                  {renderDiffContentWithWordHighlights(line, diffResult.lines, idx)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function renderDiffContentWithWordHighlights(line: IDEDiffLine, allLines: IDEDiffLine[], idx: number) {
  if (line.type === 'same') return line.content;

  let compareLine: IDEDiffLine | undefined = undefined;
  if (line.type === 'removed' && allLines[idx + 1] && allLines[idx + 1].type === 'added') {
    compareLine = allLines[idx + 1];
  } else if (line.type === 'added' && allLines[idx - 1] && allLines[idx - 1].type === 'removed') {
    compareLine = allLines[idx - 1];
  }

  if (!compareLine) return line.content;

  const compareWords = new Set(
    compareLine.content
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.replace(/[^a-záéíóúñ0-9]/gi, ''))
      .filter(Boolean)
  );

  const tokens = line.content.split(/(\s+)/);

  return tokens.map((token, tIdx) => {
    const clean = token.toLowerCase().replace(/[^a-záéíóúñ0-9]/gi, '');
    if (!clean || compareWords.has(clean)) {
      return token;
    }

    if (line.type === 'removed') {
      return (
        <mark key={tIdx} className="bg-red-900/90 text-red-100 font-bold px-1 rounded mx-0.5 no-underline shadow-2xs border border-red-700/80">
          {token}
        </mark>
      );
    } else {
      return (
        <mark key={tIdx} className="bg-emerald-800/90 text-emerald-100 font-bold px-1 rounded mx-0.5 no-underline shadow-2xs border border-emerald-700/80">
          {token}
        </mark>
      );
    }
  });
}

function getBaseDayText(dayNumber: number): string {
  switch (dayNumber) {
    case 1:
      return `# 1. LA CASA\n\nLa llave tardó tres intentos en entrar. Elena pensó que probablemente la cerradura se había oxidado, aunque la explicación no consiguió evitarle aquella sensación absurda de que la casa estaba resistiéndose. Empujó. La puerta se abrió con un gemido largo. El olor fue lo primero. Madera. Polvo. Canela. Y algo más. Elena cerró los ojos. Durante unos segundos volvió a tener doce años. Su abuela estaba en la cocina preparando café. Mateo corría por el pasillo. Su padre discutía por teléfono en el estudio. Y en algún lugar de la casa sonaba un reloj. Tac. Tac. Tac. Abrió los ojos. El reloj seguía sonando. Eso era imposible. Caminó hacia la sala. Sobre una pequeña mesa encontró el antiguo reloj de péndulo de su abuela. Funcionaba. Elena observó las manecillas. 3:33. Sacó su teléfono. 6:47 de la tarde. Golpeó ligeramente el cristal. Las agujas permanecieron inmóviles. Pero el péndulo continuó moviéndose. Tac. Tac. Tac. —Muy teatral, abuela. La voz de Mateo apareció detrás de ella. Elena volteó. Su hermano entró cargando dos cajas vacías. —¿No podías esperar cinco minutos? —Llegaste veinte minutos tarde. —Entonces fueron quince minutos de espera perfectamente desperdiciados. Mateo dejó las cajas en el piso. Miró alrededor. Su sonrisa desapareció lentamente. —No recordaba que fuera tan grande. —Tú nunca recuerdas nada. —Recuerdo algunas cosas. Elena percibió el cambio en su voz. —¿Como qué? Mateo miró hacia la escalera. —Como que había una puerta arriba. Elena frunció el ceño. —Hay cinco. —Seis. —Cinco. —Había seis. Elena sacó de su carpeta el plano original de la propiedad. Lo había revisado decenas de veces antes de aceptar venderla. Planta baja. Sala. Comedor. Cocina. Estudio. Segundo nivel. Tres habitaciones. Dos baños. Bodega. Cinco puertas. Mateo caminó hasta el corredor. —Cinco. Mateo tomó el plano. —Entonces quitaron una. —Las puertas no desaparecen, Mateo. Él levantó la vista. —Precisamente por eso lo digo. Elena no respondió. Subieron. El corredor estaba exactamente como ella lo recordaba. La habitación de su abuela. La habitación de invitados. El antiguo cuarto de los niños. El baño. La bodega. Cinco puertas. Mateo caminó hasta el final. Tocó la pared. —Era aquí. —Ahí nunca hubo nada. —Sí había. Elena golpeó el muro con los nudillos. Sólido. Mateo hizo lo mismo. Tres golpes. Los dos escucharon el sonido hueco. Ninguno dijo nada.`;
    case 2:
      return `# 2. LA FOTOGRAFÍA\n\nElena pidió a Mateo que no hiciera nada hasta revisar los planos estructurales. Mateo esperó exactamente siete minutos. Después buscó un martillo. —Ni se te ocurra. —Solo quiero comprobar el espesor. —Eres fotógrafo. —He visto muchos videos de remodelaciones. —Eso me tranquiliza muchísimo. Mateo estaba a punto de golpear cuando sonó el timbre. Abajo esperaba una mujer. Cabello oscuro. Vestido blanco. Una bolsa de supermercado entre las manos. —Soy Lucía. Vivo enfrente. Elena se presentó. Lucía miró hacia el interior de la casa. —Entonces ustedes son los nietos. —¿Conoció a nuestra abuela? —Muy poco. Hizo una pausa. —Pero la veía mucho. Mateo apareció detrás de Elena. —Murió hace seis meses. —Lo sé. Lucía sostuvo la mirada. —Por eso me pareció extraño verla después. Silencio. Elena sonrió incómoda. —¿Perdón? —Tal vez era otra persona... —¿Dónde la vio? Lucía señaló hacia arriba. —En la ventana. Mateo salió al jardín delantero y contempló la fachada. Elena lo siguió de cerca. En el segundo nivel se distinguían con total claridad dos ventanas: la de la izquierda y la de la derecha. Mateo frunció el ceño, sacó de su bolsillo la Polaroid original de 1987 y comparó la imagen con la estructura real. —Elena... observa esto —murmuró con voz apagada. Elena se aproximó. La Polaroid de 1987 capturaba la misma fachada, pero solo mostraba una ventana en la planta alta. La ventana de la derecha simplemente no existía en la fotografía original.`;
    default:
      return '';
  }
}

function generateInitialDays(): NovelDay[] {
  const days: NovelDay[] = [];
  const dayNames: ('Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes')[] = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'
  ];

  let dayCounter = 1;
  for (let month = 1; month <= 4; month++) {
    for (let week = 1; week <= 4; week++) {
      const weekNum = (month - 1) * 4 + week;
      for (let d = 0; d < 5; d++) {
        const dayName = dayNames[d];
        days.push({
          dayNumber: dayCounter,
          weekNumber: weekNum,
          monthNumber: month,
          dayOfWeek: dayName,
          narrativeLine: 'Línea narrativa oficial para el Día ' + dayCounter + ' (' + dayName + ', Semana ' + weekNum + ').',
          openingText: 'Línea narrativa oficial para el Día ' + dayCounter + ' (' + dayName + ', Semana ' + weekNum + ').',
        });
        dayCounter++;
      }
    }
  }
  return days;
}

export default function StoryBiblePage() {
  const [activeTab, setActiveTab] = useState<'raw_input' | 'skeleton' | 'characters' | 'mysteries'>('raw_input');
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | 'ALL'>('ALL');
  const [cardViewModes, setCardViewModes] = useState<Record<number, 'editor' | 'diff'>>({});

  // Slide-Over Proposal Drawer State
  const [aiProposal, setAiProposal] = useState<AIProposalState | null>(null);
  const [isGeneratingProposalDay, setIsGeneratingProposalDay] = useState<number | null>(null);
  const [aiEditedDays, setAiEditedDays] = useState<Record<number, boolean>>({});

  // Version History State
  const [dayHistory, setDayHistory] = useState<Record<number, DayVersion[]>>({});
  const [historyModalDay, setHistoryModalDay] = useState<number | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('emp_story_bible_versions_v1');
      if (saved) {
        setDayHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Error al cargar historial de versiones:', e);
    }
  }, []);

  const handleSaveDayVersion = (dayNumber: number, text: string, isAi: boolean): number => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ' • ' + now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    let newVersionNum = 1;

    setDayHistory((prev) => {
      const existing = prev[dayNumber] || [];
      newVersionNum = existing.length + 1;
      const newVersion: DayVersion = {
        id: `v-${dayNumber}-${Date.now()}`,
        versionNumber: newVersionNum,
        savedAt: dateStr,
        text,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        isAiEdited: isAi,
      };
      const updated = {
        ...prev,
        [dayNumber]: [newVersion, ...existing],
      };
      try {
        localStorage.setItem('emp_story_bible_versions_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error al guardar historial de versiones:', e);
      }
      return updated;
    });

    return newVersionNum;
  };

  // Modular Inputs State
  const [inputTitle, setInputTitle] = useState<string>('');
  const [inputSubtitle, setInputSubtitle] = useState<string>('');
  const [inputCharacters, setInputCharacters] = useState<string>('');
  const [inputNarrative, setInputNarrative] = useState<string>('');
  const [inputMysteries, setInputMysteries] = useState<string>('');

  const [rawStoryText, setRawStoryText] = useState<string>('');
  const [isProcessingRaw, setIsProcessingRaw] = useState(false);

  const [characters, setCharacters] = useState<any[]>([]);
  const [mysteries, setMysteries] = useState<any[]>([]);
  const [seeds, setSeeds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Custom UI Modal State (Replacing browser window.alert and window.confirm)
  const [uiModal, setUiModal] = useState<UIModalState>({
    isOpen: false,
    type: 'SUCCESS',
    title: '',
    message: '',
  });

  const showModal = (
    type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'CONFIRM',
    title: string,
    message: string,
    details?: UIModalState['details'],
    onConfirm?: () => void
  ) => {
    setUiModal({
      isOpen: true,
      type,
      title,
      message,
      details,
      onConfirm,
    });
  };

  const closeModal = () => {
    setUiModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Gating rule check: Does DB or state contain story data?
  const hasLoadedStory = (inputNarrative.trim().length > 50 || rawStoryText.trim().length > 50) || (characters.length > 0 && mysteries.length > 0);

  // Generate 80 Days (4 Months x 4 Weeks/Month x 5 Days/Week: Mon-Fri)
  const [novelDays, setNovelDays] = useState<NovelDay[]>(generateInitialDays);

  // Modal State for editing a day's line
  const [editingDayNumber, setEditingDayNumber] = useState<number | null>(null);
  const [editLineText, setEditLineText] = useState('');

  // Modal state for creating character
  const [newCharName, setNewCharName] = useState('');
  const [newCharDesc, setNewCharDesc] = useState('');
  const [showNewCharModal, setShowNewCharModal] = useState(false);

  const { fetchWithCache, invalidate } = useEmpCache();

  const fetchBibleData = async (forceRefresh = false) => {
    try {
      const data = await fetchWithCache('/api/story-bible', undefined, { forceRefresh });
      if (data.success) {
        setCharacters(data.characters || []);
        setMysteries(data.mysteries || []);
        setSeeds(data.seeds || []);

        let dbHasStoryData = false;

        if (Array.isArray(data.days) && data.days.length > 0) {
          const loadedDaysCount = data.days.filter((d: any) => d.narrativeLine || d.openingText).length;
          if (loadedDaysCount > 0) {
            dbHasStoryData = true;
          }

          setNovelDays((prev) => {
            const next = [...prev];
            data.days.forEach((dbDay: any) => {
              const idx = next.findIndex((d) => d.dayNumber === dbDay.dayNumber);
              if (idx !== -1) {
                if (dbDay.openingText) next[idx].openingText = dbDay.openingText;
                if (dbDay.narrativeLine) next[idx].narrativeLine = dbDay.narrativeLine;
                if (dbDay.openingText && dbDay.narrativeLine && dbDay.openingText !== dbDay.narrativeLine) {
                  setAiEditedDays((prev) => ({ ...prev, [dbDay.dayNumber]: true }));
                }
              }
            });
            return next;
          });
        }

        if ((data.characters && data.characters.length > 0) || dbHasStoryData) {
          setActiveTab('skeleton');
        }

        if (data.project && data.project.description) {
          setRawStoryText((prev) => prev || data.project.description || '');
        }
      }
    } catch (err) {
      console.warn('Error al cargar Story Bible:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBibleData();
  }, []);

  const handleProcessRawText = async () => {
    const textToProcess = inputNarrative || rawStoryText;
    if (!textToProcess.trim()) {
      showModal(
        'WARNING',
        'Cuerpo Narrativo Vacío',
        'Por favor ingresa o carga la prosa/capítulos narrativos de tu novela en el recuadro correspondiente antes de procesar.'
      );
      return;
    }

    setIsProcessingRaw(true);
    try {
      const res = await fetch('/api/story-bible/parse-raw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          novelTitle: inputTitle,
          subtitle: inputSubtitle,
          charactersText: inputCharacters,
          narrativeText: inputNarrative,
          mysteriesText: inputMysteries,
          rawText: rawStoryText,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al procesar la historia');
      }

      invalidate('/api/story-bible');
      await fetchBibleData(true);

      showModal(
        'SUCCESS',
        '¡Manuscrito Modular Procesado e Integrado!',
        'El cuerpo narrativo se asignó limpiamente al Esqueleto de 80 Días sin incluir títulos ni fichas de personajes. La Biblia de Novela fue actualizada.',
        {
          novelTitle: data.extracted.title,
          charactersCount: data.extracted.charactersCount,
          chaptersCount: data.extracted.chaptersCount,
          mysteriesCount: data.extracted.mysteriesCount,
        },
        () => {
          setActiveTab('skeleton');
        }
      );
    } catch (err: any) {
      showModal('ERROR', 'Error al Procesar', err.message || 'Ocurrió un error inesperado al parsear la historia.');
    } finally {
      setIsProcessingRaw(false);
    }
  };


  const handleLoadDemoText = () => {
    setInputTitle('LA HABITACIÓN QUE NO EXISTÍA');
    setInputSubtitle('Novela ficticia experimental • Demo para Efecto Mariposa Project');

    const charPart = `**ELENA VARELA, 38 años**
Arquitecta. Metódica, escéptica y obsesionada con encontrar explicaciones racionales para todo. Regresa a Monterrey después de diecisiete años para vender la antigua casa de su abuela.

**MATEO VARELA, 34 años**
Hermano menor de Elena. Fotógrafo. Impulsivo, irónico y mucho más sentimental de lo que admite. Fue el último miembro de la familia que vio con vida a su abuela.

**SOFÍA ALCÁZAR, 37 años**
Amiga de infancia de Elena. Periodista. Curiosa hasta niveles peligrosos. Conserva una caja que la abuela de Elena le entregó años atrás con instrucciones precisas de no abrirla.

**TOMÁS LERMA, 42 años**
Notario encargado de la sucesión. Elegante, reservado y aparentemente ajeno a los asuntos familiares. Sin embargo, conoce detalles de la casa que nadie recuerda haberle contado.

**LUCÍA SALDAÑA, 29 años**
Vecina de la casa. Vive enfrente desde hace apenas dos años. Afirma haber visto en varias ocasiones a una mujer encendiendo la luz de una habitación del segundo piso, incluso después de la muerte de la abuela.

**GABRIEL VARELA, 67 años**
Padre de Elena y Mateo. Vive en otra ciudad y se niega a regresar a la casa. Cuando Elena menciona una habitación al final del pasillo, Gabriel le pide que abandone inmediatamente el lugar.`;
    setInputCharacters(charPart);

    const chaptersMatch = DEMO_NOVEL_RAW_TEXT.match(/(# 1\. LA CASA[\s\S]*?)(?=### Punto de partida|\n¿Quién|$)/);
    if (chaptersMatch) {
      setInputNarrative(chaptersMatch[1].trim());
    } else {
      setInputNarrative(DEMO_NOVEL_RAW_TEXT);
    }

    const mystMatch = DEMO_NOVEL_RAW_TEXT.match(/(¿Quién es realmente Elena[\s\S]*)/);
    if (mystMatch) {
      setInputMysteries(mystMatch[1].trim());
    }

    setRawStoryText(DEMO_NOVEL_RAW_TEXT);
  };

  const handleClearRawText = () => {
    showModal(
      'CONFIRM',
      '¿Limpiar Todos los Inputs?',
      'Esta acción vaciará todas las secciones de carga (Título, Personajes, Cuerpo Narrativo y Misterios). Si no hay datos guardados previamente, el Esqueleto de 80 Días volverá a bloquearse.',
      undefined,
      () => {
        setInputTitle('');
        setInputSubtitle('');
        setInputCharacters('');
        setInputNarrative('');
        setInputMysteries('');
        setRawStoryText('');
      }
    );
  };

  const handleTabClick = (tab: 'raw_input' | 'skeleton' | 'characters' | 'mysteries') => {
    if (tab === 'skeleton' && !hasLoadedStory) {
      showModal(
        'WARNING',
        '🔒 Esqueleto 80 Días Bloqueado',
        'Para habilitar esta sección debes ingresar o procesar primero el texto base de tu novela en la pestaña "📄 Cargar Historia Completa (Input Base)".'
      );
      setActiveTab('raw_input');
      return;
    }
    setActiveTab(tab);
  };

  const handleOpenEditDay = (dayNum: number) => {
    const target = novelDays.find((d) => d.dayNumber === dayNum);
    if (target) {
      setEditingDayNumber(dayNum);
      setEditLineText(target.narrativeLine);
    }
  };

  const handleSaveDayLine = async () => {
    if (editingDayNumber === null) return;
    const updated = [...novelDays];
    const idx = updated.findIndex((d) => d.dayNumber === editingDayNumber);
    if (idx !== -1) {
      updated[idx].narrativeLine = editLineText;
      setNovelDays(updated);

      try {
        await fetch('/api/story-bible', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'skeleton_week',
            day: editingDayNumber,
            weekNumber: updated[idx].weekNumber,
            openingText: editLineText,
          }),
        });
        invalidate('/api/story-bible');
        showModal('SUCCESS', 'Línea Guardada', `La línea narrativa del Día ${editingDayNumber} se actualizó correctamente.`);
      } catch (err: any) {
        showModal('ERROR', 'Error al Guardar', err.message || 'No se pudo guardar la línea narrativa del día.');
      }
    }
    setEditingDayNumber(null);
  };

  const handleAddCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharName) return;
    try {
      const res = await fetch('/api/story-bible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'character',
          name: newCharName,
          description: newCharDesc,
          status: 'ALIVE',
          day: 1,
          location: 'Por definir',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewCharName('');
        setNewCharDesc('');
        setShowNewCharModal(false);
        invalidate('/api/story-bible');
        await fetchBibleData(true);
        showModal('SUCCESS', 'Personaje Registrado', `El personaje "${newCharName}" se añadió a la Biblia de Novela.`);
      }
    } catch (err: any) {
      showModal('ERROR', 'Error al Registrar', err.message || 'No se pudo registrar el personaje.');
    }
  };

  const filteredDays = novelDays.filter((d) => {
    if (d.monthNumber !== selectedMonth) return false;
    if (selectedWeekFilter !== 'ALL' && d.weekNumber !== selectedWeekFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* CUSTOM STYLED REACT UI MODAL (NO MORE NATIVE BROWSER ALERTS / CONFIRMS) */}
      {uiModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
          <div className="glass-panel p-7 rounded-3xl border border-blue-200 bg-white/95 shadow-2xl max-w-lg w-full space-y-5 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className={`p-3.5 rounded-2xl shrink-0 ${
                uiModal.type === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                uiModal.type === 'WARNING' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                uiModal.type === 'CONFIRM' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                'bg-red-100 text-red-700 border border-red-300'
              }`}>
                {uiModal.type === 'SUCCESS' && <CheckCircle2 className="w-7 h-7" />}
                {uiModal.type === 'WARNING' && <Lock className="w-7 h-7" />}
                {uiModal.type === 'CONFIRM' && <AlertTriangle className="w-7 h-7" />}
                {uiModal.type === 'ERROR' && <AlertTriangle className="w-7 h-7" />}
              </div>

              <div className="space-y-2 flex-1 pt-1">
                <h3 className="text-xl font-serif font-bold text-slate-900 leading-snug">
                  {uiModal.title}
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {uiModal.message}
                </p>
              </div>
            </div>

            {/* Structured Details Card if available */}
            {uiModal.details && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs font-mono text-slate-700">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">TÍTULO DE NOVELA:</span>
                  <span className="font-bold text-blue-900">{uiModal.details.novelTitle}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="block text-[10px] text-slate-500 font-bold">PERSONAJES</span>
                    <span className="text-sm font-extrabold text-blue-600">{uiModal.details.charactersCount}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="block text-[10px] text-slate-500 font-bold">JORNADAS</span>
                    <span className="text-sm font-extrabold text-blue-600">{uiModal.details.chaptersCount}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="block text-[10px] text-slate-500 font-bold">MISTERIOS</span>
                    <span className="text-sm font-extrabold text-blue-600">{uiModal.details.mysteriesCount}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
              {uiModal.type === 'CONFIRM' ? (
                <>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (uiModal.onConfirm) uiModal.onConfirm();
                      closeModal();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs text-white font-bold shadow-md transition-all"
                  >
                    Sí, Confirmar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (uiModal.onConfirm) uiModal.onConfirm();
                    closeModal();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs text-white font-bold shadow-md transition-all"
                >
                  Continuar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Novel Master Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-blue-800 space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-300 text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>LABORATORIO NARRATIVO • EFECTO MARIPOSA PROJECT</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-serif font-extrabold text-white tracking-tight">
              Configuración & Esqueleto de Novela
            </h1>
            <p className="text-xs text-blue-100/90 font-medium max-w-3xl mt-1 leading-relaxed">
              Copia y pega la historia base completa en el Input. Al procesarla, el sistema extraerá los personajes, preguntas abiertas y nutrirá la estructura de 80 jornadas (Lunes a Viernes).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowNewCharModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all border border-blue-500"
            >
              <Plus className="w-4 h-4" /> Registrar Personaje
            </button>
          </div>
        </div>
      </div>

      {/* Main Category Tabs Switcher (4 Tabs with Gating Check on Skeleton) */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          onClick={() => handleTabClick('raw_input')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'raw_input'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <FileText className="w-4 h-4" /> Cargar Historia Completa (Input Base)
          {hasLoadedStory ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        <button
          onClick={() => handleTabClick('skeleton')}
          className={`flex-1 min-w-[220px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all relative ${
            !hasLoadedStory
              ? 'bg-slate-200/70 text-slate-400 cursor-not-allowed border border-slate-300'
              : activeTab === 'skeleton'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          {!hasLoadedStory ? (
            <>
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Esqueleto 80 Días (Bloqueado)</span>
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              <span>Esqueleto 80 Días (Lunes a Viernes)</span>
            </>
          )}
        </button>

        <button
          onClick={() => handleTabClick('characters')}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'characters'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <Users className="w-4 h-4" /> Personajes ({characters.length})
        </button>

        <button
          onClick={() => handleTabClick('mysteries')}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'mysteries'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Misterios ({mysteries.length})
        </button>
      </div>

      {/* SECTION 1: RAW INPUT (CARGA MODULAR MULTI-SECCIÓN) */}
      {activeTab === 'raw_input' && (
        <div className="space-y-6">
          <div className="bg-blue-50/90 p-5 rounded-2xl border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm font-serif">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Carga Modular del Manuscrito Base (Datos de la Novela)</span>
              </div>
              <span
                className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border ${
                  hasLoadedStory
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                {hasLoadedStory ? '✓ Historia Base Cargada en Sistema' : '⚠️ Sin Historia Base (Esqueleto Bloqueado)'}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Ingresa los datos de tu novela en sus <strong>secciones independientes</strong> (Título, Personajes, Cuerpo Narrativo y Misterios). De esta forma, los títulos e información de personajes no se mezclarán con el texto narrativo al alimentar el <strong>Esqueleto de 80 Días (Lunes a Viernes)</strong>.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadDemoText}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-2xs transition-all border border-amber-400"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>⚡ Cargar Texto Ejemplo ("La Habitación que no Existía")</span>
                </button>

                {(inputNarrative || inputCharacters || inputTitle || rawStoryText) && (
                  <button
                    type="button"
                    onClick={handleClearRawText}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl border border-slate-300 hover:border-red-300 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpiar Todo</span>
                  </button>
                )}
              </div>

              <div className="text-xs font-mono text-slate-500 font-bold">
                Palabras Narrativas: {inputNarrative ? inputNarrative.split(/\s+/).filter(Boolean).length : 0}
              </div>
            </div>
          </div>

          {/* Modular Inputs Grid */}
          <div className="space-y-6">

            {/* SECCIÓN 1: TÍTULO Y SUBTÍTULO DE LA NOVELA */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>1. Título & Datos Generales de la Novela</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono font-bold text-slate-600 uppercase block mb-1">
                    Título Principal de la Novela:
                  </label>
                  <input
                    type="text"
                    value={inputTitle}
                    onChange={(e) => setInputTitle(e.target.value)}
                    placeholder="ej: LA HABITACIÓN QUE NO EXISTÍA"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-serif font-bold text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-slate-600 uppercase block mb-1">
                    Subtítulo / Tipo de Proyecto:
                  </label>
                  <input
                    type="text"
                    value={inputSubtitle}
                    onChange={(e) => setInputSubtitle(e.target.value)}
                    placeholder="ej: Novela ficticia experimental • Demo para Efecto Mariposa Project"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-serif text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: PERSONAJES PRINCIPALES */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>2. Personajes Principales (Biblia de Novela)</span>
                </div>
                <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                  Se guardarán en la Biblia de Personajes
                </span>
              </div>

              <textarea
                rows={5}
                value={inputCharacters}
                onChange={(e) => setInputCharacters(e.target.value)}
                placeholder="**ELENA VARELA, 38 años**&#10;Arquitecta. Metódica, escéptica y obsesionada...&#10;&#10;**MATEO VARELA, 34 años**&#10;Hermano menor de Elena..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 font-mono text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white leading-relaxed shadow-inner"
              />
            </div>

            {/* SECCIÓN 3: CUERPO NARRATIVO Y CAPÍTULOS (ESTA SECCIÓN ALIMENTA EL ESQUELETO 80 DÍAS) */}
            <div className="bg-white p-5 rounded-2xl border border-blue-300 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                  <Feather className="w-4 h-4 text-blue-600" />
                  <span>3. Cuerpo Narrativo & Capítulos (Alimentará el Esqueleto de 80 Días)</span>
                </div>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded font-extrabold">
                  EXCLUSIVO PARA JORNADAS 80 DÍAS
                </span>
              </div>

              <p className="text-[11px] text-slate-600 font-medium">
                Pega aquí únicamente la prosa narrativa (capítulos o escenas). No incluir títulos generales ni fichas de personajes en este recuadro para garantizar que el Día 1 empiece limpio directamente con la historia.
              </p>

              <textarea
                rows={12}
                value={inputNarrative}
                onChange={(e) => setInputNarrative(e.target.value)}
                placeholder="# 1. LA CASA&#10;La llave tardó tres intentos en entrar. Elena pensó que probablemente la cerradura se había oxidado...&#10;&#10;# 2. LA FOTOGRAFÍA&#10;Elena pidió a Mateo que no hiciera nada..."
                className="w-full bg-white border border-slate-300 rounded-xl p-4 font-mono text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 leading-relaxed shadow-inner"
              />
            </div>

            {/* SECCIÓN 4: MISTERIOS Y PREGUNTAS DRAMÁTICAS */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4 text-purple-600" />
                  <span>4. Preguntas Dramáticas & Misterios Abiertos (Opcional)</span>
                </div>
                <span className="text-[10px] font-mono bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-bold">
                  Se guardarán en la Biblia de Misterios
                </span>
              </div>

              <textarea
                rows={4}
                value={inputMysteries}
                onChange={(e) => setInputMysteries(e.target.value)}
                placeholder="¿Quién es realmente Elena?&#10;¿Qué ocurrió el 17 de julio de 1987?&#10;¿Dónde estuvo Clara?"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 font-mono text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white leading-relaxed shadow-inner"
              />
            </div>

            {/* BOTÓN PRINCIPAL */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleProcessRawText()}
                disabled={isProcessingRaw || (!inputNarrative.trim() && !rawStoryText.trim())}
                className="flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {isProcessingRaw ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                <span>🚀 Procesar e Integrar en Esqueleto 80 Días</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SECTION 2: ESQUELETO DE LA NOVELA (80 DÍAS / LUNES A VIERNES) */}
      {activeTab === 'skeleton' && (
        <div className="space-y-6">
          <div className="bg-blue-50/90 p-5 rounded-2xl border border-blue-200 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm font-serif">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Estructura Oficial: 80 Jornadas Diarias (De Lunes a Viernes x 4 Meses)</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Estructura alimentada por el Manuscrito Base. <strong>1 Línea Narrativa / Párrafo Inicial por cada día de Lunes a Viernes</strong>:
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 uppercase">Selecciona Mes:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
                {[1, 2, 3, 4].map((m) => (
                  <button
                    key={m}
                    onClick={() => { setSelectedMonth(m); setSelectedWeekFilter('ALL'); }}
                    className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                      selectedMonth === m
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'
                    }`}
                  >
                    Mes {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 uppercase">Semana:</span>
              <select
                value={selectedWeekFilter}
                onChange={(e) => setSelectedWeekFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold outline-none focus:border-blue-500"
              >
                <option value="ALL">Todas las semanas del Mes {selectedMonth}</option>
                {[1, 2, 3, 4].map((w) => {
                  const weekNum = (selectedMonth - 1) * 4 + w;
                  return (
                    <option key={weekNum} value={weekNum}>
                      Semana {weekNum} (Jornadas {(weekNum - 1) * 5 + 1} a {weekNum * 5})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* 5-Days per Week Grid with Dual Inputs & Word Count Badges */}
          <div className="space-y-8">
            {filteredDays.map((d) => {
              const baseText = getBaseDayText(d.dayNumber);
              const originalText = (d.openingText && d.openingText.length > 30) ? d.openingText : (baseText || d.narrativeLine);
              const isAiEdited = Boolean(aiEditedDays[d.dayNumber]) || (Boolean(d.openingText) && d.openingText !== d.narrativeLine);
              const originalWordCount = originalText.split(/\s+/).filter(Boolean).length;
              const editedWordCount = d.narrativeLine.split(/\s+/).filter(Boolean).length;

              return (
                <div
                  key={d.dayNumber}
                  className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm hover:border-blue-300 transition-all space-y-4 relative overflow-hidden"
                >
                  {/* Day Card Header Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold bg-blue-600 text-white px-3 py-1 rounded-lg shadow-2xs">
                        DÍA {String(d.dayNumber).padStart(3, '0')}
                      </span>
                      <span className="text-xs font-mono font-extrabold bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-300">
                        {d.dayOfWeek.toUpperCase()}
                      </span>
                      <span className="text-xs font-mono text-slate-500 font-bold">
                        Mes {d.monthNumber} • Semana {d.weekNumber}
                      </span>
                      {isAiEdited && (
                        <span className="text-xs font-mono font-extrabold bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-lg border border-amber-400 shadow-2xs flex items-center gap-1 animate-in fade-in">
                          <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                          <span>⚡ EDITADO CON IA</span>
                        </span>
                      )}
                    </div>

                    {/* Word Count Badges */}
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-lg border border-slate-300">
                        🔒 Original: <strong>{originalWordCount}</strong> palabras
                      </span>
                      <span className="bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-lg border border-amber-300">
                        ✍️ Editado: <strong>{editedWordCount}</strong> palabras
                      </span>
                    </div>
                  </div>

                  {/* Dual Panel Grid (60% / 40% Ergonomic Layout) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* INPUT 1: TEXTO ORIGINAL EXTRAÍDO (NO EDITABLE) */}
                    <div className="space-y-2 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-mono font-bold text-slate-600 uppercase flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>1. Texto Original Extraído (No Editable)</span>
                        </label>
                        <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                          BLOQUE BASE
                        </span>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 font-serif text-xs text-slate-700 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-line shadow-inner select-none font-medium">
                        {originalText}
                      </div>
                    </div>

                    {/* INPUT 2: VERSIÓN ADAPTADA Y EDICIÓN (EDITABLE MANULAMENTE & CON IA) */}
                    <div className="space-y-2 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/90 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <label className="text-[11px] font-mono font-bold text-amber-900 uppercase flex items-center gap-1.5">
                              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                              <span>2. Versión Adaptada / Edición (Editable & IA)</span>
                            </label>
                            {isAiEdited && (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-extrabold bg-amber-500 text-slate-950 border border-amber-400 flex items-center gap-1 shadow-2xs animate-in fade-in">
                                <Sparkles className="w-3 h-3 text-slate-950" />
                                <span>EDITADO CON IA</span>
                              </span>
                            )}
                          </div>

                          {/* Mode Switcher: Editor vs Visor Diff IDE */}
                          <div className="flex items-center gap-1 bg-amber-200/60 p-1 rounded-xl border border-amber-300">
                            <button
                              type="button"
                              onClick={() => setCardViewModes((prev) => ({ ...prev, [d.dayNumber]: 'editor' }))}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold transition-all ${
                                (cardViewModes[d.dayNumber] || 'editor') === 'editor'
                                  ? 'bg-white text-slate-900 shadow-2xs'
                                  : 'text-amber-900 hover:text-black'
                              }`}
                            >
                              ✍️ Editor
                            </button>
                            <button
                              type="button"
                              onClick={() => setCardViewModes((prev) => ({ ...prev, [d.dayNumber]: 'diff' }))}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold transition-all flex items-center gap-1 ${
                                cardViewModes[d.dayNumber] === 'diff'
                                  ? 'bg-slate-900 text-blue-400 shadow-2xs'
                                  : 'text-amber-900 hover:text-black'
                              }`}
                            >
                              <GitCompare className="w-3 h-3 text-blue-400" />
                              <span>Diff IDE</span>
                            </button>
                          </div>
                        </div>

                        {(cardViewModes[d.dayNumber] || 'editor') === 'editor' ? (
                          <textarea
                            rows={6}
                            value={d.narrativeLine}
                            onChange={(e) => {
                              const updated = [...novelDays];
                              const idx = updated.findIndex((x) => x.dayNumber === d.dayNumber);
                              if (idx !== -1) {
                                updated[idx].narrativeLine = e.target.value;
                                setNovelDays(updated);
                              }
                            }}
                            className="w-full bg-white border border-amber-300 rounded-xl p-3.5 font-serif text-xs text-slate-900 leading-relaxed outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-medium shadow-2xs"
                          />
                        ) : (
                          <IDEDiffViewer
                            fileName={`dia_${String(d.dayNumber).padStart(3, '0')}_narrativa.ts`}
                            originalText={originalText}
                            editedText={d.narrativeLine}
                            compact={true}
                          />
                        )}
                      </div>

                      {/* Action Bar for Input 2 */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-200/60 mt-2">
                        <button
                          type="button"
                          disabled={isGeneratingProposalDay === d.dayNumber}
                          onClick={async () => {
                            setIsGeneratingProposalDay(d.dayNumber);
                            try {
                              const res = await fetch('/api/story-bible/refine', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ text: originalText, dayNumber: d.dayNumber }),
                              });
                              const data = await res.json();
                              if (data.success && data.refinedText) {
                                setAiProposal({
                                  dayNumber: d.dayNumber,
                                  proposedText: data.refinedText,
                                  explanation: data.explanation || 'Se mejoró el ritmo, tensión, atmósfera y diálogos conservando la trama y hechos originales intactos.',
                                  status: data.status || 'SAFE',
                                });
                              } else {
                                showModal('ERROR', 'Error al Generar Propuesta', data.error || 'No se pudo generar la propuesta de edición.');
                              }
                            } catch (err: any) {
                              showModal('ERROR', 'Error al Generar Propuesta', err.message);
                            } finally {
                              setIsGeneratingProposalDay(null);
                            }
                          }}
                          className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[11px] rounded-xl shadow-2xs transition-all border border-amber-400 disabled:opacity-50"
                        >
                          {isGeneratingProposalDay === d.dayNumber ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                          ) : (
                            <Sparkles className="w-4 h-4 text-slate-950" />
                          )}
                          <div className="flex flex-col items-start leading-tight">
                            <span className="font-extrabold">
                              {isGeneratingProposalDay === d.dayNumber ? 'Procesando IA...' : '⚡ Edición Literaria IA'}
                            </span>
                            <span className="text-[9px] font-bold text-slate-900/80">Sin alterar la trama</span>
                          </div>
                        </button>

                        {/* Contenedor de Botón de Guardado e Icono de Historial directamente abajo */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await fetch('/api/story-bible', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    type: 'skeleton_week',
                                    day: d.dayNumber,
                                    weekNumber: d.weekNumber,
                                    openingText: d.narrativeLine,
                                  }),
                                });
                                invalidate('/api/story-bible');
                                const vNum = handleSaveDayVersion(d.dayNumber, d.narrativeLine, isAiEdited);
                                showModal(
                                  'SUCCESS',
                                  'Versión Guardada en Historial',
                                  `La Versión v${vNum} del Día ${d.dayNumber} se registró exitosamente en la línea de tiempo.`
                                );
                              } catch (err: any) {
                                showModal('ERROR', 'Error al Guardar', err.message);
                              }
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] rounded-xl shadow-2xs transition-all border border-blue-500 hover:shadow-md"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Guardar Cambios</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setHistoryModalDay(d.dayNumber)}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 font-bold text-[10px] rounded-lg border border-slate-300 hover:border-blue-300 transition-all shadow-2xs"
                            title="Ver Historial de Versiones Guardadas de este día"
                          >
                            <History className="w-3 h-3 text-blue-600" />
                            <span>📜 Historial de Versiones ({(dayHistory[d.dayNumber] || []).length > 0 ? (dayHistory[d.dayNumber] || []).length : 1} v)</span>
                          </button>
                        </div>

                        {isAiEdited && (
                          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/90 px-3 py-1.5 rounded-xl border border-emerald-300 font-bold flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Editado con IA (Trama Preservada)</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: PERSONAJES */}
      {activeTab === 'characters' && (
        isLoading ? (
          <div className="text-center py-12 space-y-3 font-mono text-xs text-slate-600">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p>Cargando personajes desde la base de datos...</p>
          </div>
        ) : characters.length === 0 ? (
          <div className="glass-panel p-16 rounded-2xl border-2 border-dashed border-slate-200 bg-white text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Biblia de Personajes Vacía</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Carga el manuscrito base en la pestaña <strong>"📄 Cargar Historia Completa"</strong> para extraer automáticamente el elenco oficial.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {characters.map((c) => (
              <div key={c.id} className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                      {c.name}
                    </h3>
                    <span className="text-xs font-mono text-slate-500 font-medium">{c.aliases || 'Personaje de la Novela'}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      c.status === 'ALIVE'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    ● {c.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-serif bg-slate-50 p-3 rounded-xl border border-slate-200">
                  "{c.description}"
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-200 text-slate-600 font-medium">
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold">APARICIÓN INICIAL:</span>
                    <span className="text-blue-900 font-bold">Día {c.firstAppearanceDay || 1}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold">UBICACIÓN ACTUAL:</span>
                    <span className="text-slate-900 font-bold">{c.currentLocation || 'Por definir'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* SECTION 4: MISTERIOS */}
      {activeTab === 'mysteries' && (
        mysteries.length === 0 ? (
          <div className="glass-panel p-16 rounded-2xl border-2 border-dashed border-slate-200 bg-white text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Catálogo de Misterios Vacío</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Carga el manuscrito base en <strong>"📄 Cargar Historia Completa"</strong> para extraer automáticamente las preguntas dramáticas de origen.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {mysteries.map((m) => (
              <div key={m.id} className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-900 border border-blue-300">
                      MISTERIO #{m.introducedDay}
                    </span>
                    <h3 className="text-base font-serif font-bold text-slate-900">{m.title}</h3>
                  </div>
                  <p className="text-xs text-slate-700 font-serif font-medium">{m.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-slate-500 font-bold">Importancia: ★★★★★</span>
                  <span className="px-2.5 py-1 rounded bg-sky-100 text-sky-900 border border-sky-300 text-xs font-mono font-bold">
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* GLOBAL SLIDE-OVER PROPOSAL DRAWER MODAL (Pantalla Completa) */}
      {aiProposal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-2xl lg:max-w-3xl bg-amber-50 border-l border-amber-300 shadow-2xl h-full flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-4">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-amber-500 text-slate-950 rounded-xl shadow-xs font-bold text-sm">⚡ IA</span>
                  <div>
                    <h3 className="text-sm font-mono font-extrabold text-amber-950 uppercase tracking-wider">
                      Propuesta de Edición Literaria (Día {aiProposal.dayNumber})
                    </h3>
                    <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300 font-bold inline-block mt-1">
                      🛡️ VALIDACIÓN CANÓNICA: SAFE (Sin Alteración de Trama)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAiProposal(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-amber-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* REPORTE DE ANÁLISIS Y ARGUMENTACIÓN LITERARIA (Basado en el Material de Apoyo) */}
              <div className="bg-amber-100/90 border border-amber-300 p-4 rounded-2xl space-y-3 font-mono text-xs shadow-2xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-300/80 pb-2.5">
                  <div className="font-bold text-xs text-amber-950 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-700" />
                    <span>DIAGNÓSTICO Y ARGUMENTACIÓN TEÓRICA DE EDICIÓN</span>
                  </div>
                  <span className="text-[10px] font-mono bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-300">
                    📖 Material de Apoyo para Análisis Literario
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  {/* 1. Sintaxis Narrativa: Núcleos vs Catálisis */}
                  <div className="bg-white/90 p-3 rounded-xl border border-amber-200/90 space-y-1.5 shadow-2xs">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                      <span>1. Sintaxis Narrativa (Núcleos & Catálisis):</span>
                    </div>
                    <div className="text-slate-700 leading-relaxed text-[10px]">
                      <p><strong className="text-amber-950">Qué cambia:</strong> Modulación de cadencia y microedición de ritmo en transiciones.</p>
                      <p><strong className="text-amber-950">Por qué (Fundamento):</strong> Los <em>Núcleos</em> (acciones causa-efecto intocables) se preservan al 100%. Se regulan las <em>Catálisis</em> (acciones de relleno) para demorar la acción y generar suspenso entre núcleos sin diluir la tensión.</p>
                    </div>
                  </div>

                  {/* 2. Perspectiva & Focalización */}
                  <div className="bg-white/90 p-3 rounded-xl border border-amber-200/90 space-y-1.5 shadow-2xs">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                      <span>2. Perspectiva Narrativa & Focalización:</span>
                    </div>
                    <div className="text-slate-700 leading-relaxed text-[10px]">
                      <p><strong className="text-amber-950">Qué cambia:</strong> Mantiene la voz gramatical (1a/3a) y la mirada del narrador.</p>
                      <p><strong className="text-amber-950">Por qué (Fundamento):</strong> Respeto estricto del grado de saber (equisciente / focalización interna o cero) evitando revelar información previa o alterar la subjetividad del relato.</p>
                    </div>
                  </div>

                  {/* 3. Atmósfera & Espacio Actancial */}
                  <div className="bg-white/90 p-3 rounded-xl border border-amber-200/90 space-y-1.5 shadow-2xs">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                      <span>3. Índices de Atmósfera & Espacio:</span>
                    </div>
                    <div className="text-slate-700 leading-relaxed text-[10px]">
                      <p><strong className="text-amber-950">Qué cambia:</strong> Intensificación de operadores tonales y adjetivación atmosférica.</p>
                      <p><strong className="text-amber-950">Por qué (Fundamento):</strong> Eleva el valor simbólico y actancial del espacio (clima psicológico) interpelando al lector sin alterar hechos ni personajes.</p>
                    </div>
                  </div>

                  {/* 4. Estructura del Discurso y Diálogos */}
                  <div className="bg-white/90 p-3 rounded-xl border border-amber-200/90 space-y-1.5 shadow-2xs">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                      <span>4. Estructura del Discurso y Diálogos:</span>
                    </div>
                    <div className="text-slate-700 leading-relaxed text-[10px]">
                      <p><strong className="text-amber-950">Qué cambia:</strong> Formateo con raya larga (—) y pulido fónico.</p>
                      <p><strong className="text-amber-950">Por qué (Fundamento):</strong> Aumenta la musicalidad del relato y la fluidez del intercambio verbal entre los actantes.</p>
                    </div>
                  </div>
                </div>

                {/* AI Explanation Note */}
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-300/80 text-[11px] font-mono text-amber-950 flex items-start gap-2 shadow-inner">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-amber-900 font-bold mb-0.5">Diagnóstico Específico para este Fragmento:</strong>
                    <span>{aiProposal.explanation}</span>
                  </div>
                </div>
              </div>

              {/* Proposed Text Area (Editable input so user can inspect and adjust before confirming) */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-amber-900 uppercase block">
                  3. Texto Propuesto por la IA (Revisar y Confirmar):
                </label>
                <textarea
                  rows={14}
                  value={aiProposal.proposedText}
                  onChange={(e) => setAiProposal({ ...aiProposal, proposedText: e.target.value })}
                  className="w-full bg-white border border-amber-400 rounded-2xl p-4 font-serif text-sm text-slate-900 leading-relaxed outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-medium shadow-inner"
                />
              </div>
            </div>

            {/* Drawer Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-200/80 mt-6">
              <button
                type="button"
                onClick={() => setAiProposal(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-mono font-bold text-xs rounded-xl transition-all"
              >
                ❌ Descartar Propuesta
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = [...novelDays];
                  const idx = updated.findIndex((x) => x.dayNumber === aiProposal.dayNumber);
                  if (idx !== -1) {
                    if (!updated[idx].openingText) {
                      updated[idx].openingText = updated[idx].narrativeLine;
                    }
                    updated[idx].narrativeLine = aiProposal.proposedText;
                    setNovelDays(updated);
                  }
                  setAiEditedDays((prev) => ({ ...prev, [aiProposal.dayNumber]: true }));
                  setCardViewModes((prev) => ({ ...prev, [aiProposal.dayNumber]: 'diff' }));
                  const targetDay = aiProposal.dayNumber;
                  setAiProposal(null);
                  showModal(
                    'SUCCESS',
                    'Edición Literaria IA Aplicada',
                    `La versión editada con IA se aplicó al Día ${targetDay}. Se ha activado automáticamente la vista Diff IDE para comparar respecto al texto original de la izquierda.`
                  );
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all border border-emerald-500 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>✅ Aceptar y Reemplazar Versión Editada</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DAY MODAL */}
      {editingDayNumber !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="glass-panel p-6 rounded-2xl border border-blue-300 bg-white shadow-lg max-w-lg w-full space-y-4">
            <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-600" /> Editar Línea Narrativa del Día {editingDayNumber}
            </h3>

            <textarea
              rows={4}
              value={editLineText}
              onChange={(e) => setEditLineText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-serif text-xs text-slate-900 outline-none focus:border-blue-500 leading-relaxed font-medium"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingDayNumber(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveDayLine}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs text-white font-bold shadow-xs"
              >
                Guardar Línea del Día
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW CHARACTER MODAL */}
      {showNewCharModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="glass-panel p-6 rounded-2xl border border-blue-300 bg-white shadow-lg max-w-md w-full space-y-4">
            <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" /> Registrar Personaje en Story Bible
            </h3>

            <form onSubmit={handleAddCharacter} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre del Personaje:</label>
                <input
                  type="text"
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Descripción / Rol:</label>
                <textarea
                  rows={3}
                  value={newCharDesc}
                  onChange={(e) => setNewCharDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCharModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs text-white font-bold shadow-xs"
                >
                  Guardar Personaje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL DE HISTORIAL DE VERSIONES POR DÍA (Slide-Over Lateral) */}
      {historyModalDay !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white border-l border-slate-200 shadow-2xl h-full flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-xs">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                      Historial de Versiones — DÍA {String(historyModalDay).padStart(3, '0')}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Línea de tiempo de versiones guardadas y revisiones del capítulo
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHistoryModalDay(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Versions List */}
              {(() => {
                const targetDay = novelDays.find((d) => d.dayNumber === historyModalDay);
                const historyList = dayHistory[historyModalDay] || [
                  {
                    id: `v-base-${historyModalDay}`,
                    versionNumber: 1,
                    savedAt: 'Versión Inicial',
                    text: targetDay?.narrativeLine || '',
                    wordCount: (targetDay?.narrativeLine || '').split(/\s+/).filter(Boolean).length,
                    isAiEdited: Boolean(aiEditedDays[historyModalDay]),
                  },
                ];

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-200 text-xs font-mono text-blue-900">
                      <span className="font-bold">Total Versiones Guardadas: {historyList.length}</span>
                      <span className="text-[10px] text-blue-700 font-bold bg-white px-2 py-0.5 rounded border border-blue-200">
                        Historial Activo por Día
                      </span>
                    </div>

                    <div className="space-y-4 divide-y divide-slate-100">
                      {historyList.map((ver, idx) => {
                        const isCurrent = idx === 0;

                        return (
                          <div key={ver.id} className="pt-4 space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-lg border ${
                                    isCurrent
                                      ? 'bg-blue-600 text-white border-blue-700'
                                      : 'bg-slate-100 text-slate-700 border-slate-300'
                                  }`}
                                >
                                  v{ver.versionNumber} {isCurrent ? '(Actual)' : ''}
                                </span>

                                <span className="text-xs font-mono text-slate-500 font-medium flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  {ver.savedAt}
                                </span>

                                {ver.isAiEdited ? (
                                  <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-amber-700" />
                                    Edición IA
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded-md">
                                    ✍️ Edición Manual
                                  </span>
                                )}
                              </div>

                              <span className="text-xs font-mono text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200 font-bold">
                                {ver.wordCount} palabras
                              </span>
                            </div>

                            {/* Text Preview Box */}
                            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-serif text-xs text-slate-800 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line shadow-inner">
                              {ver.text}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2 pt-1">
                              {!isCurrent && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...novelDays];
                                    const dayIdx = updated.findIndex((x) => x.dayNumber === historyModalDay);
                                    if (dayIdx !== -1) {
                                      updated[dayIdx].narrativeLine = ver.text;
                                      setNovelDays(updated);
                                      showModal(
                                        'SUCCESS',
                                        'Versión Restaurada',
                                        `La Versión v${ver.versionNumber} fue restaurada en el Editor del Día ${historyModalDay}.`
                                      );
                                      setHistoryModalDay(null);
                                    }
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all border border-emerald-500"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Restaurar esta Versión</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setHistoryModalDay(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs text-slate-800 font-bold transition-all"
              >
                Cerrar Historial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
