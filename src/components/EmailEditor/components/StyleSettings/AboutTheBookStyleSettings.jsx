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

const AboutTheBookStyleSettings = () => {
    const { currentItem, previewMode, setCurrentItem } = useContext(GlobalContext);
    const [ pickerVisible, setPickerVisible ] = useState(false);
    const [ imageWidth, setImageWidth ] = useState(50);
    const { t } = useTranslation();
    const { findStyleItem, cardItemElement, inputChange, updateItemStyles, colorChange, paddingChange, otherStylesChange, } = useLayout();

  // When the component loads or currentItem changes, update the image width state
  useEffect(() => {
    if (currentItem?.data?.styles?.desktop?.width) {
      const width = currentItem.data.styles.desktop.width;
      if (width.includes('%')) {
        setImageWidth(parseInt(width));
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

    const pickImage = (src) => {
      const newCurrentItem = deepClone(currentItem);
      newCurrentItem.data['src'] = src;
      
      // Set float based on image width
      const width = imageWidth || 50;
      newCurrentItem.data['styles'].desktop.float = width > 65 ? 'none' : 'right';
      newCurrentItem.data['styles'].desktop.marginLeft = width > 65 ? '0' : '20px';
      newCurrentItem.data['styles'].desktop.marginBottom = width > 65 ? '20px' : '0';
      
      // Get image height for reference
      setTimeout(() => {
        const img = document.querySelector('img[src="'+src+'"]');
        if (img) {
          newCurrentItem.data['imgHeight'] = img.clientHeight;
          updateItemStyles(newCurrentItem.data);
        }
      }, 100);
      
      updateItemStyles(newCurrentItem.data);
    }

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
    const width = findStyleItem(currentItem.data.styles, "width");
    const textAlign = findStyleItem(currentItem.data.contentStyles, "textAlign");
    
  const handleWidthChange = (value) => {
    setImageWidth(value);
    
    const newData = deepClone(currentItem.data);
    newData.styles[previewMode].width = value + "%";
    
    // Adjust layout based on width
    const useVerticalLayout = value > 35;
    
    if (useVerticalLayout) {
      // Vertical layout (text below image)
      newData.styles[previewMode].float = "none";
      newData.styles[previewMode].marginRight = "0";
      newData.styles[previewMode].marginBottom = "20px";
    } else {
      // Side-by-side layout
      newData.styles[previewMode].float = "left";
      newData.styles[previewMode].marginRight = "20px";
      newData.styles[previewMode].marginBottom = "0";
    }
    
    updateItemStyles(newData);
  };
    
    return (
      <>
        <div className="right-setting-block-item-title">{t("image_styles")}</div>
        {cardItemElement(
          t("width_auto"),
          <Switch
            checked={width === "auto"}
            className={classNames(width === "auto" ? "bg-sky-500" : "bg-gray-400")}
            onChange={() => {
              const value = width === "auto" ? "100%" : "auto";
              inputChange("width")(value);
            }}
          />
        )}
        {width !== "auto" && (
          <div>
            <div className="card-item-title">Image Width: {imageWidth}%</div>
            <Slider 
              value={imageWidth} 
              min={10} 
              max={100} 
              onChange={handleWidthChange} 
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

export default AboutTheBookStyleSettings;