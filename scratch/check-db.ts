import { prisma } from '../src/lib/db/prisma';

async function testQuery() {
  const count = await prisma.contribution.count();
  console.log('Total de registros en tabla Contribution:', count);
  const days = await prisma.projectDay.findMany();
  console.log('ProjectDays en DB:', days);
  const sample = await prisma.contribution.findMany({ take: 5 });
  console.log('Muestra de contribuciones:', sample);
}

testQuery().catch(console.error);
