import { useEffect, useRef, useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faExpandAlt, faCompressAlt, faSmile } from "@fortawesome/free-solid-svg-icons";
import { GlobalContext } from "../../reducers";
import { deepClone } from "../../utils/helpers";
import { motion } from "framer-motion";
import useDataSource from "../../configs/useDataSource"
import EmojiPicker from 'emoji-picker-react';

import Bold from "./Bold";
import Italic from "./Italic";
import Underline from "./Underline";
import Strikethrough from "./Strikethrough";
import InsertOrderedList from "./InsertOrderedList";
import InsertUnorderedList from "./InsertUnorderedList";
import Link from "./Link";
import TextAlign from "./TextAlign";
import FontColor from "./FontColor";
import Icon from "../../../Icon/Icon";

const RichText = ({ index, textBlock, styles }) => {
  const { blockList, setBlockList, currentItem, setCurrentItem } = useContext(GlobalContext);
  const richTextRef = useRef(null);
  const [isHidden, setIsHidden] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Store cursor position data
  const cursorPositionRef = useRef({
    startOffset: 0,
    endOffset: 0,
    startContainer: null,
    endContainer: null
  });

  useEffect(() => {
    if (richTextRef.current) {
      var viewportOffset = richTextRef.current.parentNode?.getBoundingClientRect();
      const preview = document.querySelector("#preview");
      const previewOffset = preview.getBoundingClientRect();
      if (viewportOffset.top - 190 < 0) {
        richTextRef.current.style.bottom = "auto";
        richTextRef.current.style.top = "110%";
      } else {
        richTextRef.current.style.bottom = "110%";
        richTextRef.current.style.top = "auto";
      }
      if (viewportOffset.left + 375 > previewOffset.left + previewOffset.width) {
        richTextRef.current.style.left = "auto";
        richTextRef.current.style.right = "0";
      } else {
        richTextRef.current.style.left = "0";
        richTextRef.current.style.right = "auto";
      }
    }
  }, []);

  const modifyText = (command, defaultUi, value) => {
    document.execCommand(command, defaultUi, value);
  };

  // Save the current cursor position when the emoji picker button is clicked
  const saveCursorPosition = () => {
    if (textBlock && textBlock.current) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Store all necessary information to recreate the range later
        cursorPositionRef.current = {
          startContainer: range.startContainer,
          endContainer: range.endContainer,
          startOffset: range.startOffset,
          endOffset: range.endOffset,
          commonAncestorContainer: range.commonAncestorContainer
        };
        
        // Ensure the text block is still focused
        textBlock.current.focus();
      }
    }
  };

  // Toggle emoji picker and save cursor position
  const toggleEmojiPicker = () => {
    if (!showEmojiPicker) {
      saveCursorPosition();
    }
    setShowEmojiPicker(!showEmojiPicker);
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiData) => {
    if (textBlock && textBlock.current) {
      // Focus the editable area first
      textBlock.current.focus();
      
      try {
        // Create a new selection and range
        const selection = window.getSelection();
        const range = document.createRange();
        
        // Use the stored cursor position to recreate the selection
        const position = cursorPositionRef.current;
        
        if (position.startContainer && position.endContainer) {
          // Set the range boundaries using the stored information
          range.setStart(position.startContainer, position.startOffset);
          range.setEnd(position.endContainer, position.endOffset);
          
          // Apply the range to the selection
          selection.removeAllRanges();
          selection.addRange(range);
          
          // Insert emoji at cursor position
          document.execCommand('insertText', false, emojiData.emoji);
          
          // Update the content
          setTextContent();
        } else {
          // Fallback - insert at the end if position data is missing
          console.warn("No valid cursor position found, appending to end");
          range.selectNodeContents(textBlock.current);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
          document.execCommand('insertText', false, emojiData.emoji);
          setTextContent();
        }
      } catch (error) {
        console.error("Error inserting emoji:", error);
        // Last resort fallback - try direct insertion
        document.execCommand('insertText', false, emojiData.emoji);
        setTextContent();
      }
    }
    
    // Close the emoji picker
    setShowEmojiPicker(false);
  };

  const setTextContent = () => {
    const indexArray = index.split("-");
    let newBlockList = deepClone(blockList);
    let newCurrentItem = deepClone(currentItem);
    
    if (textBlock && textBlock.current) {
      newCurrentItem.data.text = textBlock.current.innerHTML;
      newBlockList[indexArray[0]].children[indexArray[1]].children[indexArray[2]].text = textBlock.current.innerHTML;
      setCurrentItem({ ...newCurrentItem });
      setBlockList(newBlockList);
      
      // After updating content, try to restore focus and cursor position
      setTimeout(() => {
        if (textBlock.current) {
          textBlock.current.focus();
        }
      }, 0);
    }
  };

  const fontSizeList = [
    "8px",
    "10px",
    "12px",
    "14px",
    "16px",
    "18px",
    "20px",
    "22px",
    "24px",
    "26px",
    "28px",
    "30px",
    "32px",
    "34px",
    "36px",
    "38px",
    "40px",
    "44px",
    "48px",
    "72px",
  ];

  const fontname_configs = ["sans-serif", "Inter", "Arial", "Verdana", "Times New Roman", "Garamond", "Georgia", "Courier New", "cursive"];
  const { fontsList } = useDataSource();

  const selectElement = (selectList, defaultValue, type, onChange) => {
    const hideOptions = () => {
      const options = document.querySelector(`#richText-options-${type}-${index}`);
      const mask = document.querySelector(`#richText-mask-${type}-${index}`);
      options.style.animation = "leave 0.2s linear";
      setTimeout(() => {
        options.style.display = "none";
        mask.style.display = "none";
      }, 100);
    };

    const showOptions = () => {
      const options = document.querySelector(`#richText-options-${type}-${index}`);
      const mask = document.querySelector(`#richText-mask-${type}-${index}`);
      options.style.display = "block";
      mask.style.display = "block";
      options.style.animation = "move 0.2s linear";
    };
    return (
      <div className="richText-select">
        <div
          className="richText-select-select"
          onClick={(event) => {
            event.stopPropagation();
            const options = document.querySelector(`#richText-options-${type}-${index}`);
            if (options.style.display === "block") {
              hideOptions();
            } else {
              showOptions();
            }
          }}
        >
          <span className="richText-select-value" id={`richText-select-value-${type}-${index}`}>
            {defaultValue}
          </span>
          <FontAwesomeIcon icon={faAngleDown} className="richText-select-icon" />
        </div>
        <div className="richText-mask" id={`richText-mask-${type}-${index}`} onClick={hideOptions}></div>
        <div className="richText-select-option" id={`richText-options-${type}-${index}`}>
          {selectList.map((item) => {
            return (
              <div
                className="richText-select-option_item"
                key={item}
                onClick={() => {
                  const currentValueDom = document.querySelector(`#richText-select-value-${type}-${index}`);
                  let value = type=="fontName" ? item.attribute : item;
                  currentValueDom.innerHTML = value;
                  hideOptions();
                  onChange && onChange(value);
                  setTextContent();
                }}
              >
                {type=="fontName" ? item.name : item}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const editFontSize = (item) => {
    document.execCommand("fontSize", 0, "7");
    var fontElements = document.getElementsByTagName("font");
    for (var idx = 0, len = fontElements.length; idx < len; ++idx) {
      if (fontElements[idx].size === "7") {
        fontElements[idx].removeAttribute("size");
        fontElements[idx].style.fontSize = item;
      }
    }
  };

  const editFontName = (item) => {
    modifyText("fontName", false, item);
  };
  
  return (
    <div
      className={`rich-text ${'0-0-0'===index ? 'first-node' : ''}`}
      ref={richTextRef}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <motion.div
        className={`rich-text-tools`}
        initial={{ scale: 0, x: 0 }}
        animate={{ scale: 1, x: 0 }}
        style={{ width: isHidden ? "auto" : "375px" }}
      >
        <div className="rich-text-tools-body items-center">
          {!isHidden && (
            <>
              {selectElement(fontSizeList, styles.fontSize + "px", "fontSize", editFontSize)}
              {selectElement(fontsList, styles.fontFamily, "fontName", editFontName)}
              <FontColor modifyText={modifyText} setTextContent={setTextContent} />
              <Bold modifyText={modifyText} setTextContent={setTextContent} />
              <Italic modifyText={modifyText} setTextContent={setTextContent} />
              <Underline modifyText={modifyText} setTextContent={setTextContent} />
              <Strikethrough modifyText={modifyText} setTextContent={setTextContent} />
              <InsertOrderedList modifyText={modifyText} setTextContent={setTextContent} />
              <InsertUnorderedList modifyText={modifyText} setTextContent={setTextContent} />
              <Link modifyText={modifyText} setTextContent={setTextContent} />
              <TextAlign modifyText={modifyText} setTextContent={setTextContent} />
              
              {/* Emoji Picker Button */}
              <button
                className="rich-text-tools-button"
                title="Insert Emoji"
                onClick={toggleEmojiPicker}
              >
                <FontAwesomeIcon icon={faSmile} className="rich-text-tools-button-icon" />
              </button>
              
              {/* Emoji Picker Dropdown */}
              {showEmojiPicker && (
                <div style={{ 
                  position: 'absolute', 
                  zIndex: 1080, 
                  top: '100%', 
                  left: 0,
                  background: '#fff',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  borderRadius: '8px'
                }}>
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </>
          )}
          <button className="rich-text-tools-button" onClick={() => setIsHidden(!isHidden)}>
            {<FontAwesomeIcon icon={isHidden ? faExpandAlt : faCompressAlt} className="rich-text-tools-button-icon" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RichText;