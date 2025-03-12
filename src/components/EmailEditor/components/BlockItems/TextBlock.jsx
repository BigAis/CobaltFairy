import { GlobalContext } from "../../reducers";
import RichTextLayout from "../RichText/RichTextLayout";
import { useMemo, useContext } from "react";
import { useAccount } from "../../../../context/AccountContext";

const TextBlock = (props) => {
  const {user,account} = useAccount();
  const { index, blockItem } = props;
  const { currentItem, previewMode, actionType, bodySettings } = useContext(GlobalContext);
  var styles = previewMode === "desktop" ? blockItem.styles.desktop : { ...blockItem.styles.desktop, ...blockItem.styles.mobile };
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
  if(blockItem.subkey && "footer-links"==blockItem.subkey){
    blockItem.text= `<a href="${account.website}">${account.website}</a><br><a href="mailto:${account.from_email}">${account.from_email}</a>`;
  }
  return isEdit ? richTextElement : <div style={{ ...styles }} dangerouslySetInnerHTML={{ __html: blockItem.text }}></div>;
};

export default TextBlock;
