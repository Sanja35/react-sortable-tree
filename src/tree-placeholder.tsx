import React, { ReactNode } from 'react';
import { ConnectDropTarget } from 'react-dnd';

interface ITreePlaceholderProps {
  children: (injectProps: { isOver: boolean; canDrop: boolean; draggedNode: unknown }) => ReactNode;
  connectDropTarget: ConnectDropTarget;
  isOver: boolean;
  canDrop?: boolean;
  draggedNode?: unknown;
  treeId: string;
  drop: () => void;
}

function TreePlaceholder({
  children,
  connectDropTarget,
  // treeId,
  // drop,
  canDrop = false,
  draggedNode = null,
  isOver,
}: ITreePlaceholderProps) {
  return connectDropTarget(<div>{children({ canDrop, draggedNode, isOver })}</div>);
}

export default TreePlaceholder;
