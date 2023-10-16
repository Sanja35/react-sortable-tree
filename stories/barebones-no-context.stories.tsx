import type { Meta, StoryObj } from '@storybook/react';
import React, { Component } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TreeItem } from '../src/models';
import { SortableTreeWithoutDndContext as SortableTree } from '../src';

interface IStoryComponentState {
  treeData: TreeItem[];
}

class App extends Component<any, IStoryComponentState> {
  constructor(props) {
    super(props);

    this.state = {
      treeData: [{ title: 'Chicken', expanded: true, children: [{ title: 'Egg' }] }],
    };
  }

  render() {
    return (
      <div style={{ height: 300 }}>
        <DndProvider backend={HTML5Backend}>
          <SortableTree
            treeData={this.state.treeData}
            onChange={(treeData) => this.setState({ treeData })}
          />
        </DndProvider>
      </div>
    );
  }
}

const meta: Meta<typeof App> = {
  title: 'Advanced',
  component: App,
};

type Story = StoryObj<typeof App>;

export const BarebonesExampleNoContext: Story = {
  name: 'Minimal implementation without Dnd Context',
  render: () => <App />,
};

export default meta;
