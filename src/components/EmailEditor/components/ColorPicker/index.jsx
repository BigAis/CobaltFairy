import { useState, useEffect } from "react";
import { Popover } from "antd";
import { ChromePicker } from "react-color";

const ColorPicker = ({ color, setColor }) => {
  // Parse initial color, supporting various formats
  const parseColor = (inputColor) => {
    // Handle rgba strings - extract components
    if (typeof inputColor === 'string' && inputColor.startsWith('rgba')) {
      const matches = inputColor.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)/);
      if (matches) {
        const [_, r, g, b, a] = matches;
        return {
          hex: rgbToHex(parseInt(r), parseInt(g), parseInt(b)),
          rgb: { r: parseInt(r), g: parseInt(g), b: parseInt(b), a: parseFloat(a) }
        };
      }
    }
    
    // Handle hex strings
    if (typeof inputColor === 'string') {
      // Convert hex to rgb object
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(inputColor);
      if (result) {
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        return { hex: inputColor, rgb: { r, g, b, a: 1 } };
      }
      return { hex: inputColor, rgb: { r: 0, g: 0, b: 0, a: 1 } };
    }
    
    // Handle color objects
    return inputColor || { hex: "#000000", rgb: { r: 0, g: 0, b: 0, a: 1 } };
  };
  
  // Helper to convert RGB to hex
  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  // Initialize state with parsed color
  const [currentColor, setCurrentColor] = useState(() => parseColor(color));
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Update internal state when external color prop changes
  useEffect(() => {
    if (color && color !== currentColor.hex) {
      setCurrentColor(parseColor(color));
    }
  }, [color]);

  // Handle color change from ChromePicker
  const handleColorChange = (newColor) => {
    setCurrentColor(newColor);
    
    // Pass the complete color object to parent component
    // This allows access to both hex and rgba values
    setColor(newColor);
  };

  // Convert rgba to CSS string for background display
  const getRgbaString = () => {
    const { r, g, b, a } = currentColor.rgb || { r: 0, g: 0, b: 0, a: 1 };
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  return (
    <Popover
      zIndex={1070}
      content={
        <div className="select-none">
          <ChromePicker 
            color={currentColor.rgb}
            onChange={handleColorChange}
            disableAlpha={false} // Explicitly enable alpha
          />
        </div>
      }
      trigger="click"
      open={popoverOpen}
      onOpenChange={setPopoverOpen}
    >
      <button 
        className="color-picker-button" 
        style={{ background: getRgbaString() }}
      ></button>
    </Popover>
  );
};

export default ColorPicker;