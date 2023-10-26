import type { Meta, StoryObj } from '@storybook/react';
import React, { Component } from 'react';
import { VirtuosoHandle, LocationOptions } from 'react-virtuoso';
import { TreeItem } from '../src/models';
import SortableTree from '../src';
// In your own app, you would need to use import styles once in the app
// import 'react-sortable-tree/styles.css';

const NUMBER_OF_NODES = 100;

interface IStoryComponentState {
  align: LocationOptions['align'];
  behavior: LocationOptions['behavior'];
  index: number;
  treeData: TreeItem[];
}

class App extends Component<unknown, IStoryComponentState> {
  virtuosoRef = React.createRef<VirtuosoHandle>();

  constructor(props) {
    super(props);

    this.state = {
      align: 'start',
      behavior: 'auto',
      index: 50,
      treeData: new Array(NUMBER_OF_NODES).fill(0).map((_, index) => ({ title: `Node ${index}` })),
    };

    this.onChangeIndex = this.onChangeIndex.bind(this);
    this.onChangeAlign = this.onChangeAlign.bind(this);
    this.onChangeBehavior = this.onChangeBehavior.bind(this);
  }

  onChangeIndex(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ index: Number(event.target.value) });
  }

  onChangeAlign(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ align: event.target.value as LocationOptions['align'] });
  }

  onChangeBehavior(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ behavior: event.target.value as LocationOptions['behavior'] });
  }

  render() {
    const { align, behavior, index } = this.state;

    return (
      <div style={{ display: 'flex' }}>
        <div style={{ height: 400, width: 400, margin: '0 20px 0 0' }}>
          <SortableTree
            virtuosoRef={this.virtuosoRef}
            treeData={this.state.treeData}
            onChange={(treeData) => this.setState({ treeData })}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: 150,
          }}
        >
          <label htmlFor="index-input">
            index:
            <input
              id="index-input"
              type="number"
              min={0}
              max={NUMBER_OF_NODES - 1}
              onChange={this.onChangeIndex}
              value={this.state.index}
            />
          </label>
          <label htmlFor="align">
            align:
            <input
              id="align"
              type="radio"
              checked={align === 'start'}
              onChange={this.onChangeAlign}
              value="start"
            />{' '}
            start
            <input
              type="radio"
              checked={align === 'center'}
              onChange={this.onChangeAlign}
              value="center"
            />{' '}
            center
            <input
              type="radio"
              checked={align === 'end'}
              onChange={this.onChangeAlign}
              value="end"
            />{' '}
            end
          </label>
          <label htmlFor="behavior">
            behavior:
            <input
              id="behavior"
              type="radio"
              checked={behavior === 'auto'}
              onChange={this.onChangeBehavior}
              value="auto"
            />{' '}
            auto
            <input
              id="behavior"
              type="radio"
              checked={behavior === 'smooth'}
              onChange={this.onChangeBehavior}
              value="smooth"
            />{' '}
            smooth
          </label>
          <button
            type="button"
            onClick={() => {
              this.virtuosoRef.current.scrollToIndex({
                index,
                align,
                behavior,
              });
            }}
          >
            scroll to index
          </button>
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

export const AddRemoveExample: Story = {
  name: 'Programmly scroll',
  render: () => <App />,
};

export default meta;
