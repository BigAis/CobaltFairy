import React, { useState, useEffect, useRef } from 'react';
import './ContextMenu.scss';
import Icon from '../../../Icon/Icon';
import { useContext } from 'react';
import { GlobalContext } from '../../reducers';
import { deepClone } from '../../utils/helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const ContextMenu = ({ children }) => {
  const { blockList, setBlockList, currentItem, setCurrentItem } = useContext(GlobalContext);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [expandedSections, setExpandedSections] = useState({
    text: false,
    block: false
  });
  // Store the selection range when right-clicking
  const savedSelectionRef = useRef(null);
  const menuRef = useRef(null);
  const contentRef = useRef(null);

  // Helper function to save the current selection
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  // Helper function to restore the saved selection
  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
      return true;
    }
    return false;
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    
    // Save the current selection when right-clicking
    saveSelection();
    
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
    
    // Determine if we should show the menu
    const showTextOptions = hasTextSelection || isEditableElement(e.target);
    const showBlockOptions = isInBlock && currentItem;
    
    if (showTextOptions || showBlockOptions) {
      setPosition({ x: e.clientX, y: e.clientY });
      setVisible(true);
      
      // Reset expanded sections
      setExpandedSections({
        text: false,
        block: false
      });
    }
  };
  
  // Helper to check if element is editable
  const isEditableElement = (element) => {
    return element.isContentEditable || 
           element.tagName === 'INPUT' || 
           element.tagName === 'TEXTAREA' ||
           element.closest('.text-content_editable') !== null;
  };
  
  // Toggle a section's expanded state
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };
  
  // Text operations
  const handleCopyText = () => {
    try {
      // Restore the selection first to make sure we're copying the right content
      if (restoreSelection()) {
        // Focus the element containing the selection
        const selection = window.getSelection();
        if (selection.focusNode) {
          // Find the closest editable parent if any
          let editableParent = selection.focusNode;
          while (editableParent && !editableParent.isContentEditable && editableParent.parentNode) {
            editableParent = editableParent.parentNode;
          }
          
          if (editableParent && editableParent.focus) {
            editableParent.focus();
          }
        }
        
        // Get the selected text
        const selectedText = selection.toString();
        
        if (selectedText) {
          // Use modern clipboard API if available
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(selectedText)
              .catch(() => {
                // Fallback to execCommand if clipboard API fails
                document.execCommand('copy');
              });
          } else {
            // Fallback for older browsers
            document.execCommand('copy');
          }
        }
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
      // Ultimate fallback
      document.execCommand('copy');
    }
    setVisible(false);
  };

  const handlePasteText = async () => {
    try {
      // First restore the selection to place the cursor in the right position
      if (restoreSelection()) {
        // Focus the element containing the selection to ensure commands work
        const selection = window.getSelection();
        if (selection.focusNode) {
          // Find the editable parent
          let editableParent = selection.focusNode;
          while (editableParent && !editableParent.isContentEditable) {
            editableParent = editableParent.parentNode;
          }
          
          if (editableParent && editableParent.focus) {
            editableParent.focus();
          }
        }
        
        const text = await navigator.clipboard.readText();
        document.execCommand('insertHTML', false, text);
      }
    } catch (err) {
      console.error('Failed to paste text:', err);
      // Fallback
      if (restoreSelection()) {
        document.execCommand('paste');
      }
    }
    setVisible(false);
  };

  const handlePastePlainText = async () => {
    try {
      // First restore the selection
      if (restoreSelection()) {
        // Focus the element containing the selection
        const selection = window.getSelection();
        if (selection.focusNode) {
          // Find the editable parent
          let editableParent = selection.focusNode;
          while (editableParent && !editableParent.isContentEditable) {
            editableParent = editableParent.parentNode;
          }
          
          if (editableParent && editableParent.focus) {
            editableParent.focus();
          }
        }
        
        // Get text from clipboard
        const clipboardText = await navigator.clipboard.readText();
        
        // Strip all HTML tags and formatting
        const tempElement = document.createElement('div');
        tempElement.innerHTML = clipboardText;
        const plainText = tempElement.textContent || tempElement.innerText || '';
        
        // Insert as plain text
        document.execCommand('insertText', false, plainText);
      }
    } catch (err) {
      console.error('Failed to paste plain text:', err);
      
      // Fallback method - try to do manual stripping if possible
      try {
        if (restoreSelection()) {
          const tempInput = document.createElement('textarea');
          document.body.appendChild(tempInput);
          tempInput.value = await navigator.clipboard.readText();
          const plainText = tempInput.value;
          document.body.removeChild(tempInput);
          
          document.execCommand('insertText', false, plainText);
        }
      } catch (fallbackErr) {
        console.error('Plain text fallback failed:', fallbackErr);
      }
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
            {/* Text Section */}
            <li className="menu-section" onClick={() => toggleSection('text')}>
              <div className="section-header">
                <FontAwesomeIcon 
                  icon={expandedSections.text ? faChevronDown : faChevronRight} 
                  className="section-icon" 
                />
                <span>Text</span>
              </div>
            </li>
            {expandedSections.text && (
              <>
                <li className="menu-item menu-subitem" onClick={handleCopyText}>
                  <Icon name="Copy" size={16} />
                  <span>Copy Text</span>
                </li>
                <li className="menu-item menu-subitem" onClick={handlePasteText}>
                  <Icon name="Import" size={16} />
                  <span>Paste</span>
                </li>
                <li className="menu-item menu-subitem" onClick={handlePastePlainText}>
                  <Icon name="Import" size={16} />
                  <span>Paste as plain text</span>
                </li>
              </>
            )}

            {/* Block Section */}
            <li className="menu-section" onClick={() => toggleSection('block')}>
              <div className="section-header">
                <FontAwesomeIcon 
                  icon={expandedSections.block ? faChevronDown : faChevronRight} 
                  className="section-icon" 
                />
                <span>Block</span>
              </div>
            </li>
            {expandedSections.block && (
              <>
                <li className="menu-item menu-subitem" onClick={handleCopyBlock}>
                  <Icon name="Copy" size={16} />
                  <span>Copy Block</span>
                </li>
                <li className="menu-item menu-subitem" onClick={handlePasteBlock}>
                  <Icon name="Import" size={16} />
                  <span>Paste After</span>
                </li>
                <li className="menu-item menu-subitem" onClick={handlePastePlainBlock}>
                  <Icon name="Import" size={16} />
                  <span>Paste as plain text</span>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ContextMenu;