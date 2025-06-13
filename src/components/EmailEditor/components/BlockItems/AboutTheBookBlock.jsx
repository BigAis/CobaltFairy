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
  
  const isEdit = currentItem && currentItem.index === index;
  const richTextElement = useMemo(() => <RichTextLayout {...props} />, [isEdit, actionType]);
  
  if(!blockItem.text || blockItem.text.length < 1) {
    blockItem.text = `<strong>About the book</strong><br><br>Lorem ipsum dolor sit amet. The graphic and typographic operators know this well, in reality all the professions dealing with the universe of communication have a stable relationship with these words, but what is it? Lorem ipsum is a dummy text without any sense.`;
  }
  
  // Calculate width and determine layout mode
  const imageWidth = styles.width && styles.width.includes('%') ? parseInt(styles.width) : 50;
  const useVerticalLayout = imageWidth > 35;
  
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
      <div style={{ ...contentStyles }}>
        <div className="about-the-book-container" style={{ 
          display: 'flex', 
          flexDirection: useVerticalLayout ? 'column' : 'row', 
          width: '100%' 
        }}>
          <div 
            className="block-item image parent-about_the_book"
            onClick={handleImageClick}
            style={{ 
              width: `${imageWidth}%`,
              marginRight: useVerticalLayout ? 0 : '20px',
              marginBottom: useVerticalLayout ? '20px' : 0,
              flexShrink: 0
            }}
          >
            {src ? (
              <img 
                src={src} 
                alt={alt} 
                style={{ 
                  width: '100%',
                  display: 'block'
                }} 
              />
            ) : (
              <div className="empty-image" style={{ width: '100%' }}>
                <FontAwesomeIcon icon={faImage} className="empty-image-icon" />
              </div>
            )}
          </div>
          
          <div 
            className="block-item text parent-about_the_book"
            onClick={handleTextClick}
            style={{ 
              flex: 1,
              alignSelf: 'flex-start'
            }}
          >
            {isEdit ? 
              richTextElement : 
              <div style={{ ...styles }} dangerouslySetInnerHTML={{ __html: blockItem.text }}></div>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutTheBookBlock;