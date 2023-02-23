import React from 'react';
import classnames from './utils/classnames';
import { PlaceholderRendererProps } from './models';
import './placeholder-renderer-default.css';

// eslint-disable-next-line react/function-component-definition
const PlaceholderRendererDefault: React.FC<PlaceholderRendererProps> = ({ isOver, canDrop }) => (
  <div
    className={classnames(
      'rst__placeholder',
      canDrop && 'rst__placeholderLandingPad',
      canDrop && !isOver && 'rst__placeholderCancelPad'
    )}
  />
);

export default PlaceholderRendererDefault;
