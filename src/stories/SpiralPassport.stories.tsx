import type { Meta, StoryObj } from '@storybook/react';
import SpiralPassport from "@/components/SpiralPassport";

const meta: Meta<typeof SpiralPassport> = {
  title: "Components/SpiralPassport",
  component: SpiralPassport,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    stageBlend: { control: "object" },
    narrativeSummary: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof SpiralPassport>;

export const Default: Story = {
  args: {
    stageBlend: {
      RED: 0.1,
      BLUE: 0.3,
      ORANGE: 0.4,
      GREEN: 0.2,
    },
    narrativeSummary:
      "Predominantly ORANGE worldview with significant BLUE influences and emerging GREEN values. Focus is on achievement and strategic thinking, tempered by a need for order and growing awareness of community impact.",
  },
};

export const LoadingState: Story = {
  args: {
    stageBlend: null,
    narrativeSummary: null,
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

export const MinimalData: Story = {
  args: {
    stageBlend: {
      BLUE: 0.6,
      ORANGE: 0.4,
    },
    narrativeSummary: null,
  },
}; 
