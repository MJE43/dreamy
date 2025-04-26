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

// Updated Dilemmas Array
const dilemmas = [
  {
    type: RefType.DILEMMA,
    code: 'DILEMMA_01',
    name: 'Community vs. Individual',
    description:
      `A close friend asks you to spend Saturday helping them move, but you'd planned to grind on a side-project deadline.`,
    details: {
      choices: [
        { option: 'A', text: `Help my friend; the relationship comes first.`, score: 'GREEN' },
        { option: 'B', text: `Stick to my plan and finish the project.`,       score: 'ORANGE' },
      ],
    },
  },
  {
    type: RefType.DILEMMA,
    code: 'DILEMMA_02',
    name: 'Order vs. Freedom',
    description:
      `Your company is debating whether to keep strict 9-to-5 hours or move to fully flexible schedules.`,
    details: {
      choices: [
        { option: 'A', text: `Keep the 9-to-5 for clear structure.`,               score: 'BLUE' },
        { option: 'B', text: `Let people choose their own hours.`,                score: 'ORANGE' },
      ],
    },
  },
  {
    type: RefType.DILEMMA,
    code: 'DILEMMA_03',
    name: 'Tradition vs. Progress',
    description:
      `Your family follows a holiday ritual you find outdated and wasteful.`,
    details: {
      choices: [
        { option: 'A', text: `Honor the tradition for family unity.`,             score: 'BLUE' },
        { option: 'B', text: `Suggest a modern alternative that's more efficient.`, score: 'ORANGE' },
      ],
    },
  },
  {
    type: RefType.DILEMMA,
    code: 'DILEMMA_04',
    name: 'Power vs. Compassion',
    description:
      `You see a coworker bullying a junior teammate.`,
    details: {
      choices: [
        { option: 'A', text: `Confront the bully on the spot—show strength.`,     score: 'RED' },
        { option: 'B', text: `Pull them aside later to mediate calmly.`,          score: 'GREEN' },
      ],
    },
  },
  {
    type: RefType.DILEMMA,
    code: 'DILEMMA_05',
    name: 'Rules vs. Results',
    description:
      `A shortcut would deliver the project faster but breaks a minor policy.`,
    details: {
      choices: [
        { option: 'A', text: `Follow the policy no matter what.`,                 score: 'BLUE' },
        { option: 'B', text: `Take the shortcut and ship.`,                       score: 'ORANGE' },
      ],
    },
  },
  {
    type: RefType.DILEMMA,
    code: 'DILEMMA_06',
    name: 'Group Harmony vs. Personal Truth',
    description:
      `Your friend group agrees on a political take you strongly disagree with.`,
    details: {
      choices: [
        { option: 'A', text: `Stay quiet to keep the peace.`,                     score: 'GREEN' },
        { option: 'B', text: `Voice my stance even if it sparks conflict.`,       score: 'ORANGE' },
      ],
    },
  },
  {
    type: RefType.DILEMMA,
    code: 'DILEMMA_07',
    name: 'Safety vs. Exploration',
    description:
      `You're invited on a backpacking trek that's exciting but risky and out of your comfort zone.`,
    details: {
      choices: [
        { option: 'A', text: `Stick to safe, familiar plans.`,                    score: 'PURPLE' },
        { option: 'B', text: `Go for the adventure despite the risks.`,           score: 'RED' },
      ],
    },
  },
  {
    type: RefType.DILEMMA,
    code: 'DILEMMA_08',
    name: 'Rationality vs. Intuition',
    description:
      `Data suggests Option X is best, but you have a strong gut feeling for Option Y.`,
    details: {
      choices: [
        { option: 'A', text: `Trust the data—go with Option X.`,                  score: 'ORANGE' },
        { option: 'B', text: `Go with my intuition—choose Option Y.`,             score: 'PURPLE' },
      ],
    },
  },
  {
    type: RefType.DILEMMA,
    code: 'DILEMMA_09',
    name: 'Local Impact vs. Systemic View',
    description:
      `A policy change helps the whole company but will hurt your immediate team's bonus.`,
    details: {
      choices: [
        { option: 'A', text: `Protect my team's short-term interests.`,           score: 'GREEN' },
        { option: 'B', text: `Support the change for the bigger-picture benefit.`, score: 'YELLOW' },
      ],
    },
  },
  {
    type: RefType.DILEMMA,
    code: 'DILEMMA_10',
    name: 'Knowledge vs. Experience',
    description:
      `You need to master a new tool quickly.`,
    details: {
      choices: [
        { option: 'A', text: `Study expert docs & courses first.`,                score: 'BLUE' },
        { option: 'B', text: `Dive in hands-on and learn by tinkering.`,          score: 'YELLOW' },
      ],
    },
  },
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
