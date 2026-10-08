import { prisma } from './prisma';
import { Contribution, Participant, DailySelectionRule, SelectionAuditLog } from '@/types/domain.types';
import { formatGlobalCommentCode, formatDailyCommentCode } from '@/core/audit/hasher';

export class StoryRepository {
  public async getOrCreateProject() {
    let project = await prisma.project.findFirst({
      where: { slug: 'efecto-mariposa-project' },
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          name: 'Efecto Mariposa Project',
          slug: 'efecto-mariposa-project',
          description: 'Plataforma de gestión narrativa colaborativa asistida por IA para el reto de 365 días (100 a 150 palabras por comentario).',
          dailyWordLimit: 150,
          dailySelectedContributions: 3,
          maxSelectedPerUser: 3,
          status: 'ACTIVE',
        },
      });
    }

    return project;
  }

  public async getOrCreateDay(dayNumber = 1) {
    const project = await this.getOrCreateProject();

    let day = await prisma.projectDay.findFirst({
      where: {
        projectId: project.id,
        dayNumber,
      },
    });

    if (!day) {
      day = await prisma.projectDay.create({
        data: {
          id: `day-${String(dayNumber).padStart(3, '0')}`,
          projectId: project.id,
          dayNumber,
          weekNumber: Math.ceil(dayNumber / 7),
          status: 'CURATION',
        },
      });
    }

    return day;
  }

  public async getOrCreateSocialPost(projectDayId: string, challengeDay = 1) {
    let post = await prisma.socialPost.findFirst({
      where: { projectDayId },
    });

    if (!post) {
      post = await prisma.socialPost.create({
        data: {
          id: `EMP-POST-${String(challengeDay).padStart(4, '0')}`,
          projectDayId,
          challengeDay,
          platform: 'TIKTOK',
          status: 'abierto',
          opensAt: new Date(),
        },
      });
    }

    return post;
  }

  public async saveBatchContributions(
    projectDayId: string,
    contributions: Contribution[],
    participants: Participant[]
  ) {
    const participantIdMap = new Map<string, string>();

    for (const p of participants) {
      try {
        const upserted = await prisma.participant.upsert({
          where: {
            platform_platformUserId: {
              platform: p.platform || 'TIKTOK',
              platformUserId: p.platform_user_id,
            },
          },
          update: {
            username: p.username,
            displayName: p.display_name,
            profileUrl: p.profile_url,
            avatarUrl: p.avatar_url,
          },
          create: {
            id: p.id || `part_${p.platform_user_id.toLowerCase()}`,
            platform: p.platform || 'TIKTOK',
            platformUserId: p.platform_user_id,
            username: p.username,
            displayName: p.display_name,
            profileUrl: p.profile_url,
            avatarUrl: p.avatar_url,
            selectedCount: p.selected_count || 0,
            declared18Plus: p.declared_18_plus ?? true,
            termsAccepted: p.terms_accepted ?? true,
          },
        });
        participantIdMap.set(p.platform_user_id.toLowerCase(), upserted.id);
        if (p.username) {
          participantIdMap.set(p.username.toLowerCase(), upserted.id);
        }
      } catch (pErr: any) {
        console.warn(`Advertencia al guardar participante ${p.username}:`, pErr.message);
      }
    }

    const dayNumBatch = Number(projectDayId.replace(/\D/g, '')) || 1;
    const day = await this.getOrCreateDay(dayNumBatch);
    const post = await this.getOrCreateSocialPost(day.id, dayNumBatch);

    try {
      await prisma.socialPost.update({
        where: { id: post.id },
        data: {
          lastCheckedAt: new Date(),
          commentsLockedAt: new Date(),
        },
      });
    } catch (postErr: any) {
      console.warn('Advertencia al actualizar SocialPost:', postErr.message);
    }

    // Determine baseline global sequence offset
    const maxGlobalAgg = await prisma.contribution.aggregate({
      _max: { globalSequence: true },
      where: { projectDayId: { not: day.id } },
    });
    let runningGlobalSeq = (maxGlobalAgg._max.globalSequence || 0) + 1;

    for (const c of contributions) {
      try {
        const assignedGlobalSeq = c.global_sequence && c.global_sequence > (maxGlobalAgg._max.globalSequence || 0)
          ? c.global_sequence
          : runningGlobalSeq++;

        const globalCode = formatGlobalCommentCode(assignedGlobalSeq);
        const dailyCode = formatDailyCommentCode(dayNumBatch, c.capture_sequence);
        const uniqueInternalId = `D${String(dayNumBatch).padStart(2, '0')}-C${String(c.capture_sequence).padStart(4, '0')}`;

        const participantKey = (c.participant_id || '').replace(/^part_/, '').toLowerCase();
        const actualParticipantId = participantIdMap.get(participantKey) || c.participant_id;

        const existingContrib = await prisma.contribution.findFirst({
          where: { internalId: uniqueInternalId },
        });

        if (existingContrib) {
          await prisma.contribution.update({
            where: { id: existingContrib.id },
            data: {
              participantId: actualParticipantId,
              originalText: c.original_text,
              wordCount: c.word_count,
              status: c.status,
              validationStatus: c.validation_status,
              validationReasons: JSON.stringify(c.validation_reasons || []),
              rawJson: c.raw_json,
              replyToCommentId: c.reply_to_comment_id,
              isReply: c.is_reply ?? false,
              receivedAt: c.received_at ? new Date(c.received_at) : existingContrib.receivedAt,
            },
          });
        } else {
          await prisma.contribution.create({
            data: {
              id: `contrib_${day.id}_${c.capture_sequence}_${Date.now()}`,
              projectId: day.projectId,
              projectDayId: day.id,
              socialPostId: post.id,
              globalCommentCode: globalCode,
              dailyCommentCode: dailyCode,
              internalId: uniqueInternalId,
              participantId: actualParticipantId,
              originalText: c.original_text,
              originalHash: c.original_hash || '',
              normalizedText: c.normalized_text,
              wordCount: c.word_count,
              captureSequence: c.capture_sequence,
              globalSequence: assignedGlobalSeq,
              receivedAt: c.received_at ? new Date(c.received_at) : new Date(),
              ageDeclarationStatus: c.age_declaration_status || 'declared_18_plus',
              termsAccepted: c.terms_accepted ?? true,
              lateComment: c.late_comment ?? false,
              status: c.status,
              validationStatus: c.validation_status,
              validationReasons: JSON.stringify(c.validation_reasons || []),
              rawJson: c.raw_json,
              replyToCommentId: c.reply_to_comment_id,
              isReply: c.is_reply ?? false,
            },
          });
        }
      } catch (cErr: any) {
        console.warn(`Advertencia al guardar comentario #${c.capture_sequence}:`, cErr.message);
      }
    }
  }


  public async saveSelectionResult(
    projectDayId: string,
    rules: DailySelectionRule[],
    auditLogs: SelectionAuditLog[]
  ) {
    for (const r of rules) {
      await prisma.dailySelectionRule.upsert({
        where: {
          projectDayId_slotNumber: {
            projectDayId,
            slotNumber: r.slot_number,
          },
        },
        update: {
          targetSequence: r.target_sequence,
          selectedContributionId: r.selected_contribution_id,
          replacementApplied: r.replacement_applied,
          replacementReason: r.replacement_reason,
        },
        create: {
          id: r.id,
          projectDayId,
          slotNumber: r.slot_number,
          targetSequence: r.target_sequence,
          selectedContributionId: r.selected_contribution_id,
          replacementApplied: r.replacement_applied,
          replacementReason: r.replacement_reason,
        },
      });
    }

    for (const log of auditLogs) {
      await prisma.selectionAuditLog.create({
        data: {
          id: log.id,
          projectDayId,
          selectionSlot: log.selection_slot,
          initialTarget: log.initial_target,
          candidateSequence: log.candidate_sequence,
          contributionId: log.contribution_id,
          valid: log.valid,
          reason: log.reason,
        },
      });
    }
  }

  // --- PARTICIPANT & CONTRIBUTION METHODS ---

  public async getParticipantByUsername(username: string) {
    return prisma.participant.findFirst({
      where: { username },
    });
  }

  public async getParticipantById(id: string) {
    return prisma.participant.findUnique({
      where: { id },
    });
  }

  public async createParticipant(data: {
    platform: any;
    platform_user_id: string;
    username: string;
    declared_18_plus: boolean;
    terms_accepted: boolean;
  }) {
    return prisma.participant.create({
      data: {
        platform: data.platform || 'TIKTOK',
        platformUserId: data.platform_user_id,
        username: data.username,
        declared18Plus: data.declared_18_plus,
        termsAccepted: data.terms_accepted,
      },
    });
  }

  public async getAllParticipants(): Promise<Participant[]> {
    const list = await prisma.participant.findMany();
    return list.map((p) => ({
      id: p.id,
      platform: p.platform as any,
      platform_user_id: p.platformUserId,
      username: p.username,
      display_name: p.displayName || undefined,
      avatar_url: p.avatarUrl || undefined,
      profile_url: p.profileUrl || undefined,
      selected_count: p.selectedCount,
      is_blocked: p.isBlocked,
      declared_18_plus: p.declared18Plus,
      terms_accepted: p.termsAccepted,
      created_at: p.createdAt.toISOString(),
      updated_at: p.updatedAt.toISOString(),
    }));
  }


  public async getContributionsSummaryByDay(projectDayId: string) {
    const numFromId = Number(projectDayId.replace(/\D/g, '')) || 1;
    let day = await prisma.projectDay.findFirst({
      where: {
        OR: [
          { id: projectDayId },
          { dayNumber: numFromId },
        ],
      },
    });

    if (!day) {
      day = await this.getOrCreateDay(numFromId);
    }

    const dayId = day.id;
    const dayNumber = day.dayNumber;

    const totalCount = await prisma.contribution.count({
      where: { projectDayId: dayId },
    });

    const validCount = await prisma.contribution.count({
      where: {
        projectDayId: dayId,
        wordCount: { gte: 100, lte: 150 },
      },
    });

    const invalidCount = totalCount - validCount;

    // Unique participants in this day
    const distinctParticipants = await prisma.contribution.groupBy({
      by: ['participantId'],
      where: { projectDayId: dayId },
    });

    const uniqueAuthors = distinctParticipants.length;

    // Incorporated count from selection rules
    const selectionRules = await prisma.dailySelectionRule.findMany({
      where: { projectDayId: dayId },
    });
    const incorporatedCount = selectionRules.filter((s) => s.selectedContributionId).length;

    return {
      dayNumber,
      totalContributions: totalCount,
      dailyContributions: totalCount,
      validContributions: validCount,
      invalidContributions: invalidCount,
      incorporatedContributions: incorporatedCount,
      uniqueAuthors,
      authorsWith1: Math.min(uniqueAuthors, 1),
      authorsWith2: 0,
      authorsWith3Max: 0,
      openMysteries: 3,
      activeSeeds: 5,
      pendingContradictions: 0,
    };
  }

  public async getContributionsByDay(projectDayId: string) {
    let day = await prisma.projectDay.findFirst({
      where: {
        OR: [
          { id: projectDayId },
          { dayNumber: Number(projectDayId.replace(/\D/g, '')) || 1 },
        ],
      },
    });

    if (!day) {
      const numFromId = Number(projectDayId.replace(/\D/g, '')) || 1;
      day = await this.getOrCreateDay(numFromId);
    }

    const list = await prisma.contribution.findMany({
      where: { projectDayId: day.id },
      include: { participant: true },
      orderBy: { captureSequence: 'asc' },
    });

    return list.map((c) => ({
      id: c.id,
      project_day_id: c.projectDayId,
      participant_id: c.participantId,
      social_post_id: c.socialPostId || `EMP-POST-${String(Number(c.projectDayId.replace(/\D/g, '')) || 1).padStart(4, '0')}`,
      platform_comment_id: c.platformCommentId || `comment-${c.captureSequence}`,
      platform_comment_url: c.platformCommentUrl || (c.participant ? `https://www.tiktok.com/@${c.participant.username.replace(/^@/, '')}` : undefined),
      capture_sequence: c.captureSequence,
      daily_sequence_number: c.captureSequence,
      global_sequence_number: c.globalSequence || c.captureSequence,
      daily_comment_code: c.dailyCommentCode,
      global_comment_code: c.globalCommentCode,
      internal_id: c.internalId,
      original_text: c.originalText,
      normalized_text: c.normalizedText || c.originalText,
      word_count: c.wordCount,
      original_hash: c.originalHash || '',
      sha256_hash: c.originalHash || '',
      status: c.status as any,
      validation_status: c.validationStatus as any,
      validation_reasons: c.validationReasons ? JSON.parse(c.validationReasons) : [],
      is_valid: c.validationStatus === 'VALID',
      received_at: c.receivedAt.toISOString(),
      created_at: c.createdAt.toISOString(),
      updated_at: c.updatedAt.toISOString(),

      // Metadata from Participant
      author_handle: c.participant ? `@${c.participant.username.replace(/^@/, '')}` : `@user_${c.captureSequence}`,
      author_name: c.participant?.displayName || c.participant?.username || `Usuario ${c.captureSequence}`,
      avatar_url: c.participant?.avatarUrl || `https://unavatar.io/tiktok/${c.participant?.username || 'user'}`,
      profile_url: c.participant?.profileUrl || (c.participant ? `https://www.tiktok.com/@${c.participant.username.replace(/^@/, '')}` : '#'),
      likes: 0,
      replies: 0,
      language: 'es',
    }));
  }

  public async createContribution(data: {
    project_day_id: string;
    participant_id: string;
    social_post_id: string;
    platform_comment_id: string;
    global_sequence_number: number;
    daily_sequence_number: number;
    global_comment_code: string;
    daily_comment_code: string;
    original_text: string;
    word_count: number;
    is_valid: boolean;
    invalidation_reason: string | null;
    sha256_hash: string;
  }) {
    const dayNum = Number(data.project_day_id.replace(/\D/g, '')) || 1;
    const day = await this.getOrCreateDay(dayNum);
    const post = await this.getOrCreateSocialPost(day.id, dayNum);

    const c = await prisma.contribution.create({
      data: {
        projectId: day.projectId,
        projectDayId: day.id,
        participantId: data.participant_id,
        socialPostId: post.id,
        platformCommentId: data.platform_comment_id,
        globalSequence: data.global_sequence_number,
        captureSequence: data.daily_sequence_number,
        globalCommentCode: data.global_comment_code,
        dailyCommentCode: data.daily_comment_code,
        internalId: data.daily_comment_code,
        originalText: data.original_text,
        wordCount: data.word_count,
        originalHash: data.sha256_hash,
        status: data.is_valid ? 'VALID' : 'INVALIDATED',
        validationStatus: data.is_valid ? 'VALID' : 'INVALIDATED',
        validationReasons: JSON.stringify(data.invalidation_reason ? [data.invalidation_reason] : []),
      },
    });


    return {
      id: c.id,
      project_day_id: c.projectDayId,
      participant_id: c.participantId,
      social_post_id: c.socialPostId || `EMP-POST-${String(dayNum).padStart(4, '0')}`,
      platform_comment_id: c.platformCommentId || `comment-${c.captureSequence}`,
      capture_sequence: c.captureSequence,
      daily_sequence_number: c.captureSequence,
      global_sequence_number: c.globalSequence || c.captureSequence,
      daily_comment_code: c.dailyCommentCode,
      global_comment_code: c.globalCommentCode,
      internal_id: c.internalId,
      original_text: c.originalText,
      word_count: c.wordCount,
      original_hash: c.originalHash || '',
      sha256_hash: c.originalHash || '',
      status: c.status as any,
      validation_status: c.validationStatus as any,
      created_at: c.createdAt.toISOString(),
      updated_at: c.updatedAt.toISOString(),
    };
  }

  public async getAllProjectDays() {
    return prisma.projectDay.findMany({
      orderBy: { dayNumber: 'asc' },
    });
  }

  public async saveEditorialRevision(data: {
    contribution_id: string;
    editor_user_id: string;
    ai_proposal_text?: string;
    final_adapted_text: string;
    essence_preserved: boolean;
    edition_type: string;
    justification_note?: string;
  }) {
    const updated = await prisma.contribution.update({
      where: { id: data.contribution_id },
      data: {
        editorialVersion: data.ai_proposal_text || null,
        finalVersion: data.final_adapted_text,
        essencePreserved: data.essence_preserved,
        editorialNotes: `${data.edition_type}: ${data.justification_note || ''}`,
        status: 'PUBLISHED',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: data.editor_user_id,
        action: 'EDITORIAL_REVISION',
        entity: 'Contribution',
        entityId: data.contribution_id,
        newValue: data.final_adapted_text,
        reason: data.justification_note || data.edition_type,
      },
    });

    return updated;
  }


  // --- STORY BIBLE CRUD METHODS ---

  public async getCharacters() {
    const project = await this.getOrCreateProject();
    return prisma.character.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createCharacter(data: {
    name: string;
    description: string;
    status?: string;
    firstAppearanceDay?: number;
    currentLocation?: string;
  }) {
    const project = await this.getOrCreateProject();
    const existing = await prisma.character.findFirst({
      where: { projectId: project.id, name: data.name },
    });

    if (existing) {
      return prisma.character.update({
        where: { id: existing.id },
        data: {
          description: data.description,
          status: data.status || existing.status,
          currentLocation: data.currentLocation || existing.currentLocation,
        },
      });
    }

    return prisma.character.create({
      data: {
        projectId: project.id,
        name: data.name,
        description: data.description,
        status: data.status || 'ALIVE',
        firstAppearanceDay: data.firstAppearanceDay || 1,
        currentLocation: data.currentLocation || 'Desconocido',
      },
    });
  }

  public async getMysteries() {
    const project = await this.getOrCreateProject();
    return prisma.mystery.findMany({
      where: { projectId: project.id },
      orderBy: { introducedDay: 'desc' },
    });
  }

  public async createMystery(data: {
    title: string;
    description: string;
    introducedDay: number;
    importance?: number;
  }) {
    const project = await this.getOrCreateProject();
    const existing = await prisma.mystery.findFirst({
      where: { projectId: project.id, title: data.title },
    });

    if (existing) {
      return prisma.mystery.update({
        where: { id: existing.id },
        data: {
          description: data.description,
          importance: data.importance || existing.importance,
        },
      });
    }

    return prisma.mystery.create({
      data: {
        projectId: project.id,
        title: data.title,
        description: data.description,
        introducedDay: data.introducedDay,
        importance: data.importance || 1,
        status: 'OPEN',
      },
    });
  }

  public async getNarrativeSeeds() {
    const project = await this.getOrCreateProject();
    return prisma.narrativeSeed.findMany({
      where: { projectId: project.id },
      orderBy: { introducedDay: 'desc' },
    });
  }

  public async createNarrativeSeed(data: {
    title: string;
    description: string;
    introducedDay: number;
  }) {
    const project = await this.getOrCreateProject();
    const existing = await prisma.narrativeSeed.findFirst({
      where: { projectId: project.id, title: data.title },
    });

    if (existing) {
      return prisma.narrativeSeed.update({
        where: { id: existing.id },
        data: { description: data.description },
      });
    }

    return prisma.narrativeSeed.create({
      data: {
        projectId: project.id,
        title: data.title,
        description: data.description,
        introducedDay: data.introducedDay,
        status: 'OPEN',
      },
    });
  }

  public async seedNovelLaboratory() {
    const project = await this.getOrCreateProject();

    // 1. Update Project Title & Description
    await prisma.project.update({
      where: { id: project.id },
      data: {
        name: 'LA HABITACIÓN QUE NO EXISTÍA',
        description: 'Novela ficticia experimental • Laboratorio de Efecto Mariposa Project (Misterio central, 6 personajes, secretos cruzados y convocatorias de 100 a 150 palabras).',
      },
    });

    // 2. Seed 8 Characters
    const charactersData = [
      {
        name: 'ELENA VARELA',
        aliases: 'Arquitecta (38 años)',
        description: 'Metódica, escéptica y obsesionada con encontrar explicaciones racionales para todo. Regresa a Monterrey después de 17 años para vender la antigua casa de su abuela.',
        status: 'ALIVE',
        firstAppearanceDay: 1,
        currentLocation: 'Casa de la Abuela (Monterrey)',
      },
      {
        name: 'MATEO VARELA',
        aliases: 'Fotógrafo (34 años)',
        description: 'Hermano menor de Elena. Impulsivo, irónico y mucho más sentimental de lo que admite. Fue el último miembro de la familia que vio con vida a su abuela.',
        status: 'ALIVE',
        firstAppearanceDay: 1,
        currentLocation: 'Casa de la Abuela (Monterrey)',
      },
      {
        name: 'SOFÍA ALCÁZAR',
        aliases: 'Periodista (37 años)',
        description: 'Amiga de infancia de Elena. Curiosa hasta niveles peligrosos. Conserva una caja metálica con una mariposa grabada que la abuela le entregó 9 años atrás con instrucciones de no abrirla.',
        status: 'ALIVE',
        firstAppearanceDay: 3,
        currentLocation: 'Monterrey',
      },
      {
        name: 'TOMÁS LERMA',
        aliases: 'Notario (42 años)',
        description: 'Notario encargado de la sucesión. Elegante, reservado y aparentemente ajeno a los asuntos familiares. Conoce detalles de la casa que nadie recuerda haberle contado.',
        status: 'ALIVE',
        firstAppearanceDay: 3,
        currentLocation: 'Notaría / Casa de la Abuela',
      },
      {
        name: 'LUCÍA CLARA SALDAÑA',
        aliases: 'Vecina (29 años)',
        description: 'Vecina de la casa (#143). Hija de Clara Varela. Afirma haber visto a una mujer encendiendo la luz de la habitación del 2º piso tras la muerte de la abuela. Posee la mitad de una llave.',
        status: 'ALIVE',
        firstAppearanceDay: 2,
        currentLocation: 'Casa de enfrente (#143)',
      },
      {
        name: 'GABRIEL VARELA',
        aliases: 'Padre (67 años)',
        description: 'Padre de Elena y Mateo. Vive fuera. Cuando Elena menciona una habitación al final del pasillo, exige abandonar inmediatamente la casa. Revela que Elena nació antes en 1987 en otra versión.',
        status: 'ALIVE',
        firstAppearanceDay: 2,
        currentLocation: 'Monterrey',
      },
      {
        name: 'CLARA VARELA',
        aliases: 'Tía Desaparecida',
        description: 'Hermana de Gabriel. Desapareció el 17 de julio de 1987 a los 28 años tras cruzar la habitación azul.',
        status: 'MISSING',
        firstAppearanceDay: 5,
        currentLocation: 'Habitación Azul / Dimensión Desconocida',
      },
      {
        name: 'ABUELA VARELA',
        aliases: 'Matriarca (Aparición)',
        description: 'Falleció 6 meses atrás. Se materializa en la silla de la habitación azul a las 3:33 AM con el mensaje: "Ahora sí podemos empezar."',
        status: 'MYSTERIOUS',
        firstAppearanceDay: 10,
        currentLocation: 'Habitación Azul',
      },
    ];

    for (const c of charactersData) {
      await this.createCharacter(c);
    }

    // 3. Seed 10 Days/Chapters
    const daysData = [
      {
        dayNumber: 1,
        narrativeLine: 'La llave tardó tres intentos en entrar. Elena pensó que la cerradura se había oxidado, pero la casa se resistía. El péndulo del reloj sonaba a las 3:33 PM. Mateo tocó el muro del pasillo: "Había seis puertas". Tres golpes. Sonó un sonido hueco.',
      },
      {
        dayNumber: 2,
        narrativeLine: 'Desde el exterior existía una ventana en el segundo piso; desde el interior, no. En la Polaroid de 1987 la frase leía: "Antes de cerrar la habitación. No dejen que Gabriel entre primero." Gabriel exigió por teléfono: "Salgan de esa casa. No la abras."',
      },
      {
        dayNumber: 3,
        narrativeLine: 'Sofía entregó una caja metálica con una mariposa grabada: "Pregúntale a Elena qué recuerda de la habitación azul." El notario Tomás Lerma reveló la cláusula: 7 noches en la casa, escribir entre 100 y 150 palabras a las 3:33 AM e introducirlas debajo de la puerta.',
      },
      {
        dayNumber: 4,
        narrativeLine: 'A las 3:33 AM las luces se apagaron y un marco de puerta emergió sobre el muro. Mateo introdujo 120 palabras por la ranura. Pasos al otro lado. Una hoja emergió con la respuesta manuscrita con la letra de Elena: "Yo también quiero saber qué me ocurrió."',
      },
      {
        dayNumber: 5,
        narrativeLine: 'Tomás reveló que la niña sin rostro era Clara Varela, tía desaparecida en 1987. La cámara de seguridad captó a las 3:33 AM a una mujer de 30 años saliendo de la pared: era idéntica a Elena.',
      },
      {
        dayNumber: 6,
        narrativeLine: 'Gabriel confesó llorando: "La niña de 8 años en la foto no es Clara... eres tú, Elena." Reveló que todos recuerdan hechos distintos: en su recuerdo Clara desapareció; en el de la abuela fue Gabriel; en otro recuerdo Elena nunca nació.',
      },
      {
        dayNumber: 7,
        narrativeLine: 'La habitación azul tenía paredes azules y notas de 100 a 150 palabras. Una Polaroid mostraba la casa incendiándose el 24 de septiembre de 2026. Un teléfono escondido repicó: la voz de Elena advirtió "No permitan que Sofía abra la caja metálica."',
      },
      {
        dayNumber: 8,
        narrativeLine: 'La caja se abrió sola revelando la carta: "Tú ya estuviste dentro de la habitación." Lucía Saldaña reveló que su madre era Clara Varela y unió su media llave a la pieza de la caja.',
      },
      {
        dayNumber: 9,
        narrativeLine: 'Gabriel reveló que la habitación intercambia posibilidades y universos entre personas. La Elena actual no pertenecía a esta realidad. El teléfono volvió a sonar: la Elena atrapada desde 1987 exigió "Devuélveme mi vida."',
      },
      {
        dayNumber: 10,
        narrativeLine: 'El testamento exige 7 registros de 100 a 150 palabras que alteran la realidad. A las 3:33 AM una hoja avisó: "Hay 7 personas en esta habitación, aunque solo ven 6." Detrás apareció sentada la abuela muerta: "Ahora sí podemos empezar."',
      },
    ];

    for (const d of daysData) {
      const pDay = await this.getOrCreateDay(d.dayNumber);
      await prisma.projectDay.update({
        where: { id: pDay.id },
        data: {
          narrativeLine: d.narrativeLine,
          openingText: d.narrativeLine,
          weekNumber: Math.ceil(d.dayNumber / 5),
        },
      });
    }

    // 4. Seed 13 Open Mysteries
    const mysteriesData = [
      { title: '¿Quién es realmente Elena Varela?', description: '¿De qué línea temporal o posibilidad proviene la Elena actual y qué ocurrió con la Elena original de 1987?', introducedDay: 1, importance: 5 },
      { title: '¿Qué ocurrió el 17 de julio de 1987?', description: '¿Qué evento transcurrió dentro de la habitación azul el día de la desaparición de Clara Varela?', introducedDay: 5, importance: 5 },
      { title: '¿Dónde estuvo Clara Varela?', description: '¿Por qué su hija Lucía recibió su carta 6 años después de su supuesta muerte?', introducedDay: 8, importance: 4 },
      { title: '¿Por qué la familia recuerda versiones contradictorias?', description: 'En el recuerdo de Gabriel Clara desapareció; en el de la abuela fue Gabriel; en otro Elena nunca nació.', introducedDay: 6, importance: 5 },
      { title: '¿Cómo se encuentra viva la Abuela Varela?', description: 'Murió hace 6 meses pero aparece sentada en la habitación azul a las 3:33 AM diciendo: "Ahora sí podemos empezar."', introducedDay: 10, importance: 5 },
      { title: '¿Qué oculta el notario Tomás Lerma?', description: 'Conoce detalles no revelados del testamento y de la habitación azul desde hace décadas.', introducedDay: 3, importance: 4 },
      { title: '¿Qué ocurre al introducir entre 100 y 150 palabras bajo la puerta?', description: '¿Por qué los textos de 100 a 150 palabras enviados por la ranura generan respuestas físicas inmediatas al otro lado?', introducedDay: 4, importance: 5 },
      { title: '¿Las 100 a 150 palabras modifican el pasado o el futuro?', description: 'El testamento establece que cada registro de 100 a 150 palabras altera las posibilidades de la realidad.', introducedDay: 10, importance: 5 },
      { title: '¿Quién provocará el incendio del 24 de septiembre de 2026?', description: 'La Polaroid encontrada en la caja muestra la casa envuelta en llamas en esa fecha exacta.', introducedDay: 7, importance: 4 },
      { title: '¿Es posible recuperar una realidad descartada?', description: '¿Qué riesgos existen al intentar traer de regreso una línea temporal previa?', introducedDay: 9, importance: 4 },
      { title: '¿Cuáles son las consecuencias de intercambiar personas entre realidades?', description: 'El proceso de intercambio entre posibilidades podría desestabilizar la existencia de los personajes.', introducedDay: 9, importance: 4 },
      { title: '¿Existen más habitaciones que no existen?', description: '¿Se trata de un fenómeno exclusivo de la casa #143 o existen otras estructuras similares?', introducedDay: 7, importance: 3 },
      { title: '¿Quién o qué construyó la habitación azul?', description: 'El origen de la anomalía arquitectónica y su vinculo con la mariposa grabada.', introducedDay: 3, importance: 4 },
    ];

    for (const m of mysteriesData) {
      await this.createMystery(m);
    }

    return { success: true };
  }
}

export const storyRepository = new StoryRepository();

