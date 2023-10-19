import * as React from 'react';
import { ListProps, Index } from 'react-virtualized';
import { ConnectDragSource, ConnectDragPreview, ConnectDropTarget } from 'react-dnd';
import type { DragDropManager } from 'dnd-core';

// export * from './utils/tree-data-utils';
// export * from './utils/default-handlers';

export interface GetTreeItemChildren<T = {}> {
  done: (children: Array<TreeItem<T>>) => void;
  node: TreeItem<T>;
  path: NumberOrStringArray;
  lowerSiblingCounts: number[];
  treeIndex: number;
}

export type TreeItem<T = {}> = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  expanded?: boolean;
  children?: TreeItem<T>[];
  [key: string]: unknown;
};

export interface TreeNode<T = {}> {
  node: TreeItem<T>;
}

export interface TreePath {
  path: NumberOrStringArray;
}

export interface TreeIndex {
  treeIndex: number;
}

export interface FullTree<T = {}> {
  treeData: Array<TreeItem<T>>;
}

export interface NodeData<T = {}> extends TreeNode<T>, TreePath, TreeIndex {}

export interface FlatDataItem<T = {}> extends TreeNode<T>, TreePath {
  lowerSiblingCounts: number[];
  parentNode: TreeItem<T>;
}

export interface SearchData<T = {}> extends NodeData<T> {
  searchQuery: any;
}

export interface ExtendedNodeData<T = {}> extends NodeData<T> {
  parentNode: TreeItem<T>;
  lowerSiblingCounts: number[];
  isSearchMatch: boolean;
  isSearchFocus: boolean;
}

export interface OnVisibilityToggleData<T = {}> extends FullTree<T>, TreeNode<T>, TreePath {
  expanded: boolean;
}

export interface OnDragStateChangedData<T = {}> {
  isDragging: boolean;
  draggedNode: TreeItem<T> | null;
}

interface PreviousAndNextLocation {
  prevTreeIndex: number;
  prevPath: NumberOrStringArray;
  nextTreeIndex: number;
  nextPath: NumberOrStringArray;
}

export interface OnDragPreviousAndNextLocation<T = {}> extends PreviousAndNextLocation {
  prevParent: TreeItem<T> | null;
  nextParent: TreeItem<T> | null;
}

export interface ShouldCopyData<T = {}> {
  node: TreeItem<T>; // TreeNode<T>;
  prevPath: NumberOrStringArray;
  prevTreeIndex: number;
}

export interface OnMovePreviousAndNextLocation<T = {}> extends PreviousAndNextLocation {
  nextParentNode?: TreeItem<T> | null;
}

export type NodeRenderer<T = {}> = React.ComponentType<NodeRendererProps<T>>;

export interface NodeRendererProps<T = {}> {
  node: TreeItem<T>;
  path: NumberOrStringArray;
  treeIndex: number;
  isSearchMatch: boolean;
  isSearchFocus: boolean;
  canDrag: boolean;
  scaffoldBlockPxWidth: number;
  toggleChildrenVisibility?(data: NodeData<T>): void;
  buttons?: JSX.Element[] | undefined;
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
  title?: ((data: NodeData<T>) => JSX.Element | JSX.Element) | undefined;
  subtitle?: ((data: NodeData<T>) => JSX.Element | JSX.Element) | undefined;
  icons?: JSX.Element[] | undefined;
  lowerSiblingCounts: number[];
  swapDepth?: number | undefined;
  swapFrom?: number | undefined;
  swapLength?: number | undefined;
  listIndex: number;
  treeId: string;
  rowDirection?: 'ltr' | 'rtl' | undefined;

  connectDragPreview: ConnectDragPreview;
  connectDragSource: ConnectDragSource;
  parentNode?: TreeItem<T> | undefined;
  startDrag: any;
  endDrag: any;
  isDragging: boolean;
  didDrop: boolean;
  draggedNode?: TreeItem<T> | undefined;
  isOver: boolean;
  canDrop?: boolean | undefined;
}

export type PlaceholderRenderer<T = {}> = React.ComponentType<PlaceholderRendererProps<T>>;

export interface PlaceholderRendererProps<T = {}> {
  isOver: boolean;
  canDrop: boolean;
  draggedNode: TreeItem<T>;
}

export type NumberOrStringArray = Array<string | number>;

export type TGetNodeKey<T> = (data: TreeNode<T> & TreeIndex) => string | number;
export type TSearchMethod<T> = (data: SearchData<T>) => boolean;

export type TreeRenderer<T = {}> = React.ComponentType<TreeRendererProps<T>>;

export interface TreeRendererProps<T = {}> {
  treeIndex: number;
  treeId: string;
  swapFrom?: number | undefined;
  swapDepth?: number | undefined;
  swapLength?: number | undefined;
  scaffoldBlockPxWidth: number;
  lowerSiblingCounts: number[];
  rowDirection?: 'ltr' | 'rtl' | undefined;

  listIndex: number;
  children: JSX.Element[];
  style?: React.CSSProperties | undefined;

  // Drop target
  connectDropTarget: ConnectDropTarget;
  isOver: boolean;
  canDrop?: boolean | undefined;
  draggedNode?: TreeItem<T> | undefined;

  // used in dndManager
  getPrevRow: () => FlatDataItem | null;
  node: TreeItem<T>;
  path: NumberOrStringArray;
}

interface ThemeTreeProps<T = {}> {
  // Style applied to the container wrapping the tree (style defaults to {height: '100%'})
  style?: React.CSSProperties | undefined;
  // Style applied to the inner, scrollable container (for padding, etc.)
  innerStyle?: React.CSSProperties | undefined;
  // Custom properties to hand to the react-virtualized list
  // https://github.com/bvaughn/react-virtualized/blob/master/docs/List.md#prop-types
  reactVirtualizedListProps?: Partial<ListProps> | undefined;
  // The width of the blocks containing the lines representing the structure of the tree.
  scaffoldBlockPxWidth?: number | undefined;
  // Size in px of the region near the edges that initiates scrolling on dragover
  slideRegionSize?: number | undefined;
  // Used by react-virtualized
  // Either a fixed row height (number) or a function that returns the
  // height of a row given its index: `({ index: number }): number`
  rowHeight?: ((info: NodeData<T> & Index) => number) | number | undefined;
  // Override the default component for rendering nodes (but keep the scaffolding generator)
  // This is an advanced option for complete customization of the appearance.
  // It is best to copy the component in `node-renderer-default.js` to use as a base, and customize as needed.
  nodeContentRenderer?: NodeRenderer<T> | undefined;
  // Override the default component for rendering an empty tree
  // This is an advanced option for complete customization of the appearance.
  // It is best to copy the component in `placeholder-renderer-default.js` to use as a base,
  // and customize as needed.
  placeholderRenderer?: PlaceholderRenderer<T> | undefined;
}

export interface ThemeProps<T = {}> extends ThemeTreeProps<T> {
  treeNodeRenderer?: TreeRenderer<T> | undefined;
}

export interface ReactSortableTreeBaseProps<T = {}> extends ThemeTreeProps<T> {
  // Tree data in the following format:
  // [{title: 'main', subtitle: 'sub'}, { title: 'value2', expanded: true, children: [{ title: 'value3') }] }]
  // `title` is the primary label for the node
  // `subtitle` is a secondary label for the node
  // `expanded` shows children of the node if true, or hides them if false. Defaults to false.
  // `children` is an array of child nodes belonging to the node.
  treeData: Array<TreeItem<T>>;
  // Called whenever tree data changed.
  // Just like with React input elements, you have to update your
  // own component's data to see the changes reflected.
  onChange(treeData: TreeItem<T>[]): void;
  // Determine the unique key used to identify each node and
  // generate the `path` array passed in callbacks.
  // By default, returns the index in the tree (omitting hidden nodes).
  getNodeKey?: TGetNodeKey<T>;
  // Generate an object with additional props to be passed to the node renderer.
  // Use this for adding buttons via the `buttons` key,
  // or additional `style` / `className` settings.
  generateNodeProps?(data: ExtendedNodeData<T>): { [index: string]: any };
  // Called after node move operation.
  onMoveNode?(data: NodeData<T> & FullTree<T> & OnMovePreviousAndNextLocation<T>): void;
  // Called after children nodes collapsed or expanded.
  onVisibilityToggle?(data: OnVisibilityToggleData<T>): void;
  // Called to track between dropped and dragging
  onDragStateChanged?(data: OnDragStateChangedData<T>): void;
  // Maximum depth nodes can be inserted at. Defaults to infinite.
  maxDepth?: number | undefined;
  // rtl support
  rowDirection?: 'ltr' | 'rtl' | undefined;
  // Determine whether a node can be dragged. Set to false to disable dragging on all nodes.
  canDrag?: ((data: ExtendedNodeData) => boolean) | boolean | undefined;
  // Determine whether a node can be dropped based on its path and parents'.
  canDrop?(
    data: OnDragPreviousAndNextLocation<T> & Omit<NodeData<T>, 'path' | 'treeIndex'>
  ): boolean;
  // Determine whether a node can have children
  canNodeHaveChildren?(node: TreeItem<T>): boolean;
  theme?: ThemeProps<T> | undefined;
  // The method used to search nodes.
  // Defaults to a function that uses the `searchQuery` string to search for nodes with
  // matching `title` or `subtitle` values.
  // NOTE: Changing `searchMethod` will not update the search, but changing the `searchQuery` will.
  searchMethod?: TSearchMethod<T>;
  // Used by the `searchMethod` to highlight and scroll to matched nodes.
  // Should be a string for the default `searchMethod`, but can be anything when using a custom search.
  searchQuery?: string | any | undefined;
  // Outline the <`searchFocusOffset`>th node and scroll to it.
  searchFocusOffset?: number | undefined;
  // Specify that nodes that do not match search will be collapsed
  onlyExpandSearchedNodes?: boolean | undefined;
  // Get the nodes that match the search criteria. Used for counting total matches, etc.
  searchFinishCallback?(matches: Array<NodeData<T>>): void;
  dndType?: string | undefined;
  // When true, or a callback returning true, dropping nodes to react-dnd
  // drop targets outside of this tree will not remove them from this tree
  shouldCopyOnOutsideDrop?: boolean | ((data: ShouldCopyData<T>) => boolean) | undefined;
  // Class name for the container wrapping the tree
  className?: string | undefined;
  // Set to false to disable virtualization.
  // NOTE: Auto-scrolling while dragging, and scrolling to the `searchFocusOffset` will be disabled.
  isVirtualized?: boolean | undefined;

  dragDropManager: DragDropManager;

  // Свойство под вопросом
  loadCollapsedLazyChildren?: boolean;
}

export interface ReactSortableTreeProps<T = {}>
  extends Omit<ReactSortableTreeBaseProps<T>, 'dragDropManager'> {}

declare function SortableTree<T>(
  props: React.PropsWithChildren<ReactSortableTreeProps<T>>
): JSX.Element;

declare function SortableTreeWithoutDndContext<T>(
  props: React.PropsWithChildren<ReactSortableTreeProps<T>>
): JSX.Element;

export { SortableTree, SortableTreeWithoutDndContext };
export default SortableTree;
