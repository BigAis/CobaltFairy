import { useContext } from "react";
import { GlobalContext } from "../../reducers";
import RichTextLayout from "../RichText/RichTextLayout";
import { useMemo } from "react";

const ButtonBlock = (props) => {
  const { blockItem, index } = props;
  const { currentItem, previewMode, actionType, bodySettings } = useContext(GlobalContext);

  //TODO: border radius
  const isEdit = currentItem && currentItem.index === index;
  var styles = previewMode === "desktop" ? blockItem.styles.desktop : { ...blockItem.styles.desktop, ...blockItem.styles.mobile };
  if(bodySettings && bodySettings.styles){
    try{
      if(bodySettings.styles.fontFamily) styles.fontFamily = bodySettings.styles.fontFamily
    }catch(err){
      console.log(err)
    }
  }

  const contentStyles =
    previewMode === "desktop" ? blockItem.contentStyles?.desktop : { ...blockItem.contentStyles?.desktop, ...blockItem.contentStyles?.mobile };

  const richTextElement = useMemo(() => <RichTextLayout {...props} />, [isEdit, actionType]);
  return (
    <div style={{ ...contentStyles }}>
      {isEdit ? richTextElement : <div style={{ ...styles }} dangerouslySetInnerHTML={{ __html: blockItem.text }}></div>}
    </div>
  );
};

export default ButtonBlock;
