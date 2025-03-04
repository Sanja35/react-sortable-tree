import type { Meta, StoryObj } from '@storybook/react';
import React, { Component } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { TreeItem } from '../src/models';
import { SortableTreeWithoutDndContext as SortableTree } from '../src';
// In your own app, you would need to use import styles once in the app
// import 'react-sortable-tree/styles.css';

// https://stackoverflow.com/a/4819886/1601953
const isTouchDevice = !!('ontouchstart' in window || navigator.maxTouchPoints);
const dndBackend = isTouchDevice ? TouchBackend : HTML5Backend;

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
      <DndProvider backend={dndBackend}>
        <div>
          <span>This is {!isTouchDevice && 'not '}a touch-supporting browser</span>

          <div style={{ height: 300 }}>
            <SortableTree
              treeData={this.state.treeData}
              onChange={(treeData) => this.setState({ treeData })}
            />
          </div>
        </div>
      </DndProvider>
    );
  }
}

const meta: Meta<typeof App> = {
  title: 'Advanced',
  component: App,
};

type Story = StoryObj<typeof App>;

export const TouchSupportExample: Story = {
  name: 'Touch support (Experimental)',
  render: () => <App />,
};

export default meta;
