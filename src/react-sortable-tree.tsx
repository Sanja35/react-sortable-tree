import withScrolling, {
  createHorizontalStrength,
  createVerticalStrength,
} from '@nosferatu500/react-dnd-scrollzone';
import isEqual from 'lodash.isequal';
import React, { Component } from 'react';
import { DndComponentClass, DndContext, DndProvider } from 'react-dnd';
import { Unsubscribe } from 'dnd-core';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AutoSizer, List, ListProps } from 'react-virtualized';
import 'react-virtualized/styles.css';
import NodeRendererDefault from './node-renderer-default';
import PlaceholderRendererDefault from './placeholder-renderer-default';
import './react-sortable-tree.css';
import TreeNode from './tree-node';
import TreePlaceholder from './tree-placeholder';
import classnames from './utils/classnames';
import { defaultGetNodeKey, defaultSearchMethod } from './utils/default-handlers';
import DndManager from './utils/dnd-manager';
import { slideRows } from './utils/generic-utils';
import {
  memoizedGetDescendantCount,
  memoizedGetFlatDataFromTree,
  memoizedInsertNode,
} from './utils/memoized-tree-data-utils';
import {
  IWalkCallbackParams,
  changeNodeAtPath,
  find,
  insertNode,
  removeNode,
  toggleExpandedForAll,
  walk,
} from './utils/tree-data-utils';
import {
  ThemeProps,
  TreeIndex,
  TreeItem,
  NodeData,
  FlatDataItem,
  ReactSortableTreeProps,
  ReactSortableTreeBaseProps,
  NumberOrStringArray,
  NodeRendererProps,
} from './models';

type ReactSortableTreeDefaultProps = Required<
  Pick<ReactSortableTreeBaseProps, 'theme' | 'getNodeKey' | 'onVisibilityToggle' | 'onMoveNode'>
>;

let treeIdCounter = 1;

const overridableDefaults = {
  nodeContentRenderer: NodeRendererDefault,
  placeholderRenderer: PlaceholderRendererDefault,
  rowHeight: 62,
  scaffoldBlockPxWidth: 44,
  slideRegionSize: 100,
  treeNodeRenderer: TreeNode,
};

function mergeTheme<T>(
  props: ReactSortableTreeBaseProps<T> & ReactSortableTreeDefaultProps
): ReactSortableTreeBaseProps<T> & ThemeProps<T> & typeof overridableDefaults {
  const merged = {
    ...props,
    style: { ...props.theme.style, ...props.style },
    innerStyle: { ...props.theme.innerStyle, ...props.innerStyle },
    reactVirtualizedListProps: {
      ...props.theme.reactVirtualizedListProps,
      ...props.reactVirtualizedListProps,
    },
  };

  (Object.keys(overridableDefaults) as (keyof typeof overridableDefaults)[]).forEach((propKey) => {
    // If prop has been specified, do not change it
    // If prop is specified in theme, use the theme setting
    // If all else fails, fall back to the default
    if (props[propKey] === null) {
      merged[propKey] =
        typeof props.theme[propKey] !== 'undefined'
          ? props.theme[propKey]
          : overridableDefaults[propKey];
    }
  });

  return merged as ReactSortableTreeBaseProps<T> & ThemeProps<T> & typeof overridableDefaults;
}

interface ReactSortableTreeState<T = {}> {
  draggingTreeData: TreeItem<T>[] | null;
  draggedNode: TreeItem<T> | null;
  draggedMinimumTreeIndex: number | null;
  draggedDepth: number | null;
  searchMatches: Array<NodeData<T>>;
  searchFocusTreeIndex: number | null;
  dragging: boolean;

  // props that need to be used in gDSFP or static functions will be stored here
  instanceProps: {
    treeData: TreeItem<T>[];
    ignoreOneTreeUpdate: boolean;
    searchQuery: string | any | undefined;
    searchFocusOffset: number | null | undefined;
  };
}

export class ReactSortableTree<T> extends Component<
  ReactSortableTreeBaseProps<T> & ReactSortableTreeDefaultProps,
  ReactSortableTreeState<T>
> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps: Partial<ReactSortableTreeProps> & {
    treeNodeRenderer: React.ReactElement;
  } = {
    canDrag: true,
    canDrop: null,
    canNodeHaveChildren: () => true,
    className: '',
    dndType: null,
    generateNodeProps: null,
    getNodeKey: defaultGetNodeKey,
    innerStyle: {},
    isVirtualized: true,
    maxDepth: null,
    treeNodeRenderer: null,
    nodeContentRenderer: null,
    onMoveNode: () => {},
    onVisibilityToggle: () => {},
    placeholderRenderer: null,
    reactVirtualizedListProps: {},
    rowHeight: null,
    scaffoldBlockPxWidth: null,
    searchFinishCallback: null,
    searchFocusOffset: null,
    searchMethod: null,
    searchQuery: null,
    shouldCopyOnOutsideDrop: false,
    slideRegionSize: null,
    style: {},
    theme: {},
    onDragStateChanged: () => {},
    onlyExpandSearchedNodes: false,
    rowDirection: 'ltr',
  };

  treeId: string;

  // eslint-disable-next-line react/no-unused-class-component-methods
  dndType: string;

  dndManager: DndManager<T>;

  // eslint-disable-next-line react/no-unused-class-component-methods
  scrollTop: number;

  treeNodeRenderer: DndComponentClass<any, any>;

  nodeContentRenderer: DndComponentClass<any, any>;

  treePlaceholderRenderer: DndComponentClass<any, any>;

  clearMonitorSubscription: Unsubscribe;

  scrollZoneVirtualList: React.FC<ListProps>;

  vStrength: ReturnType<typeof createVerticalStrength>;

  hStrength: ReturnType<typeof createHorizontalStrength>;

  constructor(props: ReactSortableTreeBaseProps<T> & ReactSortableTreeDefaultProps) {
    super(props);

    const { dndType, nodeContentRenderer, treeNodeRenderer, isVirtualized, slideRegionSize } =
      mergeTheme(props);

    this.dndManager = new DndManager(this);

    // Wrapping classes for use with react-dnd
    this.treeId = `rst__${treeIdCounter}`;
    treeIdCounter += 1;
    // eslint-disable-next-line react/no-unused-class-component-methods
    this.dndType = dndType || this.treeId;
    this.nodeContentRenderer = this.dndManager.wrapSource(nodeContentRenderer);
    this.treePlaceholderRenderer = this.dndManager.wrapPlaceholder(TreePlaceholder);
    this.treeNodeRenderer = this.dndManager.wrapTarget(treeNodeRenderer);

    // Prepare scroll-on-drag options for this list
    if (isVirtualized) {
      this.scrollZoneVirtualList = withScrolling(List);
      this.vStrength = createVerticalStrength(slideRegionSize);
      this.hStrength = createHorizontalStrength(slideRegionSize);
    }

    this.state = {
      draggingTreeData: null,
      draggedNode: null,
      draggedMinimumTreeIndex: null,
      draggedDepth: null,
      searchMatches: [],
      searchFocusTreeIndex: null,
      dragging: false,

      // props that need to be used in gDSFP or static functions will be stored here
      instanceProps: {
        treeData: [],
        ignoreOneTreeUpdate: false,
        searchQuery: null,
        searchFocusOffset: null,
      },
    };

    this.toggleChildrenVisibility = this.toggleChildrenVisibility.bind(this);
    this.moveNode = this.moveNode.bind(this);
    this.startDrag = this.startDrag.bind(this);
    this.dragHover = this.dragHover.bind(this);
    this.endDrag = this.endDrag.bind(this);
    this.drop = this.drop.bind(this);
    this.handleDndMonitorChange = this.handleDndMonitorChange.bind(this);
  }

  componentDidMount() {
    ReactSortableTree.loadLazyChildren(this.props, this.state);
    const stateUpdate = ReactSortableTree.search(this.props, this.state, true, true, false);
    this.setState(stateUpdate);

    // Hook into react-dnd state changes to detect when the drag ends
    // TODO: This is very brittle, so it needs to be replaced if react-dnd
    // offers a more official way to detect when a drag ends
    this.clearMonitorSubscription = this.props.dragDropManager
      .getMonitor()
      .subscribeToStateChange(this.handleDndMonitorChange);
  }

  static getDerivedStateFromProps<T>(
    nextProps: ReactSortableTreeBaseProps<T> & ReactSortableTreeDefaultProps,
    prevState: ReactSortableTreeState<T>
  ) {
    const { instanceProps } = prevState;
    // @ts-ignore
    const newState: ReactSortableTreeState<T> = {};

    const isTreeDataEqual = isEqual(instanceProps.treeData, nextProps.treeData);

    // make sure we have the most recent version of treeData
    instanceProps.treeData = nextProps.treeData;

    if (!isTreeDataEqual) {
      if (instanceProps.ignoreOneTreeUpdate) {
        instanceProps.ignoreOneTreeUpdate = false;
      } else {
        newState.searchFocusTreeIndex = null;
        ReactSortableTree.loadLazyChildren(nextProps, prevState);
        Object.assign(
          newState,
          ReactSortableTree.search(nextProps, prevState, false, false, false)
        );
      }

      newState.draggingTreeData = null;
      newState.draggedNode = null;
      newState.draggedMinimumTreeIndex = null;
      newState.draggedDepth = null;
      newState.dragging = false;
    } else if (!isEqual(instanceProps.searchQuery, nextProps.searchQuery)) {
      Object.assign(newState, ReactSortableTree.search(nextProps, prevState, true, true, false));
    } else if (instanceProps.searchFocusOffset !== nextProps.searchFocusOffset) {
      Object.assign(newState, ReactSortableTree.search(nextProps, prevState, true, true, true));
    }

    instanceProps.searchQuery = nextProps.searchQuery;
    instanceProps.searchFocusOffset = nextProps.searchFocusOffset;
    newState.instanceProps = { ...instanceProps, ...newState.instanceProps };

    return newState;
  }

  // listen to dragging
  componentDidUpdate(
    prevProps: ReactSortableTreeBaseProps<T> & ReactSortableTreeDefaultProps,
    prevState: ReactSortableTreeState<T>
  ) {
    // if it is not the same then call the onDragStateChanged
    if (this.state.dragging !== prevState.dragging) {
      if (this.props.onDragStateChanged) {
        this.props.onDragStateChanged({
          isDragging: this.state.dragging,
          draggedNode: this.state.draggedNode,
        });
      }
    }
  }

  componentWillUnmount() {
    this.clearMonitorSubscription();
  }

  getRows(treeData: TreeItem<T>[]) {
    return memoizedGetFlatDataFromTree({
      ignoreCollapsed: true,
      getNodeKey: this.props.getNodeKey,
      treeData,
    });
  }

  handleDndMonitorChange() {
    const monitor = this.props.dragDropManager.getMonitor();
    // If the drag ends and the tree is still in a mid-drag state,
    // it means that the drag was canceled or the dragSource dropped
    // elsewhere, and we should reset the state of this tree
    if (!monitor.isDragging() && this.state.draggingTreeData) {
      setTimeout(() => {
        this.endDrag();
      });
    }
  }

  toggleChildrenVisibility({
    node: targetNode,
    path,
  }: {
    node: TreeItem<T>;
    path: NumberOrStringArray;
  }) {
    const { instanceProps } = this.state;

    const treeData = changeNodeAtPath({
      treeData: instanceProps.treeData,
      path,
      newNode: ({ node }) => ({ ...node, expanded: !node.expanded }),
      getNodeKey: this.props.getNodeKey,
    });

    this.props.onChange(treeData);

    this.props.onVisibilityToggle({
      treeData,
      node: targetNode,
      expanded: !targetNode.expanded,
      path,
    });
  }

  moveNode({
    node,
    path: prevPath,
    treeIndex: prevTreeIndex,
    depth,
    minimumTreeIndex,
  }: {
    node: TreeItem<T>;
    path: NumberOrStringArray;
    treeIndex: number;
    depth: number;
    minimumTreeIndex: number;
  }) {
    const {
      treeData,
      treeIndex,
      path,
      parentNode: nextParentNode,
    } = insertNode({
      treeData: this.state.draggingTreeData,
      newNode: node,
      depth,
      minimumTreeIndex,
      expandParent: true,
      getNodeKey: this.props.getNodeKey,
    });

    this.props.onChange(treeData);

    this.props.onMoveNode({
      treeData,
      node,
      treeIndex,
      path,
      nextPath: path,
      nextTreeIndex: treeIndex,
      prevPath,
      prevTreeIndex,
      nextParentNode,
    });
  }

  // returns the new state after search
  static search<T>(
    props: ReactSortableTreeProps<T> & ReactSortableTreeDefaultProps,
    state: ReactSortableTreeState<T>,
    seekIndex: boolean,
    expand: boolean,
    singleSearch: boolean
  ): { searchMatches: NodeData<T>[] } {
    const {
      onChange,
      getNodeKey,
      searchFinishCallback,
      searchQuery,
      searchMethod,
      searchFocusOffset,
      onlyExpandSearchedNodes,
    } = props;

    const { instanceProps } = state;

    // Skip search if no conditions are specified
    if (!searchQuery && !searchMethod) {
      if (searchFinishCallback) {
        searchFinishCallback([]);
      }

      return { searchMatches: [] };
    }

    const newState: ReactSortableTreeState<T> = { ...state };

    // if onlyExpandSearchedNodes collapse the tree and search
    const { treeData: expandedTreeData, matches: searchMatches } = find({
      getNodeKey,
      treeData: onlyExpandSearchedNodes
        ? toggleExpandedForAll({
            treeData: instanceProps.treeData,
            expanded: false,
          })
        : instanceProps.treeData,
      searchQuery,
      searchMethod: searchMethod || defaultSearchMethod,
      searchFocusOffset,
      expandAllMatchPaths: expand && !singleSearch,
      expandFocusMatchPaths: !!expand,
    });

    // Update the tree with data leaving all paths leading to matching nodes open
    if (expand) {
      newState.instanceProps.ignoreOneTreeUpdate = true; // Prevents infinite loop
      onChange(expandedTreeData);
    }

    if (searchFinishCallback) {
      searchFinishCallback(searchMatches);
    }

    let searchFocusTreeIndex: number | null = null;
    if (seekIndex && searchFocusOffset !== null && searchFocusOffset < searchMatches.length) {
      searchFocusTreeIndex = searchMatches[searchFocusOffset].treeIndex;
    }

    newState.searchMatches = searchMatches;
    newState.searchFocusTreeIndex = searchFocusTreeIndex;

    return newState;
  }

  startDrag({ path }: { path: NumberOrStringArray }) {
    this.setState((prevState) => {
      const {
        treeData: draggingTreeData,
        node: draggedNode,
        treeIndex: draggedMinimumTreeIndex,
      } = removeNode({
        treeData: prevState.instanceProps.treeData,
        path,
        getNodeKey: this.props.getNodeKey,
      });

      return {
        draggingTreeData,
        draggedNode,
        draggedDepth: path.length - 1,
        draggedMinimumTreeIndex,
        dragging: true,
      };
    });
  }

  dragHover({
    node: draggedNode,
    depth: draggedDepth,
    minimumTreeIndex: draggedMinimumTreeIndex,
  }: {
    node: TreeItem<T>;
    depth: number;
    minimumTreeIndex: number;
  }) {
    // Ignore this hover if it is at the same position as the last hover
    if (
      this.state.draggedDepth === draggedDepth &&
      this.state.draggedMinimumTreeIndex === draggedMinimumTreeIndex
    ) {
      return;
    }

    this.setState(({ draggingTreeData, instanceProps }) => {
      // Fall back to the tree data if something is being dragged in from
      //  an external element
      const newDraggingTreeData = draggingTreeData || instanceProps.treeData;

      const addedResult = memoizedInsertNode({
        treeData: newDraggingTreeData,
        newNode: draggedNode,
        depth: draggedDepth,
        minimumTreeIndex: draggedMinimumTreeIndex,
        expandParent: true,
        getNodeKey: this.props.getNodeKey,
      });

      const rows = this.getRows(addedResult.treeData);
      const expandedParentPath = rows[addedResult.treeIndex].path;

      return {
        draggedNode,
        draggedDepth,
        draggedMinimumTreeIndex,
        draggingTreeData: changeNodeAtPath({
          treeData: newDraggingTreeData,
          path: expandedParentPath.slice(0, -1),
          newNode: ({ node }) => ({ ...node, expanded: true }),
          getNodeKey: this.props.getNodeKey,
        }),
        // reset the scroll focus so it doesn't jump back
        // to a search result while dragging
        searchFocusTreeIndex: null,
        dragging: true,
      };
    });
  }

  endDrag(dropResult?: NodeData<T> & { treeId: string }) {
    const { instanceProps } = this.state;

    const resetTree = () =>
      this.setState({
        draggingTreeData: null,
        draggedNode: null,
        draggedMinimumTreeIndex: null,
        draggedDepth: null,
        dragging: false,
      });

    // Drop was cancelled
    if (!dropResult) {
      resetTree();
    } else if (dropResult.treeId !== this.treeId) {
      // The node was dropped in an external drop target or tree
      const { node, path, treeIndex } = dropResult;
      let shouldCopy = this.props.shouldCopyOnOutsideDrop;
      if (typeof shouldCopy === 'function') {
        shouldCopy = shouldCopy({
          node,
          prevTreeIndex: treeIndex,
          prevPath: path,
        });
      }

      let treeData = this.state.draggingTreeData
        ? this.state.draggingTreeData
        : instanceProps.treeData;

      // If copying is enabled, a drop outside leaves behind a copy in the
      //  source tree
      if (shouldCopy) {
        treeData = changeNodeAtPath({
          treeData: instanceProps.treeData, // use treeData unaltered by the drag operation
          path,
          newNode: ({ node: copyNode }) => ({ ...copyNode }), // create a shallow copy of the node
          getNodeKey: this.props.getNodeKey,
        });
      }

      this.props.onChange(treeData);

      this.props.onMoveNode({
        treeData,
        node,
        treeIndex: null,
        path: null,
        nextPath: null,
        nextTreeIndex: null,
        prevPath: path,
        prevTreeIndex: treeIndex,
      });
    }
  }

  drop(dropResult) {
    this.moveNode(dropResult);
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  canNodeHaveChildren(node: TreeItem<T>) {
    const { canNodeHaveChildren } = this.props;
    if (canNodeHaveChildren) {
      return canNodeHaveChildren(node);
    }
    return true;
  }

  // Load any children in the tree that are given by a function
  // calls the onChange callback on the new treeData
  static loadLazyChildren<T>(
    props: ReactSortableTreeBaseProps<T> & ReactSortableTreeDefaultProps,
    state: ReactSortableTreeState<T>
  ) {
    const { instanceProps } = state;

    walk({
      treeData: instanceProps.treeData,
      getNodeKey: props.getNodeKey,
      callback: ({ node, path, lowerSiblingCounts, treeIndex }) => {
        // If the node has children defined by a function, and is either expanded
        //  or set to load even before expansion, run the function.
        if (
          node.children &&
          typeof node.children === 'function' &&
          (node.expanded || props.loadCollapsedLazyChildren)
        ) {
          // Call the children fetching function
          // @ts-ignore
          node.children({
            node,
            path,
            lowerSiblingCounts,
            treeIndex,

            // Provide a helper to append the new data when it is received
            done: (childrenArray) =>
              props.onChange(
                changeNodeAtPath({
                  treeData: instanceProps.treeData,
                  path,
                  newNode: ({ node: oldNode }) =>
                    // Only replace the old node if it's the one we set off to find children
                    //  for in the first place
                    oldNode === node
                      ? {
                          ...oldNode,
                          children: childrenArray,
                        }
                      : oldNode,
                  getNodeKey: props.getNodeKey,
                })
              ),
          });
        }
      },
    });
  }

  renderRow(
    row: FlatDataItem<T> & TreeIndex,
    {
      listIndex,
      style,
      getPrevRow,
      matchKeys,
      swapFrom,
      swapDepth,
      swapLength,
    }: Pick<
      NodeRendererProps<T>,
      'listIndex' | 'style' | 'swapFrom' | 'swapDepth' | 'swapLength'
    > & { getPrevRow: () => IWalkCallbackParams<T> | null; matchKeys: Record<string, number> }
  ) {
    const { node, parentNode, path, lowerSiblingCounts, treeIndex } = row;

    const { canDrag, generateNodeProps, scaffoldBlockPxWidth, searchFocusOffset, rowDirection } =
      mergeTheme<T>(this.props);
    const TreeNodeRenderer = this.treeNodeRenderer;
    const NodeContentRenderer = this.nodeContentRenderer;
    const nodeKey = path[path.length - 1];
    const isSearchMatch = nodeKey in matchKeys;
    const isSearchFocus = isSearchMatch && matchKeys[nodeKey] === searchFocusOffset;
    const callbackParams = {
      node,
      parentNode,
      path,
      lowerSiblingCounts,
      treeIndex,
      isSearchMatch,
      isSearchFocus,
    };
    const nodeProps = !generateNodeProps ? {} : generateNodeProps(callbackParams);
    const rowCanDrag = typeof canDrag !== 'function' ? canDrag : canDrag(callbackParams);

    const sharedProps = {
      treeIndex,
      scaffoldBlockPxWidth,
      node,
      path,
      treeId: this.treeId,
      rowDirection,
    };

    return (
      <TreeNodeRenderer
        style={style}
        key={nodeKey}
        listIndex={listIndex}
        getPrevRow={getPrevRow}
        lowerSiblingCounts={lowerSiblingCounts}
        swapFrom={swapFrom}
        swapLength={swapLength}
        swapDepth={swapDepth}
        {...sharedProps}
      >
        <NodeContentRenderer
          parentNode={parentNode}
          isSearchMatch={isSearchMatch}
          isSearchFocus={isSearchFocus}
          canDrag={rowCanDrag}
          toggleChildrenVisibility={this.toggleChildrenVisibility}
          {...sharedProps}
          {...nodeProps}
        />
      </TreeNodeRenderer>
    );
  }

  render() {
    const {
      dragDropManager,
      style,
      className,
      innerStyle,
      rowHeight,
      isVirtualized,
      placeholderRenderer,
      reactVirtualizedListProps,
      getNodeKey,
      rowDirection,
    } = mergeTheme(this.props);
    const {
      searchMatches,
      searchFocusTreeIndex,
      draggedNode,
      draggedDepth,
      draggedMinimumTreeIndex,
      instanceProps,
    } = this.state;

    const treeData = this.state.draggingTreeData || instanceProps.treeData;
    const rowDirectionClass = rowDirection === 'rtl' ? 'rst__rtl' : null;

    let rows: IWalkCallbackParams<T>[];
    let swapFrom: number;
    let swapLength: number;
    if (draggedNode && draggedMinimumTreeIndex !== null) {
      const addedResult = memoizedInsertNode({
        treeData,
        newNode: draggedNode,
        depth: draggedDepth,
        minimumTreeIndex: draggedMinimumTreeIndex,
        expandParent: true,
        getNodeKey,
      });

      const swapTo = draggedMinimumTreeIndex;
      swapFrom = addedResult.treeIndex;
      swapLength = 1 + memoizedGetDescendantCount({ node: draggedNode });
      rows = slideRows(this.getRows(addedResult.treeData), swapFrom, swapTo, swapLength);
    } else {
      rows = this.getRows(treeData);
    }

    // Get indices for rows that match the search conditions
    const matchKeys: Record<string, number> = {};
    searchMatches.forEach(({ path }, i) => {
      matchKeys[path[path.length - 1]] = i;
    });

    // Seek to the focused search result if there is one specified
    const scrollToInfo =
      searchFocusTreeIndex !== null ? { scrollToIndex: searchFocusTreeIndex } : {};

    let containerStyle = style;
    let list: JSX.Element | JSX.Element[];
    if (rows.length < 1) {
      const Placeholder = this.treePlaceholderRenderer;
      const PlaceholderContent = placeholderRenderer;
      list = (
        <Placeholder treeId={this.treeId} drop={this.drop}>
          {(injectProps) => <PlaceholderContent {...injectProps} />}
        </Placeholder>
      );
    } else if (isVirtualized) {
      containerStyle = { height: '100%', ...containerStyle };

      const ScrollZoneVirtualList = this.scrollZoneVirtualList;
      // Render list with react-virtualized
      list = (
        <AutoSizer>
          {({ height, width }) => (
            <ScrollZoneVirtualList
              {...scrollToInfo}
              dragDropManager={dragDropManager}
              verticalStrength={this.vStrength}
              horizontalStrength={this.hStrength}
              strengthMultiplier={30}
              scrollToAlignment="start"
              className="rst__virtualScrollOverride"
              width={width}
              onScroll={({ scrollTop }) => {
                // eslint-disable-next-line react/no-unused-class-component-methods
                this.scrollTop = scrollTop;
              }}
              height={height}
              style={innerStyle}
              rowCount={rows.length}
              estimatedRowSize={typeof rowHeight !== 'function' ? rowHeight : undefined}
              rowHeight={
                typeof rowHeight !== 'function'
                  ? rowHeight
                  : ({ index }) =>
                      rowHeight({
                        index,
                        treeIndex: index,
                        node: rows[index].node,
                        path: rows[index].path,
                      })
              }
              rowRenderer={({ index, style: rowStyle }) =>
                this.renderRow(rows[index], {
                  listIndex: index,
                  style: rowStyle,
                  getPrevRow: () => rows[index - 1] || null,
                  matchKeys,
                  swapFrom,
                  swapDepth: draggedDepth,
                  swapLength,
                })
              }
              {...reactVirtualizedListProps}
            />
          )}
        </AutoSizer>
      );
    } else {
      // Render list without react-virtualized
      list = rows.map((row, index) =>
        this.renderRow(row, {
          listIndex: index,
          style: {
            height:
              typeof rowHeight !== 'function'
                ? rowHeight
                : rowHeight({
                    index,
                    treeIndex: index,
                    node: row.node,
                    path: row.path,
                  }),
          },
          getPrevRow: () => rows[index - 1] || null,
          matchKeys,
          swapFrom,
          swapDepth: draggedDepth,
          swapLength,
        })
      );
    }

    return (
      <div className={classnames('rst__tree', className, rowDirectionClass)} style={containerStyle}>
        {list}
      </div>
    );
  }
}

function SortableTreeWithoutDndContext(props: ReactSortableTreeProps) {
  return (
    <DndContext.Consumer>
      {({ dragDropManager }) =>
        dragDropManager === undefined ? null : (
          <ReactSortableTree {...props} dragDropManager={dragDropManager} />
        )
      }
    </DndContext.Consumer>
  );
}

function SortableTree(props: ReactSortableTreeProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <SortableTreeWithoutDndContext {...props} />
    </DndProvider>
  );
}

// Export the tree component without the react-dnd DragDropContext,
// for when component is used with other components using react-dnd.
// see: https://github.com/gaearon/react-dnd/issues/186
export { SortableTreeWithoutDndContext };

export default SortableTree;
