import { useContext } from "react";
import { GlobalContext } from "../../reducers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import RichTextLayout from "../RichText/RichTextLayout";
import { useMemo } from "react";
const AboutTheBookBlock = (props) => {
  const { index, blockItem } = props;
  const { currentItem, previewMode, actionType } = useContext(GlobalContext);
  const { src, alt } = blockItem;
  const contentStyles = previewMode === "desktop" ? blockItem.contentStyles?.desktop : { ...blockItem.contentStyles?.desktop, ...blockItem.contentStyles?.mobile };
  const styles = previewMode === "desktop" ? blockItem.styles.desktop : { ...blockItem.styles.desktop, ...blockItem.styles.mobile };
  
  const isEdit = currentItem && currentItem.index === index;
  const richTextElement = useMemo(() => <RichTextLayout {...props} />, [isEdit, actionType]);
  if(!blockItem.text || blockItem.text.length<1) blockItem.text = `<strong>About the book</strong><br><br>Lorem ipsum dolor sit amet . The graphic and typographic operators know this well, in reality all the professions dealing with the universe of communication have a stable relationship with these words, but what is it? Lorem ipsum is a dummy text without any sense.`
  return (
    <div className="relative">
      <div style={{ ...contentStyles }}>
        {src ? (
          <div className="about-the-book-container">
            <img src={src} style={styles} alt={alt} className="inline-block"/>
            <div>{ isEdit ? richTextElement : <div style={{ ...styles }} dangerouslySetInnerHTML={{ __html: blockItem.text }}></div> }</div>
          </div>
        ) : (
           <div className="about-the-book-container">
            <div className="empty-image" style={{ ...styles, width: styles.width === "auto" ? "100%" : styles.width }}>
              <FontAwesomeIcon icon={faImage} className="empty-image-icon" style={{float:'left',minWidth:'300px'}}/>
              <div>{ isEdit ? richTextElement : <div style={{ ...styles }} dangerouslySetInnerHTML={{ __html: blockItem.text }}></div> }</div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutTheBookBlock;
