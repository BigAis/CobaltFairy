import { useState, useEffect, useRef } from "react";
import { Popover } from "antd";
import { ChromePicker } from "react-color";

const FontColor = ({ modifyText, setTextContent }) => {
  // Parse initial color (default black)
  const [currentColor, setCurrentColor] = useState({ 
    hex: "#000000", 
    rgb: { r: 0, g: 0, b: 0, a: 1 } 
  });
  const [open, setOpen] = useState(false);
  
  // Store the saved selection range
  const savedSelectionRef = useRef(null);

  const handleOpenChange = (newOpen) => {
    if (newOpen) {
      // Save the current selection when opening the color picker
      saveSelection();
    } else {
      // When closing the picker, restore selection if no color was applied
      setTimeout(() => {
        restoreSelection();
      }, 100);
    }
    setOpen(newOpen);
  };

  // Save the current selection
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  // Restore the saved selection
  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
    }
  };

  const handleColorChange = (color) => {
    setCurrentColor(color);
    
    // Restore the selection before applying color
    restoreSelection();
    
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
      <button 
        className="rich_text-font_color"
        onClick={saveSelection}
      >
        <div 
          className="rich_text-font_color-content" 
          style={{ background: getRgbaString() }}
        ></div>
      </button>
    </Popover>
  );
};

export default FontColor;