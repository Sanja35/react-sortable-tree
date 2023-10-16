import type { Meta, StoryObj } from '@storybook/react';
import React, { Component } from 'react';
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
          title: 'Managers',
          expanded: true,
          children: [
            {
              title: 'Rob',
              children: [],
              isPerson: true,
            },
            {
              title: 'Joe',
              children: [],
              isPerson: true,
            },
          ],
        },
        {
          title: 'Clerks',
          expanded: true,
          children: [
            {
              title: 'Bertha',
              children: [],
              isPerson: true,
            },
            {
              title: 'Billy',
              children: [],
              isPerson: true,
            },
          ],
        },
      ],
    };
  }

  render() {
    return (
      <div>
        <div style={{ height: 300 }}>
          <SortableTree
            treeData={this.state.treeData}
            canNodeHaveChildren={(node) => !node.isPerson}
            onChange={(treeData) => this.setState({ treeData })}
          />
        </div>
      </div>
    );
  }
}

const meta: Meta<typeof App> = {
  title: 'Advanced',
  component: App,
};

type Story = StoryObj<typeof App>;

export const ChildlessNodes: Story = {
  name: 'Prevent some nodes from having children',
  render: () => <App />,
};

export default meta;
