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
      treeData: [{ title: 'Chicken', expanded: true, children: [{ title: 'Egg' }] }],
    };
  }

  render() {
    return (
      <div style={{ height: 300 }}>
        <SortableTree
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

export const BarebonesExample: Story = {
  name: 'Minimal implementation',
  render: () => <App />,
};

export default meta;
