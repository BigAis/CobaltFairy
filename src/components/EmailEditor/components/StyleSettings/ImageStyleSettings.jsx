import { useContext, useState } from "react";
import { GlobalContext } from "../../reducers";
import classNames from "../../utils/classNames";
import { Switch, Slider, Input } from "antd";
import { deepClone } from "../../utils/helpers";
import PaddingSettings from "./PaddingSettings";
import useLayout from "../../utils/useStyleLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAlignCenter, faAlignLeft, faAlignRight, faAlignJustify } from "@fortawesome/free-solid-svg-icons";
import useTranslation from "../../translation";
import ImageUploadPopup from "./ImageUploadPopup"
import Button from "../../../Button"

const ImageStyleSettings = () => {
  const { currentItem, previewMode } = useContext(GlobalContext);
  const [ pickerVisible, setPickerVisible ] = useState(false)
  const { t } = useTranslation();
  const { findStyleItem, cardItemElement, inputChange, updateItemStyles } = useLayout();

  const actionSettings = () => {
    const { linkURL } = currentItem.data;

    const linkChange = (event) => {
      const newValue = event.target.value;
      const newCurrentItem = deepClone(currentItem);
      newCurrentItem.data.linkURL = newValue;
      updateItemStyles(newCurrentItem.data);
    };
    const clearLink = () => {
      const newCurrentItem = deepClone(currentItem);
      newCurrentItem.data.linkURL = '';
      updateItemStyles(newCurrentItem.data);
    };

    return (
      <>
        {/* {cardItemElement(t("action_type"), <div className="link-tag">{t("link")}</div>)} */}
        <div className="card-item-title">{t("link_url")}</div>
        <div className="margin-top-6">
          <Input value={linkURL} onChange={linkChange} />
          <a style={{fontSize:'12px',float:'right'}} onClick={clearLink}>Clear</a>
          {/* addonBefore="https://" */}
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

    const pickImage = (src) =>{
      const newCurrentItem = deepClone(currentItem);
      newCurrentItem.data['src'] = src;
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
        {width !== "auto" && <Slider value={Number(width.replace("%", ""))} onChange={(value) => inputChange("width")(value + "%")} />}
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
                  {/* <FontAwesomeIcon icon={icon} className="tag-style-size" /> */}
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
    </div>
  );
};

export default ImageStyleSettings;
