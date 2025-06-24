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
  const useVerticalLayout = imageWidth >= 65;
  
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

  return (
    <div className="relative">
      {/* Container that allows proper text wrapping */}
      <div style={{
        ...contentStyles,
        position: "relative",
        width: "100%"
      }}>
        {/* Image with float styling to allow text wrapping */}
        <div 
          className="block-item image parent-about_book_v2"
          onClick={handleImageClick}
          style={{
            float: useVerticalLayout ? "none" : "left",
            width: `${imageWidth}%`,
            marginRight: useVerticalLayout ? 0 : "20px",
            marginBottom: useVerticalLayout ? "20px" : "10px",
            position: "relative"
          }}
        >
          {blockItem.src ? (
            blockItem.linkURL ? (
              <a href={blockItem.linkURL} target="_blank" rel="noopener noreferrer">
                <img 
                  src={blockItem.src} 
                  alt={blockItem.alt || ""} 
                  style={{
                    width: "100%",
                    display: "block",
                    height: imageHeight
                  }} 
                />
              </a>
            ) : (
              <img 
                src={blockItem.src} 
                alt={blockItem.alt || ""} 
                style={{
                  width: "100%",
                  display: "block",
                  height: imageHeight
                }} 
              />
            )
          ) : (
            <div className="empty-image" style={{
              width: "100%",
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
        
        {/* Text content - no separate container to allow proper wrapping */}
        <div 
          className="block-item text parent-about_book_v2"
          onClick={handleTextClick}
          style={{
            wordWrap: "break-word",
            wordBreak: "break-word",
            whiteSpace: "normal"
          }}
        >
          {isEdit ? 
            richTextElement : 
            <div style={{
              ...styles,
              wordWrap: "break-word",
              wordBreak: "break-word",
              whiteSpace: "normal"
            }} dangerouslySetInnerHTML={{ __html: blockItem.text }}></div>
          }
        </div>
      </div>
    </div>
  );
};

export default AboutBookComponentV2;