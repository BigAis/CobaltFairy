import { useContext, useEffect, useRef } from "react";
import { GlobalContext } from "../../reducers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import RichTextLayout from "../RichText/RichTextLayout";
import { useMemo } from "react";

const AboutBookComponentV2 = (props) => {
  const { index, blockItem } = props;
  const { currentItem, previewMode, actionType, setCurrentItem } = useContext(GlobalContext);
  
  // Get the appropriate styles based on preview mode
  const contentStyles = previewMode === "desktop" ? blockItem.contentStyles?.desktop : { ...blockItem.contentStyles?.desktop, ...blockItem.contentStyles?.mobile };
  const styles = previewMode === "desktop" ? blockItem.styles.desktop : { ...blockItem.styles.desktop, ...blockItem.styles.mobile };
  
  const isEdit = currentItem && currentItem.index === index;
  const richTextElement = useMemo(() => <RichTextLayout {...props} />, [isEdit, actionType]);
  
  // Set default text if none exists
  if(!blockItem.text || blockItem.text.length < 1) {
    blockItem.text = `<strong>About the book</strong><br><br>Lorem ipsum dolor sit amet. The graphic and typographic operators know this well, in reality all the professions dealing with the universe of communication have a stable relationship with these words, but what is it? Lorem ipsum is a dummy text without any sense.`;
  }
  
  // Determine image width from the image's styles
  const getImageWidth = () => {
    // First try to get it from the image object if it exists
    if (blockItem.image && blockItem.image.styles && blockItem.image.styles.desktop && blockItem.image.styles.desktop.width) {
      const width = blockItem.image.styles.desktop.width;
      return typeof width === 'string' && width.includes('%') ? parseInt(width) : 35;
    }
    
    // Otherwise try to get it from the width property or slider value
    if (blockItem.imageWidth) {
      return typeof blockItem.imageWidth === 'number' ? blockItem.imageWidth : 35;
    }
    
    // Last resort, check the component's own styles
    if (styles && styles.width) {
      return typeof styles.width === 'string' && styles.width.includes('%') ? parseInt(styles.width) : 35;
    }
    
    // Default fallback
    return 35;
  };
  
  // Get image height if set
  const getImageHeight = () => {
    if (blockItem.image && blockItem.image.styles && blockItem.image.styles.desktop && blockItem.image.styles.desktop.height) {
      const height = blockItem.image.styles.desktop.height;
      if (typeof height === 'number') {
        return height + 'px';
      } else if (typeof height === 'string') {
        return height;
      }
    }
    return 'auto';
  };
  
  const imageWidth = getImageWidth();
  const imageHeight = getImageHeight();
  const useVerticalLayout = imageWidth >= 100;
  
  const handleImageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (blockItem.image) {
      setCurrentItem({ 
        data: blockItem.image, 
        type: "edit", 
        index: `${index}-image` 
      });
    }
  };
  
  const handleTextClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (blockItem.text) {
      setCurrentItem({ 
        data: blockItem.text, 
        type: "edit", 
        index: `${index}-text` 
      });
    }
  };
  
  // Consolidated styles for container
  const containerStyle = {
    ...contentStyles,
    overflow: "auto",
    width: "100%",
    position: "relative"
  };
  
  // Image container styles with proper float behavior
  const imageContainerStyle = {
    float: useVerticalLayout ? "none" : "left",
    width: `${imageWidth}%`,
    marginRight: useVerticalLayout ? 0 : "20px",
    marginBottom: useVerticalLayout ? "20px" : "10px",
    display: "block"
  };
  
  // Image styles
  const imageStyle = {
    width: "100%",
    display: "block",
    height: imageHeight
  };
  
  return (
    <div className="relative">
      <div style={containerStyle} className="about-book-v2-container">
        {/* Image component with float styling */}
        <div 
          className="block-item image parent-about_book_v2"
          onClick={handleImageClick}
          style={imageContainerStyle}
        >
          {blockItem.src ? (
            <img 
              src={blockItem.src} 
              alt={blockItem.alt || ""} 
              style={imageStyle} 
            />
          ) : (
            <div className="empty-image" style={{
              ...imageStyle,
              height: imageHeight !== 'auto' ? imageHeight : "150px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f0f0f0"
            }}>
              <FontAwesomeIcon icon={faImage} className="empty-image-icon" />
            </div>
          )}
        </div>
        
        {/* Text component with natural wrapping */}
        <div 
          className="block-item text parent-about_book_v2"
          onClick={handleTextClick}
        >
          {isEdit ? 
            richTextElement : 
            <div style={styles} dangerouslySetInnerHTML={{ __html: blockItem.text }}></div>
          }
        </div>
        
        {/* Clear floating elements */}
        <div style={{clear: "both"}}></div>
      </div>
    </div>
  );
};

export default AboutBookComponentV2;