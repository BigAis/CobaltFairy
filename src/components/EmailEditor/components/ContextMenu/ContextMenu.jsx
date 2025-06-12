import React, { useState, useEffect, useRef } from 'react';
import './ContextMenu.scss';
import Icon from '../../../Icon/Icon';
import { useContext } from 'react';
import { GlobalContext } from '../../reducers';
import { deepClone } from '../../utils/helpers';

const ContextMenu = ({ children }) => {
  const { blockList, setBlockList, currentItem, setCurrentItem } = useContext(GlobalContext);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [menuItems, setMenuItems] = useState([]);
  const menuRef = useRef(null);
  const contentRef = useRef(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    
    // Check if we have text selection
    const selection = window.getSelection();
    const hasTextSelection = selection.toString().length > 0;
    
    // Find if we're inside a block and if it's selected
    let target = e.target;
    let isInBlock = false;
    let blockIndex = null;
    
    // Find closest block element
    while (target && target !== contentRef.current) {
      if (target.closest('.block-item-focus') || target.closest('.block-focus')) {
        isInBlock = true;
        
        // Try to get the index from the closest element with data-index
        const indexElement = target.closest('[data-index]');
        if (indexElement) {
          blockIndex = indexElement.dataset.index;
        }
        break;
      }
      target = target.parentElement;
    }
    
    // Determine menu items based on context
    const items = [];
    
    // Case 1: Text is selected within a block
    if (hasTextSelection) {
      items.push({
        icon: 'Copy',
        label: 'Copy',
        action: handleCopyText
      });
      
      // Paste operations make sense only if we're in an editable element
      if (isEditableElement(e.target)) {
        items.push({
          icon: 'Import',
          label: 'Paste',
          action: handlePasteText
        });
        
        items.push({
          icon: 'Import',
          label: 'Paste as plain text',
          action: handlePastePlainText
        });
      }
    }
    // Case 2: Block is selected but no text is selected
    else if (isInBlock && currentItem) {
      items.push({
        icon: 'Copy',
        label: 'Copy Block',
        action: handleCopyBlock
      });
      
      items.push({
        icon: 'Import',
        label: 'Paste After',
        action: handlePasteBlock
      });
      
      items.push({
        icon: 'Import',
        label: 'Paste as plain text',
        action: handlePastePlainBlock
      });
    }
    
    if (items.length > 0) {
      setMenuItems(items);
      setPosition({ x: e.clientX, y: e.clientY });
      setVisible(true);
    }
  };
  
  // Helper to check if element is editable
  const isEditableElement = (element) => {
    return element.isContentEditable || 
           element.tagName === 'INPUT' || 
           element.tagName === 'TEXTAREA' ||
           element.closest('.text-content_editable') !== null;
  };
  
  // Text operations
  const handleCopyText = () => {
    document.execCommand('copy');
    setVisible(false);
  };

  const handlePasteText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      document.execCommand('insertHTML', false, text);
    } catch (err) {
      // Fallback
      document.execCommand('paste');
    }
    setVisible(false);
  };

  const handlePastePlainText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      // For plain text, we just insert the raw text without formatting
      document.execCommand('insertText', false, text);
    } catch (err) {
      console.error('Failed to paste plain text:', err);
    }
    setVisible(false);
  };
  
  // Block operations
  const handleCopyBlock = () => {
    if (!currentItem) return;
    
    try {
      // Get the active block from current selection
      const blockToCopy = deepClone(currentItem.data);
      
      // Store in localStorage for block operations
      localStorage.setItem('fairymail_copied_block', JSON.stringify(blockToCopy));
      
      // Also copy any HTML content to system clipboard if applicable
      if (blockToCopy.text) {
        const tempElement = document.createElement('div');
        tempElement.innerHTML = blockToCopy.text;
        copyToClipboard(tempElement.innerText);
      }
    } catch (err) {
      console.error('Failed to copy block:', err);
    }
    
    setVisible(false);
  };
  
  // Helper to copy text to clipboard
  const copyToClipboard = (text) => {
    const tempElement = document.createElement('textarea');
    tempElement.value = text;
    document.body.appendChild(tempElement);
    tempElement.select();
    document.execCommand('copy');
    document.body.removeChild(tempElement);
  };
  
  const handlePasteBlock = () => {
    if (!currentItem) return;
    
    try {
      // Get copied block from storage
      const storedBlock = localStorage.getItem('fairymail_copied_block');
      if (!storedBlock) {
        setVisible(false);
        return;
      }
      
      const blockToPaste = JSON.parse(storedBlock);
      const indexParts = currentItem.index.toString().split('-');
      const newBlockList = deepClone(blockList);
      
      if (indexParts.length === 1) {
        // It's a main block - insert after current index
        const blockIndex = parseInt(indexParts[0]);
        newBlockList.splice(blockIndex + 1, 0, blockToPaste);
      } else if (indexParts.length === 3) {
        // It's a block item - insert after current item
        const [blockIndex, contentIndex, itemIndex] = indexParts.map(i => parseInt(i));
        newBlockList[blockIndex].children[contentIndex].children.splice(itemIndex + 1, 0, blockToPaste);
      }
      
      setBlockList(newBlockList, 'paste');
    } catch (err) {
      console.error('Failed to paste block:', err);
    }
    
    setVisible(false);
  };
  
  const handlePastePlainBlock = () => {
    if (!currentItem) return;
    
    try {
      // Get copied block from storage
      const storedBlock = localStorage.getItem('fairymail_copied_block');
      if (!storedBlock) {
        setVisible(false);
        return;
      }
      
      // Parse the block and strip any rich formatting if it has text content
      const blockToPaste = JSON.parse(storedBlock);
      if (blockToPaste.text) {
        // Strip HTML formatting
        const tempElement = document.createElement('div');
        tempElement.innerHTML = blockToPaste.text;
        blockToPaste.text = tempElement.innerText;
      }
      
      const indexParts = currentItem.index.toString().split('-');
      const newBlockList = deepClone(blockList);
      
      if (indexParts.length === 1) {
        // It's a main block
        const blockIndex = parseInt(indexParts[0]);
        newBlockList.splice(blockIndex + 1, 0, blockToPaste);
      } else if (indexParts.length === 3) {
        // It's a block item
        const [blockIndex, contentIndex, itemIndex] = indexParts.map(i => parseInt(i));
        newBlockList[blockIndex].children[contentIndex].children.splice(itemIndex + 1, 0, blockToPaste);
      }
      
      setBlockList(newBlockList, 'paste');
    } catch (err) {
      console.error('Failed to paste plain block:', err);
    }
    
    setVisible(false);
  };

  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Adjust position if menu goes off screen
  useEffect(() => {
    if (visible && menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const newPosition = { ...position };
      
      if (menuRect.right > window.innerWidth) {
        newPosition.x = window.innerWidth - menuRect.width;
      }
      
      if (menuRect.bottom > window.innerHeight) {
        newPosition.y = window.innerHeight - menuRect.height;
      }
      
      if (newPosition.x !== position.x || newPosition.y !== position.y) {
        setPosition(newPosition);
      }
    }
  }, [visible, position]);

  return (
    <div ref={contentRef} onContextMenu={handleContextMenu}>
      {children}
      {visible && (
        <div 
          className="context-menu" 
          ref={menuRef}
          style={{ 
            top: `${position.y}px`, 
            left: `${position.x}px` 
          }}
        >
          <ul>
            {menuItems.map((item, index) => (
              <li key={index} onClick={item.action}>
                <Icon name={item.icon} size={16} />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ContextMenu;
