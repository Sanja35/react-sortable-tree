/* eslint-disable max-classes-per-file */
/* eslint-disable react/no-multi-comp */
import type { Meta, StoryObj } from '@storybook/react';
import React, { Component } from 'react';
import {
  DndProvider,
  DropTarget,
  ConnectDropTarget,
  DropTargetConnector,
  DropTargetMonitor,
  DropTargetSpec,
} from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TreeItem } from '../src/models';
import { SortableTreeWithoutDndContext as SortableTree } from '../src';
// In your own app, you would need to use import styles once in the app
// import 'react-sortable-tree/styles.css';

// -------------------------
// Create an drop target component that can receive the nodes
// -------------------------
// This type must be assigned to the tree via the `dndType` prop as well
const trashAreaType = 'yourNodeType';
const trashAreaSpec: DropTargetSpec<unknown> = {
  // The endDrag handler on the tree source will use some of the properties of
  // the source, like node, treeIndex, and path to determine where it was before.
  // The treeId must be changed, or it interprets it as dropping within itself.
  drop: (props, monitor) => ({ ...monitor.getItem(), treeId: 'trash' }),
};
const trashAreaCollect = (connect: DropTargetConnector, monitor: DropTargetMonitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({ shallow: true }),
});

interface ITrashAreaBaseComponentProps {
  children: React.ReactNode;
  connectDropTarget: ConnectDropTarget;
  isOver: boolean;
}

// The component will sit around the tree component and catch
// nodes dragged out
class TrashAreaBaseComponent extends Component<ITrashAreaBaseComponentProps> {
  render() {
    const { connectDropTarget, children, isOver } = this.props;

    return connectDropTarget(
      <div
        style={{
          height: '100vh',
          padding: 50,
          background: isOver ? 'pink' : 'transparent',
        }}
      >
        {children}
      </div>
    );
  }
}

const TrashArea = DropTarget(
  trashAreaType,
  trashAreaSpec,
  trashAreaCollect
)(TrashAreaBaseComponent);

interface IStoryComponentState {
  treeData: TreeItem[];
}

class App extends Component<unknown, IStoryComponentState> {
  constructor(props) {
    super(props);

    this.state = {
      treeData: [
        { title: '1' },
        { title: '2' },
        { title: '3' },
        { title: '4', expanded: true, children: [{ title: '5' }] },
      ],
    };
  }

  render() {
    return (
      <DndProvider backend={HTML5Backend}>
        <div>
          <TrashArea>
            <div style={{ height: 250 }}>
              <SortableTree
                treeData={this.state.treeData}
                onChange={(treeData) => this.setState({ treeData })}
                dndType={trashAreaType}
              />
            </div>
          </TrashArea>
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

export const DragOutToRemoveExample: Story = {
  name: 'Drag out to remove',
  render: () => <App />,
};

export default meta;
