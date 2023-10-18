/* eslint-disable react/prop-types */
// eslint-disable-next-line import/no-import-module-exports
import React from 'react';

// eslint-disable-next-line global-require
const reactVirtualized = { ...require('react-virtualized') };

function MockAutoSizer(props) {
  return <div>
    {props.children({
      height: 99999,
      width: 200,
    })}
  </div>
}

reactVirtualized.AutoSizer = MockAutoSizer;

module.exports = reactVirtualized;
