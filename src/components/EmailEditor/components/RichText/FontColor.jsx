import { useState, useEffect, useRef } from "react";
import { Popover } from "antd";
import { ChromePicker } from "react-color";

// Define a component-level style tag to customize text selection appearance
const SelectionStyler = ({ color }) => {
  // Extract the color values for the selection style
  const getColorValue = () => {
    if (color?.rgb) {
      const { r, g, b, a } = color.rgb;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    return color?.hex || "#000000";
  };
  
  // Create a unique class name based on the current color
  const uniqueClassName = `custom-selection-${getColorValue().replace(/[^a-z0-9]/gi, '')}`;
  
  // Return a style element that will be injected into the DOM
  return (
    <style>
      {`
      .${uniqueClassName} *::selection {
        color: ${getColorValue()} !important;
        background-color: rgba(70, 130, 210, 0.6) !important;
      }
      
      .text-content_editable::selection {
        color: currentColor !important;
        background-color: rgba(70, 130, 210, 0.6) !important;
      }
      `}
    </style>
  );
};

const FontColor = ({ modifyText, setTextContent }) => {
  // Parse initial color (default black)
  const [currentColor, setCurrentColor] = useState({ 
    hex: "#000000", 
    rgb: { r: 0, g: 0, b: 0, a: 1 } 
  });
  const [open, setOpen] = useState(false);
  
  // Store the selection range
  const savedSelection = useRef(null);
  // Store the selected text container to apply our custom styling
  const selectedContainer = useRef(null);
  
  // Add a unique class name for the selection styling
  const uniqueClassName = `custom-selection-${currentColor.hex?.replace('#', '') || '000000'}`;
  
  // Save the current selection when opening the color picker
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      savedSelection.current = selection.getRangeAt(0).cloneRange();
      
      // Find the parent editable container to apply our selection styling
      let container = selection.anchorNode;
      while (container && !container.classList?.contains('text-content_editable')) {
        container = container.parentNode;
      }
      
      // Store the container for later use
      selectedContainer.current = container;
      
      // Add our unique class for styling selections
      if (container) {
        // Remove any existing custom selection classes
        Array.from(container.classList)
          .filter(cls => cls.startsWith('custom-selection-'))
          .forEach(cls => container.classList.remove(cls));
        
        // Add our new class
        container.classList.add(uniqueClassName);
      }
    }
  };
  
  // Restore the saved selection
  const restoreSelection = () => {
    if (savedSelection.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelection.current);
      return true;
    }
    return false;
  };

  const handleOpenChange = (newOpen) => {
    if (newOpen) {
      // Save selection when opening the color picker
      saveSelection();
    } else {
      // When closing, clean up custom classes
      if (selectedContainer.current) {
        Array.from(selectedContainer.current.classList)
          .filter(cls => cls.startsWith('custom-selection-'))
          .forEach(cls => selectedContainer.current.classList.remove(cls));
      }
    }
    setOpen(newOpen);
  };

  const handleColorChange = (color) => {
    setCurrentColor(color);
    
    // Restore selection before applying color
    if (restoreSelection()) {
      // Use rgba when opacity is less than 1
      if (color.rgb.a < 1) {
        const { r, g, b, a } = color.rgb;
        modifyText("ForeColor", false, `rgba(${r}, ${g}, ${b}, ${a})`);
      } else {
        modifyText("ForeColor", false, color.hex);
      }
      
      // Call setTextContent to update the text
      setTextContent();
      
      // Re-save the selection after applying color
      // This ensures we maintain the selection while the color picker remains open
      saveSelection();
    }
  };

  // Convert rgba to CSS string for background display
  const getRgbaString = () => {
    const { r, g, b, a } = currentColor.rgb;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  return (
    <>
      {/* Include our dynamic style element */}
      <SelectionStyler color={currentColor} />
      
      <Popover
        zIndex={1070}
        content={
          <div className="select-none">
            <ChromePicker
              color={currentColor.rgb}
              disableAlpha={false}
              onChange={handleColorChange}
              onChangeComplete={handleColorChange}
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
    </>
  );
};

export default FontColor;