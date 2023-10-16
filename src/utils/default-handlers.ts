import { ReactElement } from 'react';
import { TGetNodeKey, SearchData, TreeItem, NumberOrStringArray } from '../models';

export const defaultGetNodeKey: TGetNodeKey<any> = ({ treeIndex }) => treeIndex;

// Cheap hack to get the text of a react object
function getReactElementText(parent: string | null | ReactElement) {
  if (typeof parent === 'string') {
    return parent;
  }

  if (
    parent === null ||
    typeof parent !== 'object' ||
    !parent.props ||
    !parent.props.children ||
    (typeof parent.props.children !== 'string' && typeof parent.props.children !== 'object')
  ) {
    return '';
  }

  if (typeof parent.props.children === 'string') {
    return parent.props.children;
  }

  return parent.props.children.map((child) => getReactElementText(child)).join('');
}

// Search for a query string inside a node property
function stringSearch<T>(
  key: string,
  searchQuery: string,
  node: TreeItem<T>,
  path: NumberOrStringArray,
  treeIndex: number
): boolean {
  if (typeof node[key] === 'function') {
    // Search within text after calling its function to generate the text
    return String((node[key] as Function)({ node, path, treeIndex })).indexOf(searchQuery) > -1;
  }
  if (typeof node[key] === 'object') {
    // Search within text inside react elements
    return getReactElementText(node[key] as ReactElement).indexOf(searchQuery) > -1;
  }

  // Search within string
  return Boolean(node[key]) && String(node[key]).indexOf(searchQuery) > -1;
}

export function defaultSearchMethod<T>({ node, path, treeIndex, searchQuery }: SearchData<T>) {
  return (
    stringSearch<T>('title', searchQuery, node, path, treeIndex) ||
    stringSearch<T>('subtitle', searchQuery, node, path, treeIndex)
  );
}
