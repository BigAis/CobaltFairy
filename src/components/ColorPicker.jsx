import React, { useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';
import classNames from 'classnames'
import PropTypes from 'prop-types'

import chroma from 'chroma-js';
import './ColorPicker.scss';

function ColorPicker({ initColorHex, initColorAlpha, onChange, className, ...props }) {

const computedClassName = classNames('color-picker-container' , className)
    


  const [color, setColor] = useState('#FFA600');
  const [opacity, setOpacity] = useState(1);
  const [showPicker, setShowPicker] = useState(false);

  const handleChangeComplete = (color) => {
    setColor(color.hex);
    setOpacity(color.rgb.a);
    onChange(color)
  };

  useEffect(()=>{
    if(initColorHex && initColorHex.length>0) setColor(initColorHex);
    if(initColorAlpha) setOpacity(initColorAlpha);
  },[])


  return (
      <div className={computedClassName} onClick={() => setShowPicker(!showPicker)}>
        <div className="color-display">
        <div className="color-preview" style={{ backgroundColor: chroma(color).alpha(opacity).css() }}></div>
          <span className="hex-code">{chroma(color).alpha(opacity).hex()}</span>
      </div>
        <div className="opacity-display">
          <span>{Math.round(opacity * 100)}%</span>
        </div>
      {showPicker && (
        <SketchPicker color={{ hex: color, a: opacity }} onChangeComplete={handleChangeComplete}  />
      )}
    </div>
  );
}

ColorPicker.propTypes = {
    initColorHex: PropTypes.string,
    initColorAlpha: PropTypes.number,
    onChange: PropTypes.func,
    className: PropTypes.string,
}


export default ColorPicker;
