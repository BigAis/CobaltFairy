import { useContext } from "react";
import { GlobalContext } from "../../reducers";
import classNames from "../../utils/classNames";
import { InputNumber, Select, Switch, Slider, Input } from "antd";

import ColorPicker from "../ColorPicker";
import PaddingSettings from "./PaddingSettings";
import useLayout from "../../utils/useStyleLayout";
import { deepClone } from "../../utils/helpers";
import useTranslation from "../../translation";
import useDataSource from "../../configs/useDataSource";

const ButtonStyleSettings = () => {
  const { currentItem, previewMode } = useContext(GlobalContext);
  const { t } = useTranslation();
  const { findStyleItem, cardItemElement, colorChange, paddingChange, inputChange, updateItemStyles } = useLayout();

  const buttonActionElement = () => {
    const { linkURL } = currentItem.data;
    console.log('linkURL',linkURL)
    const linkChange = (event) => {
      const newValue = event.target.value;
      const newCurrentItem = deepClone(currentItem);
      newCurrentItem.data.linkURL = newValue;
      console.log('newCurrentItem.data.linkURL',newCurrentItem.data.linkURL)
      updateItemStyles(newCurrentItem.data);
      console.log(newCurrentItem)
    };

    return (
      <div>
        <div className="card-item-title">{t("link_url")}</div>
        <div className="margin-top-6">
          <Input value={linkURL} onChange={linkChange} />
        </div>
      </div>
    );
  };

  const PaddingStylesElement = () => {
    const updateContentStylesPadding = (padding) => {
      const newData = deepClone(currentItem.data);
      newData.contentStyles[previewMode] = {
        ...newData.contentStyles[previewMode],
        ...padding,
      };
      updateItemStyles(newData);
    };

    return (
      <>
        <div className="right-setting-block-item-title"> {t("padding_settings")}</div>
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

  const textStylesElement = () => {
    const width = findStyleItem(currentItem.data.styles, "width");
    const color = findStyleItem(currentItem.data.styles, "color");
    const fontFamily = findStyleItem(currentItem.data.styles, "fontFamily");
    const fontSize = findStyleItem(currentItem.data.styles, "fontSize");
    const lineHeight = findStyleItem(currentItem.data.styles, "lineHeight");
    const backgroundColor = findStyleItem(currentItem.data.styles, "backgroundColor");
    const fontFamilyList = ["sans-serif", "Arial", "Inter", "Verdana", "Times New Roman", "Garamond", "Georgia", "Courier New", "cursive"];
    const { fontsList } = useDataSource();

    return (
      <>
        <div className="right-setting-block-item-title">{t("button_styles")}</div>
        {cardItemElement(
          t("width_auto"),
          <Switch
            checked={width === "auto"}
            className={classNames(width === "auto" ? "switch-active" : "switch-disabled")}
            onChange={() => {
              const value = width === "auto" ? "100%" : "auto";
              inputChange("width")(value);
            }}
          />
        )}
        {width !== "auto" && <Slider value={Number(width.replace("%", ""))} onChange={(value) => inputChange("width")(value + "%")} />}
        {cardItemElement(t("font_color"), <ColorPicker color={color} setColor={colorChange("color")} />)}
        {cardItemElement(t("button_color"), <ColorPicker color={backgroundColor} setColor={colorChange("backgroundColor")} />)}
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
        {cardItemElement(
          t("line_height"),
          <InputNumber
            className="input-width"
            addonAfter="%"
            min={0}
            value={Number(lineHeight.replace("%", ""))}
            onChange={(value) => inputChange("lineHeight")(value + "%")}
          />
        )}
        <div className="card-item-title">{t("button_padding")}</div>
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
  return (
    <div className="margin-y-30">
      {buttonActionElement()}
      {textStylesElement()}
      {PaddingStylesElement()}
    </div>
  );
};

export default ButtonStyleSettings;
