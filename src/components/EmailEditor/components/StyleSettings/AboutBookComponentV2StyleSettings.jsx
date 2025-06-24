import { useContext, useState, useEffect } from "react";
import { GlobalContext } from "../../reducers";
import classNames from "../../utils/classNames";
import { InputNumber, Select } from "antd";

import ColorPicker from "../ColorPicker";
import PaddingSettings from "./PaddingSettings";
import useLayout from "../../utils/useStyleLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAlignCenter, faAlignLeft, faAlignRight, faAlignJustify } from "@fortawesome/free-solid-svg-icons";
import useTranslation from "../../translation";

import { Switch, Slider, Input } from "antd";
import { deepClone } from "../../utils/helpers";
import ImageUploadPopup from "./ImageUploadPopup"
import Button from "../../../Button"
import useDataSource from "../../configs/useDataSource"

const AboutBookComponentV2StyleSettings = () => {
    const { currentItem, previewMode, blockList, setBlockList } = useContext(GlobalContext);
    const [ pickerVisible, setPickerVisible ] = useState(false);
    const [ imageWidth, setImageWidth ] = useState(35); // Default to 35% - left-aligned
    const [ imageHeight, setImageHeight ] = useState(null); // Default to null (auto height)
    const { t } = useTranslation();
    const { findStyleItem, cardItemElement, inputChange, updateItemStyles, colorChange, paddingChange, otherStylesChange, } = useLayout();

  // When the component loads or currentItem changes, update the image width and height state
  useEffect(() => {
    if (currentItem?.data?.styles?.desktop?.width) {
      const width = currentItem.data.styles.desktop.width;
      if (width.includes('%')) {
        setImageWidth(parseInt(width));
      }
    }

    // Extract height from the image styles if it exists
    if (currentItem?.data?.image?.styles?.desktop?.height) {
      const height = currentItem.data.image.styles.desktop.height;
      if (typeof height === 'number') {
        setImageHeight(height);
      } else if (typeof height === 'string' && height.includes('px')) {
        setImageHeight(parseInt(height));
      }
    }
  }, [currentItem]);

  const PaddingStylesElement = () => {
    return (
      <>
        <div className="right-setting-block-item-title">{t("padding_settings")}</div>
        <PaddingSettings
          padding={{
            paddingTop: findStyleItem(currentItem.data.styles, "paddingTop"),
            paddingRight: findStyleItem(currentItem.data.styles, "paddingRight"),
            paddingLeft: findStyleItem(currentItem.data.styles, "paddingLeft"),
            paddingBottom: findStyleItem(currentItem.data.styles, "paddingBottom"),
          }}
          setPadding={paddingChange}
        />
      </>
    );
  };

  const textStylesElement = () => {
    const color = findStyleItem(currentItem.data.styles, "color");
    const textAlign = findStyleItem(currentItem.data.styles, "textAlign");
    const fontFamily = findStyleItem(currentItem.data.styles, "fontFamily");
    const fontSize = findStyleItem(currentItem.data.styles, "fontSize");
    const lineHeight = findStyleItem(currentItem.data.styles, "lineHeight");
    const { fontsList } = useDataSource();

    return (
      <>
        <div className="right-setting-block-item-title">{t("text_styles")}</div>
        {cardItemElement(t("font_color"), <ColorPicker color={color} setColor={colorChange("color")} />)}
        {cardItemElement(
          t("text_align"),
          <div className="flex justify-center items-center">
            {[
              { icon: faAlignLeft, value: "left" },
              { icon: faAlignCenter, value: "center" },
              { icon: faAlignRight, value: "right" },
              { icon: faAlignJustify, value: "justify" },
            ].map(({ icon, value }) => {
              return (
                <div
                  key={value}
                  className={classNames(textAlign === value ? "align-style-item-active" : "align-style-item-un_active", "align-style-item")}
                  onClick={() => otherStylesChange("textAlign", value)}
                >
                  <img src={`/images/align-${value}.png`}/>
                </div>
              );
            })}
          </div>
        )}
        {cardItemElement(
          t("font_family"),
          <Select className="input-width" value={fontFamily} onChange={inputChange("fontFamily")}>
          {fontsList.map((item) => (
            <Select.Option key={item.name} value={item.attribute}>
              {item.name}
            </Select.Option>
          ))}
        </Select>
        )}
        {cardItemElement(
          t("font_size"),
          <InputNumber min={0} className="input-width" addonAfter="px" value={fontSize} onChange={inputChange("fontSize")} />
        )}
      </>
    );
  };
   
  const actionSettings = () => {
    const { linkURL } = currentItem.data;

    const linkChange = (event) => {
      const newValue = event.target.value;
      const newCurrentItem = deepClone(currentItem);
      currentItem.data.linkURL = newValue;
      updateItemStyles(newCurrentItem.data);
    };

    return (
      <>
        <div className="right-setting-block-item-title">Image Link</div>
        <div className="card-item-title">{t("link_url")}</div>
        <div className="margin-top-6">
          <Input value={linkURL} onChange={linkChange} />
        </div>
      </>
    );
  };

  const imageSettings = () => {
    const { src, alt } = currentItem.data;

    const linkChange = (key) => (event) => {
      const newCurrentItem = deepClone(currentItem);
      newCurrentItem.data[key] = event.target.value;
      updateItemStyles(newCurrentItem.data);
    };

    // Fixed image picker function
    const pickImage = (src) => {
      // Check if we're working with a component section (image or text)
      // by examining the index format
      const isComponentSection = currentItem.index && 
                               typeof currentItem.index === 'string' && 
                               currentItem.index.includes('-image');

      if (isComponentSection) {
        // Get the base index without the -image suffix
        const baseIndex = currentItem.index.split('-image')[0];
        const indexParts = baseIndex.split('-');
        
        if (indexParts.length >= 3) {
          // Create a deep clone of the current block list
          const newBlockList = deepClone(blockList);
          
          // Find the parent component using the base index
          const blockIndex = parseInt(indexParts[0]);
          const contentIndex = parseInt(indexParts[1]);
          const itemIndex = parseInt(indexParts[2]);
          
          const parentComponent = newBlockList[blockIndex].children[contentIndex].children[itemIndex];
          
          // Ensure this is our component
          if (parentComponent && parentComponent.key === "about_book_v2") {
            // Update both the main src and the image.src
            parentComponent.src = src;
            
            // Update image object if it exists
            if (parentComponent.image) {
              parentComponent.image.src = src;
              
              // Set float based on image width
              const width = imageWidth || 35;
              parentComponent.image.styles.desktop.float = width > 65 ? 'none' : 'left';
              parentComponent.image.styles.desktop.marginRight = width > 65 ? '0' : '20px';
              parentComponent.image.styles.desktop.marginBottom = width > 65 ? '20px' : '10px';
              parentComponent.image.styles.desktop.width = `${width}%`;
              parentComponent.image.styles.desktop.maxWidth = `${width}%`;
              
              // Set height if specified
              if (imageHeight) {
                parentComponent.image.styles.desktop.height = `${imageHeight}px`;
              } else if (parentComponent.image.styles.desktop.height) {
                delete parentComponent.image.styles.desktop.height;
              }
            }
            
            // Update main component properties
            parentComponent.imageWidth = imageWidth;
            
            // Update the block list
            setBlockList(newBlockList, `edit_${new Date().getTime()}`);
            
            // Delay to allow DOM to update with new image
            setTimeout(() => {
              const img = document.querySelector(`img[src="${src}"]`);
              if (img && parentComponent) {
                parentComponent.imgHeight = img.clientHeight;
                setBlockList(deepClone(newBlockList), `edit_${new Date().getTime()}`);
              }
            }, 100);
            
            return;
          }
        }
      }
      
      // Fallback to standard update if we're not dealing with a component section
      const newCurrentItem = deepClone(currentItem);
      newCurrentItem.data.src = src;
      updateItemStyles(newCurrentItem.data);
    };

    return (
      <>
        <div className="right-setting-block-item-title">{t("image_settings")}</div>
        <div className="card-item">
          <div className="width-full">
            <div className="card-item-title">{t("image_url")}</div>
            <div className="margin-top-6">
              <Input value={src} onChange={linkChange("src")} />
            </div>
            <Button type="secondary" onClick={()=>{setPickerVisible(true)}} className={'imagePicker'}>Choose Image</Button>
            <ImageUploadPopup shown={pickerVisible} setShown={setPickerVisible} selectImage={pickImage}></ImageUploadPopup>
          </div>
        </div>
        <div className="card-item">
          <div className="width-full">
            <div className="card-item-title">{t("image_alt")}</div>
            <div className="margin-top-6">
              <Input value={alt} onChange={linkChange("alt")} />
            </div>
          </div>
        </div>
      </>
    );
  };

  const updateContentStylesPadding = (padding) => {
    const newData = deepClone(currentItem.data);
    newData.contentStyles[previewMode] = {
      ...newData.contentStyles[previewMode],
      ...padding,
    };
    updateItemStyles(newData);
  };

  const updateContentTextAlign = (textAlign) => {
    const newData = deepClone(currentItem.data);
    newData.contentStyles[previewMode] = {
      ...newData.contentStyles[previewMode],
      textAlign,
    };
    updateItemStyles(newData);
  };

  const imageStyleSettings = () => {
    // Get width value by checking image styles first, then component property
    const getWidthValue = () => {
      if (currentItem?.data?.image?.styles?.desktop?.width === "auto") {
        return "auto";
      }
      return null;
    };
    
    const width = getWidthValue();
    const isWidthAuto = width === "auto";
    const textAlign = findStyleItem(currentItem.data.contentStyles, "textAlign");
    
    // Check if height is set to auto
    const isHeightAuto = !currentItem.data.image?.styles?.desktop?.height;
    
    const handleWidthChange = (value) => {
      setImageWidth(value);
      
      const newData = deepClone(currentItem.data);
      
      // Always update the imageWidth property
      newData.imageWidth = value;
      
      // Use consistent threshold (65%) for layout switching
      const useVerticalLayout = value > 65;
      
      // Update the image object if it exists
      if (newData.image && newData.image.styles && newData.image.styles.desktop) {
        newData.image.styles.desktop.width = `${value}%`;
        newData.image.styles.desktop.maxWidth = `${value}%`;
        
        if (useVerticalLayout) {
          // Vertical layout (image above text)
          newData.image.styles.desktop.float = "none";
          newData.image.styles.desktop.marginRight = "0";
          newData.image.styles.desktop.marginBottom = "20px";
        } else {
          // Side-by-side layout (image left, text right)
          newData.image.styles.desktop.float = "left";
          newData.image.styles.desktop.marginRight = "20px";
          newData.image.styles.desktop.marginBottom = "10px";
        }
      }
      
      updateItemStyles(newData);
    };

    const handleHeightChange = (value) => {
      setImageHeight(value);
      
      const newData = deepClone(currentItem.data);
      
      // Update the image height in styles
      if (newData.image && newData.image.styles && newData.image.styles.desktop) {
        newData.image.styles.desktop.height = `${value}px`;
      }
      
      updateItemStyles(newData);
    };

    const toggleWidthAuto = (checked) => {
      const newData = deepClone(currentItem.data);
      
      if (!newData.image) {
        newData.image = { styles: { desktop: {}, mobile: {} } };
      } else if (!newData.image.styles) {
        newData.image.styles = { desktop: {}, mobile: {} };
      } else if (!newData.image.styles.desktop) {
        newData.image.styles.desktop = {};
      }
      
      if (checked) {
        // Switch to auto width
        newData.image.styles.desktop.width = "auto";
        if (newData.image.styles.desktop.maxWidth) {
          delete newData.image.styles.desktop.maxWidth;
        }
      } else {
        // Switch to fixed width (default to 35%)
        const defaultWidth = 35;
        newData.image.styles.desktop.width = `${defaultWidth}%`;
        newData.image.styles.desktop.maxWidth = `${defaultWidth}%`;
        newData.imageWidth = defaultWidth;
        setImageWidth(defaultWidth);
        
        // Set correct layout properties based on width
        if (defaultWidth > 65) {
          newData.image.styles.desktop.float = "none";
          newData.image.styles.desktop.marginRight = "0";
          newData.image.styles.desktop.marginBottom = "20px";
        } else {
          newData.image.styles.desktop.float = "left";
          newData.image.styles.desktop.marginRight = "20px";
          newData.image.styles.desktop.marginBottom = "10px";
        }
      }
      
      updateItemStyles(newData);
    };

    const toggleHeightAuto = (checked) => {
      const newData = deepClone(currentItem.data);
      
      if (!newData.image) {
        newData.image = { styles: { desktop: {}, mobile: {} } };
      } else if (!newData.image.styles) {
        newData.image.styles = { desktop: {}, mobile: {} };
      } else if (!newData.image.styles.desktop) {
        newData.image.styles.desktop = {};
      }
      
      if (checked) {
        // Switch to auto height (remove height property)
        if (newData.image.styles.desktop.height) {
          delete newData.image.styles.desktop.height;
        }
        setImageHeight(null);
      } else {
        // Switch to fixed height (default to 200px)
        const defaultHeight = 200;
        newData.image.styles.desktop.height = `${defaultHeight}px`;
        setImageHeight(defaultHeight);
      }
      
      updateItemStyles(newData);
    };
    
    return (
      <>
        <div className="right-setting-block-item-title">{t("image_styles")}</div>
        {cardItemElement(
          t("width_auto"),
          <Switch
            checked={isWidthAuto}
            className={classNames(isWidthAuto ? "switch-active" : "switch-disabled")}
            onChange={toggleWidthAuto}
          />
        )}
        {!isWidthAuto && (
          <div>
            <div className="card-item-title">Image Width: {imageWidth}%</div>
            <Slider 
              value={imageWidth} 
              min={10} 
              max={100} 
              onChange={handleWidthChange} 
            />
            <div className="card-item-title" style={{marginTop: "10px", fontSize: "12px"}}>
              Note: Width over 65% will stack image above text on all devices
            </div>
          </div>
        )}
        
        {/* Image Height Control - Same UI as Width */}
        {cardItemElement(
          "Height Auto",
          <Switch
            checked={isHeightAuto}
            className={classNames(isHeightAuto ? "switch-active" : "switch-disabled")}
            onChange={toggleHeightAuto}
          />
        )}
        {!isHeightAuto && (
          <div>
            <div className="card-item-title">Image Height: {imageHeight}px</div>
            <Slider 
              value={imageHeight} 
              min={50} 
              max={800} 
              onChange={handleHeightChange} 
            />
          </div>
        )}
        
        {cardItemElement(
          t("align"),
          <div className="flex justify-center items-center">
            {[
              { icon: faAlignLeft, value: "left" },
              { icon: faAlignCenter, value: "center" },
              { icon: faAlignRight, value: "right" },
              { icon: faAlignJustify, value: "justify" },
            ].map(({ icon, value }) => {
              return (
                <div
                  key={value}
                  className={classNames(textAlign === value ? "align-style-item-active" : "align-style-item-un_active", "align-style-item")}
                  onClick={() => updateContentTextAlign(value)}
                >
                  <img src={`/images/align-${value}.png`}/>
                </div>
              );
            })}
          </div>
        )}
        <div className="card-item-title">{t("padding_settings")}</div>
        <PaddingSettings
          padding={{
            paddingTop: findStyleItem(currentItem.data.contentStyles, "paddingTop"),
            paddingRight: findStyleItem(currentItem.data.contentStyles, "paddingRight"),
            paddingLeft: findStyleItem(currentItem.data.contentStyles, "paddingLeft"),
            paddingBottom: findStyleItem(currentItem.data.contentStyles, "paddingBottom"),
          }}
          setPadding={updateContentStylesPadding}
        />
      </>
    );
  };
  
  return (
    <div className="margin-y-30">
      {actionSettings()}
      {imageSettings()}
      {imageStyleSettings()}
      {textStylesElement()}
      {PaddingStylesElement()}
    </div>
  );
};

export default AboutBookComponentV2StyleSettings;