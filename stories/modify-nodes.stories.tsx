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
        { name: 'IT Manager' },
        {
          name: 'Regional Manager',
          expanded: true,
          children: [{ name: 'Branch Manager' }],
        },
      ],
    };
  }

  render() {
    const getNodeKey = ({ treeIndex }) => treeIndex;
    return (
      <div>
        <div style={{ height: 300 }}>
          <SortableTree
            treeData={this.state.treeData}
            onChange={(treeData) => this.setState({ treeData })}
            generateNodeProps={({ node, path }) => ({
              title: (
                <input
                  style={{ fontSize: '1.1rem' }}
                  value={node.name}
                  onChange={(event) => {
                    const name = event.target.value;

                    this.setState((state) => ({
                      treeData: changeNodeAtPath({
                        treeData: state.treeData,
                        path,
                        getNodeKey,
                        newNode: { ...node, name },
                      }),
                    }));
                  }}
                />
              ),
            })}
          />
        </div>
      </div>
    );
  }
}

const meta: Meta<typeof App> = {
  title: 'Basics',
  component: App,
};

type Story = StoryObj<typeof App>;

export const ModifyNodesExample: Story = {
  name: 'Modify nodes',
  render: () => <App />,
};

export default meta;
