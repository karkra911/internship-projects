const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Seed Providers 1 to 8
  const providers = [
    { id: 1, name: 'Provider 1' },
    { id: 2, name: 'Provider 2' },
    { id: 3, name: 'Provider 3' },
    { id: 4, name: 'Provider 4' },
    { id: 5, name: 'Provider 5' },
    { id: 6, name: 'Provider 6' },
    { id: 7, name: 'Provider 7' },
    { id: 8, name: 'Provider 8' },
  ];

  for (const provider of providers) {
    await prisma.provider.upsert({
      where: { id: provider.id },
      update: {},
      create: provider,
    });
  }

  // Seed RoundRobinState
  const states = [
    { poolName: 'POOL_1', nextIndex: 0 },
    { poolName: 'POOL_2', nextIndex: 0 },
    { poolName: 'POOL_3', nextIndex: 0 },
  ];

  for (const state of states) {
    await prisma.roundRobinState.upsert({
      where: { poolName: state.poolName },
      update: {},
      create: state,
    });
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
