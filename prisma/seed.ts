import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding local Prisma SQLite database for Efecto Mariposa Project...');

  const project = await prisma.project.upsert({
    where: { slug: 'efecto-mariposa-project' },
    update: {},
    create: {
      name: 'Efecto Mariposa Project',
      slug: 'efecto-mariposa-project',
      description: 'Plataforma de gestión narrativa colaborativa asistida por IA para el reto de 365 días.',
      dailyWordLimit: 33,
      dailySelectedContributions: 3,
      maxSelectedPerUser: 3,
      status: 'ACTIVE',
    },
  });

  const day1 = await prisma.projectDay.upsert({
    where: {
      projectId_dayNumber: {
        projectId: project.id,
        dayNumber: 1,
      },
    },
    update: {},
    create: {
      projectId: project.id,
      dayNumber: 1,
      weekNumber: 1,
      status: 'CURATION',
      editorialNotes: 'Primera jornada del reto de 365 días.',
    },
  });

  console.log(`✅ Project created/updated: ${project.name} (${project.id})`);
  console.log(`✅ Day 1 created/updated: ID ${day1.id}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
