import type { StorybookConfig } from '@storybook/react-webpack5';
import { hiddenProps } from './hidden-props';

const config: StorybookConfig = {
  stories: [
    '../stories/ts/**/*.mdx',
    '../stories/ts/**/*.stories.(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true, // makes union prop types like variant and size appear as select controls
      shouldRemoveUndefinedFromOptional: true, // makes string and boolean types that can be undefined appear as inputs and switches
      propFilter: {
        skipPropsWithName: hiddenProps,
      },
    }
  }
};
export default config;
