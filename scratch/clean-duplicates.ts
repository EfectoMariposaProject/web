import { prisma } from '../src/lib/db/prisma';

async function cleanDuplicates() {
  console.log('=== DEDICATED DATABASE CLEANUP ===');

  // Clean Characters
  const characters = await prisma.character.findMany();
  const seenChars = new Set<string>();
  for (const c of characters) {
    if (seenChars.has(c.name)) {
      await prisma.character.delete({ where: { id: c.id } });
      console.log(`Eliminado personaje duplicado: ${c.name} (${c.id})`);
    } else {
      seenChars.add(c.name);
    }
  }

  // Clean Mysteries
  const mysteries = await prisma.mystery.findMany();
  const seenMysteries = new Set<string>();
  for (const m of mysteries) {
    if (seenMysteries.has(m.title)) {
      await prisma.mystery.delete({ where: { id: m.id } });
      console.log(`Eliminado misterio duplicado: ${m.title} (${m.id})`);
    } else {
      seenMysteries.add(m.title);
    }
  }

  // Clean Narrative Seeds
  const seeds = await prisma.narrativeSeed.findMany();
  const seenSeeds = new Set<string>();
  for (const s of seeds) {
    if (seenSeeds.has(s.title)) {
      await prisma.narrativeSeed.delete({ where: { id: s.id } });
      console.log(`Eliminada semilla duplicada: ${s.title} (${s.id})`);
    } else {
      seenSeeds.add(s.title);
    }
  }

  console.log('=== LIMPIEZA FINALIZADA CON ÉXITO ===');
}

cleanDuplicates().catch(console.error);
