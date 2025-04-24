import type { Meta, StoryObj } from '@storybook/react';
import SpiralPassport from './SpiralPassport';

const meta: Meta<typeof SpiralPassport> = {
  title: 'Components/SpiralPassport', // Organizes story in Storybook sidebar
  component: SpiralPassport,
  parameters: {
    // Optional parameters: layout, backgrounds, etc.
    layout: 'centered',
  },
  tags: ['autodocs'], // Enables automatic documentation generation
  argTypes: {
    // Define controls for props in Storybook UI
    stageBlend: {
      control: 'object',
      description: 'Object representing the stage blend percentages (0-1)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Define mock data
const mockStageBlend = {
    RED: 0.1,
    BLUE: 0.4,
    ORANGE: 0.3,
    GREEN: 0.15,
    YELLOW: 0.05,
    // PURPLE, BEIGE, TURQUOISE will default to 0
};

const mockProcessingBlend = null; // Example for loading/processing state

// Default story with mock data
export const Default: Story = {
  args: {
    stageBlend: mockStageBlend,
  },
};

// Story representing the processing state
export const Processing: Story = {
    args: {
      stageBlend: mockProcessingBlend,
    },
  };

// Story with slightly different data
export const AlternativeBlend: Story = {
    args: {
      stageBlend: {
        BLUE: 0.1,
        ORANGE: 0.5,
        GREEN: 0.3,
        YELLOW: 0.1,
      },
    },
  }; 
