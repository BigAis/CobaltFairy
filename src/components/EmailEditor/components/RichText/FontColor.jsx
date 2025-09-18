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
  // Track if we have a valid selection
  const hasSelectionRef = useRef(false);
  // Interval ref for keeping selection alive
  const selectionIntervalRef = useRef(null);

  // Effect to keep selection alive while picker is open
  useEffect(() => {
    if (open && hasSelectionRef.current) {
      // Restore selection periodically while picker is open
      selectionIntervalRef.current = setInterval(() => {
        restoreSelection();
      }, 100);
    } else {
      if (selectionIntervalRef.current) {
        clearInterval(selectionIntervalRef.current);
        selectionIntervalRef.current = null;
      }
    }

    return () => {
      if (selectionIntervalRef.current) {
        clearInterval(selectionIntervalRef.current);
        selectionIntervalRef.current = null;
      }
    };
  }, [open]);

  const handleOpenChange = (newOpen) => {
    if (newOpen) {
      // Save the current selection when opening the color picker
      saveSelection();
    } else {
      // When closing the picker, restore selection
      setTimeout(() => {
        restoreSelection();
      }, 100);
    }
    setOpen(newOpen);
  };

  // Save the current selection and detect current color
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
      hasSelectionRef.current = true;
      
      // Try to detect the current color of the selected text
      try {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
        
        if (element) {
          const computedStyle = window.getComputedStyle(element);
          const color = computedStyle.color;
          
          // Convert CSS color to our color format
          if (color && color !== 'rgb(0, 0, 0)') {
            // Parse RGB color (handles both rgb and rgba)
            const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
            if (rgbMatch) {
              const [, r, g, b, a = '1'] = rgbMatch;
              const hex = `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
              setCurrentColor({
                hex: hex,
                rgb: { r: parseInt(r), g: parseInt(g), b: parseInt(b), a: parseFloat(a) }
              });
            } else {
              // Try to parse as hex
              const hexMatch = color.match(/#([0-9a-fA-F]{6})/);
              if (hexMatch) {
                const hex = hexMatch[0];
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                setCurrentColor({
                  hex: hex,
                  rgb: { r, g, b, a: 1 }
                });
              }
            }
          }
        }
      } catch (error) {
        console.warn("Could not detect current color:", error);
      }
    } else {
      hasSelectionRef.current = false;
    }
  };

  // Restore the saved selection
  const restoreSelection = () => {
    if (savedSelectionRef.current && hasSelectionRef.current) {
      try {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      } catch (error) {
        console.warn("Could not restore selection:", error);
        hasSelectionRef.current = false;
      }
    }
  };

  // Live color change - applies color immediately as user moves cursor
  const handleColorChange = (color) => {
    setCurrentColor(color);
    
    // Only apply color if we have a valid selection
    if (hasSelectionRef.current) {
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
    }
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
        <div 
          className="select-none"
          onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
          onClick={(e) => e.preventDefault()} // Prevent focus loss
        >
          <ChromePicker
            color={currentColor.rgb}
            disableAlpha={false}
            onChange={handleColorChange}
            onChangeComplete={handleColorChange} // Also handle complete for final color
          />
        </div>
      }
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomLeft"
    >
      <button 
        className="rich_text-font_color"
        onMouseDown={(e) => {
          e.preventDefault(); // Prevent default behavior that might clear selection
          saveSelection();
        }}
        onClick={(e) => {
          e.preventDefault(); // Prevent default behavior
        }}
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