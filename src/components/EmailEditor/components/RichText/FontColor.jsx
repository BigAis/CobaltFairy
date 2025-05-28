import { useState, useEffect } from "react";
import { Popover } from "antd";
import { ChromePicker } from "react-color";

const FontColor = ({ modifyText, setTextContent }) => {
  // Parse initial color (default black)
  const [currentColor, setCurrentColor] = useState({ 
    hex: "#000000", 
    rgb: { r: 0, g: 0, b: 0, a: 1 } 
  });
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
  };

  const handleColorChange = (color) => {
    setCurrentColor(color);
    
    // Use rgba when opacity is less than 1
    if (color.rgb.a < 1) {
      const { r, g, b, a } = color.rgb;
      modifyText("ForeColor", false, `rgba(${r}, ${g}, ${b}, ${a})`);
    } else {
      modifyText("ForeColor", false, color.hex);
    }
    
    setTextContent();
  };

  // Convert rgba to CSS string for background display
  const getRgbaString = () => {
    const { r, g, b, a } = currentColor.rgb;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  return (
    <Popover
      zIndex={1070}
      content={
        <div className="select-none">
          <ChromePicker
            color={currentColor.rgb}
            disableAlpha={false}
            onChange={handleColorChange}
          />
        </div>
      }
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
    >
      <button className="rich_text-font_color">
        <div 
          className="rich_text-font_color-content" 
          style={{ background: getRgbaString() }}
        ></div>
      </button>
    </Popover>
  );
};

export default FontColor;