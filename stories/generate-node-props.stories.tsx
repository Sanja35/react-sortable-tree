import type { Meta, StoryObj } from '@storybook/react';
import React, { Component } from 'react';
import { TreeItem } from '../src/models';
import SortableTree, { changeNodeAtPath } from '../src';
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
        { id: 1, position: 'Goalkeeper' },
        { id: 2, position: 'Wing-back' },
        {
          id: 3,
          position: 'Striker',
          children: [{ id: 4, position: 'Full-back' }],
        },
      ],
    };
  }

  render() {
    const TEAM_COLORS = ['Red', 'Black', 'Green', 'Blue'];
    const getNodeKey = ({ node: { id } }) => id;
    return (
      <div>
        <div style={{ height: 300 }}>
          <SortableTree
            treeData={this.state.treeData}
            onChange={(treeData) => this.setState({ treeData })}
            getNodeKey={getNodeKey}
            generateNodeProps={({ node, path }) => {
              const rootLevelIndex =
                this.state.treeData.reduce<number>((acc, n, index) => {
                  if (acc !== null) {
                    return acc;
                  }
                  if (path[0] === n.id) {
                    return index;
                  }
                  return null;
                }, null) || 0;
              const playerColor = TEAM_COLORS[rootLevelIndex];

              return {
                style: {
                  boxShadow: `0 0 0 4px ${playerColor.toLowerCase()}`,
                  textShadow:
                    path.length === 1 ? `1px 1px 1px ${playerColor.toLowerCase()}` : 'none',
                },
                title: `${playerColor} ${path.length === 1 ? 'Captain' : node.position}`,
                onClick: () => {
                  this.setState((state) => ({
                    treeData: changeNodeAtPath({
                      treeData: state.treeData,
                      path,
                      getNodeKey,
                      newNode: { ...node, expanded: !node.expanded },
                    }),
                  }));
                },
              };
            }}
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

export const GenerateNodePropsExample: Story = {
  name: 'Playing with generateNodeProps',
  render: () => <App />,
};

export default meta;
