// eslint-disable-next-line import/no-import-module-exports
import React from 'react';

module.exports = function withScrolling(Component) {
  return (props) => {
    const ref = React.createRef();

    const {
      // not passing down these props
      strengthMultiplier,
      verticalStrength,
      horizontalStrength,
      onScrollChange,

      ...other
    } = props


    return <Component ref={ref} {...other} />;
  };
};
module.exports.createVerticalStrength = () => {};
module.exports.createHorizontalStrength = () => {};
