import { useContext, useEffect, useRef } from "react";
import { GlobalContext } from "../../reducers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import RichTextLayout from "../RichText/RichTextLayout";
import { useMemo } from "react";

const AboutTheBookBlock = (props) => {
  const { index, blockItem } = props;
  const { currentItem, previewMode, actionType, setCurrentItem } = useContext(GlobalContext);
  const { src, alt } = blockItem;
  const contentStyles = previewMode === "desktop" ? blockItem.contentStyles?.desktop : { ...blockItem.contentStyles?.desktop, ...blockItem.contentStyles?.mobile };
  const styles = previewMode === "desktop" ? blockItem.styles.desktop : { ...blockItem.styles.desktop, ...blockItem.styles.mobile };
  const imageRef = useRef(null);
  const textRef = useRef(null);
  
  const isEdit = currentItem && currentItem.index === index;
  const richTextElement = useMemo(() => <RichTextLayout {...props} />, [isEdit, actionType]);
  
  if(!blockItem.text || blockItem.text.length<1) {
    blockItem.text = `<strong>About the book</strong><br><br>Lorem ipsum dolor sit amet . The graphic and typographic operators know this well, in reality all the professions dealing with the universe of communication have a stable relationship with these words, but what is it? Lorem ipsum is a dummy text without any sense.`;
  }
  
  // Match text height with image height
  useEffect(() => {
    if (imageRef.current && textRef.current) {
      const imageHeight = imageRef.current.offsetHeight;
      if (imageHeight > 0) {
        textRef.current.style.minHeight = `${imageHeight}px`;
      }
    }
  }, [src, styles.width]);
  
  // Calculate the width percentage as a number
  const imageWidth = styles.width && styles.width.includes('%') 
    ? parseInt(styles.width) 
    : 50;
  
  // Determine if image should be full width based on size
  const isFullWidth = imageWidth > 65;
  
  // Adjust styles based on image width
  const imageContainerStyle = {
    ...styles,
    float: isFullWidth ? 'none' : 'right',
    width: isFullWidth ? '100%' : styles.width,
    marginLeft: isFullWidth ? '0' : (styles.marginLeft || '20px'),
    marginBottom: isFullWidth ? '20px' : '0'
  };
  
  const handleImageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Use a timeout to ensure this click happens after any other click handlers
    setTimeout(() => {
      if (blockItem.image) {
        setCurrentItem({ 
          data: blockItem.image, 
          type: "edit", 
          index: `${index}-image` 
        });
      }
    }, 10);
  };
  
  const handleTextClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Use a timeout to ensure this click happens after any other click handlers
    setTimeout(() => {
      if (blockItem.text) {
        setCurrentItem({ 
          data: blockItem.text, 
          type: "edit", 
          index: `${index}-text` 
        });
      }
    }, 10);
  };
  
  return (
    <div className="relative">
      <div style={{ ...contentStyles }}>
        {src ? (
          <div className="about-the-book-container" style={{ clear: 'both' }}>
            <div 
              ref={imageRef}
              onClick={handleImageClick}
              style={{ 
                display: 'block', 
                zIndex: 5, 
                position: 'relative'
              }}
            >
              <img 
                src={src} 
                style={imageContainerStyle} 
                alt={alt} 
                className="inline-block"
              />
            </div>
            <div 
              ref={textRef}
              onClick={handleTextClick}
              style={{ 
                position: 'relative',
                zIndex: 4,
                overflow: 'hidden'
              }}
            >
              {isEdit ? 
                richTextElement : 
                <div style={{ ...styles }} dangerouslySetInnerHTML={{ __html: blockItem.text }}></div>
              }
            </div>
          </div>
        ) : (
          <div className="about-the-book-container">
            <div 
              className="empty-image" 
              style={{ 
                ...styles, 
                width: styles.width === "auto" ? "100%" : styles.width,
                float: 'right',
                minWidth: '300px'
              }}
              onClick={handleImageClick}
            >
              <FontAwesomeIcon icon={faImage} className="empty-image-icon" />
            </div>
            <div 
              ref={textRef}
              onClick={handleTextClick}
            >
              {isEdit ? 
                richTextElement : 
                <div style={{ ...styles }} dangerouslySetInnerHTML={{ __html: blockItem.text }}></div>
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutTheBookBlock;