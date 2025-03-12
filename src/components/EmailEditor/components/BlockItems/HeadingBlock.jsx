import { useContext } from "react";
import { GlobalContext } from "../../reducers";
import RichTextLayout from "../RichText/RichTextLayout";
import { useMemo } from "react";

const HeadingBlock = (props) => {
  const { index, blockItem } = props;
  const { currentItem, previewMode, actionType, bodySettings } = useContext(GlobalContext);
  var styles = previewMode === "desktop" ? blockItem.styles.desktop : { ...blockItem.styles.desktop, ...blockItem.styles.mobile };
  console.log(styles,bodySettings)
  if(bodySettings && bodySettings.styles){
    try{
      if(bodySettings.styles.fontFamily) styles.fontFamily = bodySettings.styles.fontFamily
      if(bodySettings.styles.color) styles.color = bodySettings.styles.color
    }catch(err){
      console.log(err)
    }
  }
  const isEdit = currentItem && currentItem.index === index;
  const richTextElement = useMemo(() => <RichTextLayout {...props} />, [isEdit, actionType]);

  return isEdit ? richTextElement : <div style={{ ...styles }} dangerouslySetInnerHTML={{ __html: blockItem.text }}></div>;
};

export default HeadingBlock;
