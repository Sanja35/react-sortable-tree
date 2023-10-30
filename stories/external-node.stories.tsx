/* eslint-disable max-classes-per-file */
/* eslint-disable react/no-multi-comp */
import type { Meta, StoryObj } from '@storybook/react';
import React, { Component } from 'react';
import {
  DndProvider,
  DragSource,
  ConnectDragSource,
  DragSourceSpec,
  DragSourceConnector,
} from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TreeItem } from '../src/models';
import { SortableTreeWithoutDndContext as SortableTree } from '../src';
// In your own app, you would need to use import styles once in the app
// import 'react-sortable-tree/styles.css';

// -------------------------
// Create an drag source component that can be dragged into the tree
// -------------------------
// This type must be assigned to the tree via the `dndType` prop as well
const externalNodeType = 'yourNodeType';
const externalNodeSpec: DragSourceSpec<{ node: TreeItem }, TreeItem> = {
  // This needs to return an object with a property `node` in it.
  // Object rest spread is recommended to avoid side effects of
  // referencing the same object in different trees.
  beginDrag: (componentProps) => ({ node: { ...componentProps.node } }),
};
const externalNodeCollect = (connect: DragSourceConnector /* , monitor */) => ({
  connectDragSource: connect.dragSource(),
  // Add props via react-dnd APIs to enable more visual
  // customization of your component
  // isDragging: monitor.isDragging(),
  // didDrop: monitor.didDrop(),
});

interface IExternalNodeBaseComponentProps {
  connectDragSource: ConnectDragSource;
  node: TreeItem;
}

class ExternalNodeBaseComponent extends Component<IExternalNodeBaseComponentProps> {
  render() {
    const { connectDragSource, node } = this.props;

    return connectDragSource(
      <div
        style={{
          display: 'inline-block',
          padding: '3px 5px',
          background: 'blue',
          color: 'white',
        }}
      >
        {node.title}
      </div>,
      { dropEffect: 'copy' }
    );
  }
}

const YourExternalNodeComponent = DragSource(
  externalNodeType,
  externalNodeSpec,
  externalNodeCollect
)(ExternalNodeBaseComponent);

interface IStoryComponentState {
  treeData: TreeItem[];
}

class App extends Component<unknown, IStoryComponentState> {
  constructor(props) {
    super(props);

    this.state = {
      treeData: [{ title: 'Mama Rabbit' }, { title: 'Papa Rabbit' }],
    };
  }

  render() {
    return (
      <DndProvider backend={HTML5Backend}>
        <div>
          <div style={{ height: 300 }}>
            <SortableTree
              treeData={this.state.treeData}
              onChange={(treeData) => this.setState({ treeData })}
              dndType={externalNodeType}
            />
          </div>
          <YourExternalNodeComponent node={{ title: 'Baby Rabbit' }} />← drag this
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

export const ExternalNodeExample: Story = {
  name: 'Drag from external source',
  render: () => <App />,
};

export default meta;
