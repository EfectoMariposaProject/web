import { prisma } from '../src/lib/db/prisma';

async function purgeMockCharacters() {
  console.log('=== PURGANDO PERSONAJES Y ENTIDADES FICTICIAS HARDCODEADAS ===');
  await prisma.character.deleteMany();
  await prisma.mystery.deleteMany();
  await prisma.narrativeSeed.deleteMany();
  console.log('=== DB PURGADA Y LIMPIA CON ÉXITO ===');
}

purgeMockCharacters().catch(console.error);
