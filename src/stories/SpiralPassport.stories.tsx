import type { Meta, StoryObj } from '@storybook/react';
import { SpiralPassport } from '@/components/SpiralPassport';

const meta: Meta<typeof SpiralPassport> = {
  title: 'Components/SpiralPassport',
  component: SpiralPassport,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SpiralPassport>;

export const Default: Story = {
  args: {
    stageBlend: {
      BLUE: 0.55,
      ORANGE: 0.30,
      GREEN: 0.15,
    },
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    stageBlend: {},
  },
};

export const AllStages: Story = {
  args: {
    stageBlend: {
      BEIGE: 0.1,
      PURPLE: 0.15,
      RED: 0.1,
      BLUE: 0.25,
      ORANGE: 0.15,
      GREEN: 0.1,
      YELLOW: 0.1,
      TURQUOISE: 0.05,
    },
  },
}; 
