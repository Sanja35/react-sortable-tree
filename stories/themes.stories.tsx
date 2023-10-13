/* eslint-disable import/no-extraneous-dependencies */
import type { Meta, StoryObj } from '@storybook/react';
import React, { Component } from 'react';
import FileExplorerTheme from 'react-sortable-tree-theme-file-explorer';
import { TreeItem } from '../src/models';
import SortableTree from '../src';
// In your own app, you would need to use import styles once in the app
// import 'react-sortable-tree/styles.css';

interface IStoryComponentState {
  treeData: TreeItem[];
}

class App extends Component<unknown, IStoryComponentState> {
  constructor(props) {
    super(props);

    this.state = {
      treeData: [
        {
          title: 'The file explorer theme',
          expanded: true,
          children: [
            {
              title: 'Imported from react-sortable-tree-theme-file-explorer',
              expanded: true,
              children: [
                {
                  title: (
                    <div>
                      Find it on{' '}
                      <a href="https://www.npmjs.com/package/react-sortable-tree-theme-file-explorer">
                        npm
                      </a>
                    </div>
                  ),
                },
              ],
            },
          ],
        },
        { title: 'More compact than the default' },
        {
          title: (
            <div>
              Simply set it to the <code>theme</code> prop and you&rsquo;re done!
            </div>
          ),
        },
      ],
    };
  }

  render() {
    return (
      <div style={{ height: 300 }}>
        <SortableTree
          theme={FileExplorerTheme}
          treeData={this.state.treeData}
          onChange={(treeData) => this.setState({ treeData })}
        />
      </div>
    );
  }
}

const meta: Meta<typeof App> = {
  title: 'Basics',
  component: App,
};

type Story = StoryObj<typeof App>;

export const ThemesExample: Story = {
  name: 'Themes',
  render: () => <App />,
};

export default meta;
