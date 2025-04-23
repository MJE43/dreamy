// scripts/seedSpiral.ts
import { PrismaClient, RefType } from '../src/generated/prisma'; // ← custom path
// If you changed the generator back to default, use:
// import { PrismaClient, RefType } from '@prisma/client';

const prisma = new PrismaClient();

/* ---------- Seed data ---------- */

const stages = [
  { type: RefType.STAGE, code: 'BEIGE',    name: 'SurvivalSense',
    description: 'Instinctive, survival-driven, automatic reflexes.',
    details: { tier: 1, order: 0 }, colorHex: '#F5F5DC' },
  { type: RefType.STAGE, code: 'PURPLE',   name: 'KinSpirits',
    description: 'Tribal, animistic, safety in belonging, ritualistic.',
    details: { tier: 1, order: 1 }, colorHex: '#E6E6FA' },
  { type: RefType.STAGE, code: 'RED',      name: 'PowerGods',
    description: 'Egocentric, impulsive, heroic, seeks dominance.',
    details: { tier: 1, order: 2 }, colorHex: '#FFCCCC' },
  { type: RefType.STAGE, code: 'BLUE',     name: 'TruthForce',
    description: 'Absolutistic, purposeful, authoritarian, seeks order.',
    details: { tier: 1, order: 3 }, colorHex: '#D0E0FF' },
  { type: RefType.STAGE, code: 'ORANGE',   name: 'StriveDrive',
    description: 'Multiplistic, strategic, individualistic, seeks achievement.',
    details: { tier: 1, order: 4 }, colorHex: '#FFE5CC' },
  { type: RefType.STAGE, code: 'GREEN',    name: 'HumanBond',
    description: 'Relativistic, communal, sensitive, seeks harmony.',
    details: { tier: 1, order: 5 }, colorHex: '#D0F0C0' },
  { type: RefType.STAGE, code: 'YELLOW',   name: 'FlexFlow',
    description: 'Systemic, integrative, independent, seeks knowledge.',
    details: { tier: 2, order: 6 }, colorHex: '#FFFFE0' },
  { type: RefType.STAGE, code: 'TURQUOISE',name: 'GlobalView',
    description: 'Holistic, experiential, collective, seeks synthesis.',
    details: { tier: 2, order: 7 }, colorHex: '#AFEEEE' },
];

const dilemmas = [
  {
    type: RefType.DILEMMA,
    code: 'DILEMMA_01',
    name: 'Community vs. Individual',
    description:
      'A close friend asks for help moving, but you have a personal project deadline. Do you prioritize the community bond or your individual goal?',
    details: {
      choices: [
        { option: 'A', text: 'Help the friend, strengthening the community bond.', score: 'GREEN' },
        { option: 'B', text: 'Focus on your project to achieve your personal goal.', score: 'ORANGE' },
      ],
    },
  },
  // … DILEMMA_02 → DILEMMA_10 (unchanged from your draft) …
];

/* ---------- Seed logic ---------- */

async function upsertMany(records: typeof stages | typeof dilemmas) {
  for (const record of records) {
    await prisma.spiralReference.upsert({
      where: { code: record.code },
      update: record,
      create: record,
    });
    console.log(`Upserted ${record.code}`);
  }
}

async function main() {
  console.log('🌱  Seeding SpiralReference …');
  await upsertMany(stages);
  await upsertMany(dilemmas);
  console.log('✅  Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
