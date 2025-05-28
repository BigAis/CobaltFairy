import { useContext } from "react";
import { GlobalContext } from "../reducers";
import { deepClone } from "./helpers";

const useLayout = () => {
  const { previewMode, currentItem, blockList, setBlockList, setCurrentItem } = useContext(GlobalContext);

  const findStyleItem = (styles, key) => {
    if(!styles || !styles[previewMode]) return "";
    let styleItem = styles[previewMode][key];
    if (!styleItem) {
      styleItem = styles["desktop"][key];
    }
    return styleItem;
  };

  const cardItemElement = (title, dom) => {
    return (
      <div className="card-item">
        <div className="card-item-title">{title}</div>
        <div>{dom}</div>
      </div>
    );
  };

  const colorChange = (key) => (color) => {
    const newCurrentItem = deepClone(currentItem);
    
    // Handle rgba when opacity is less than 1
    let colorValue;
    if (color.rgb && color.rgb.a < 1) {
      const { r, g, b, a } = color.rgb;
      colorValue = `rgba(${r}, ${g}, ${b}, ${a})`;
    } else {
      colorValue = color.hex;
    }
    
    newCurrentItem.data.styles[previewMode][key] = colorValue;
    updateItemStyles(newCurrentItem.data);
  };

  const paddingChange = (padding) => {
    const newData = deepClone(currentItem.data);
    newData.styles[previewMode] = {
      ...newData.styles[previewMode],
      ...padding,
    };
    updateItemStyles(newData);
  };

  const inputChange = (key) => (value) => {
    const newData = deepClone(currentItem.data);
    newData.styles[previewMode][key] = value;
    if(key=="width" && newData.key=="image" && newData.parentKey && newData.parentKey=="about_the_book"){
      newData['imgHeight'] = document.querySelector('img[src="'+newData.src+'"]').clientHeight+12
    }
    updateItemStyles(newData);
  };

  const otherStylesChange = (key, value) => {
    const newData = deepClone(currentItem.data);
    newData.styles[previewMode][key] = value;
    updateItemStyles(newData);
  };

  const updateItemStyles = (newData) => {
    const newCurrentItem = deepClone(currentItem);
    const newBlockList = deepClone(blockList);
    newCurrentItem.data = {
      ...newData,
    };
    if (newData.key === "column") {
      newBlockList[currentItem.index] = newData;
    } else {
      const indexArr = currentItem.index.split("-");
      newBlockList[indexArr[0]].children[indexArr[1]].children[indexArr[2]] = newData;
    }

    setBlockList(newBlockList, `edit_${new Date().getTime()}`);
    setCurrentItem(newCurrentItem);
  };

  return {
    findStyleItem,
    cardItemElement,
    updateItemStyles,
    colorChange,
    paddingChange,
    otherStylesChange,
    inputChange,
  };
};

export default useLayout;
