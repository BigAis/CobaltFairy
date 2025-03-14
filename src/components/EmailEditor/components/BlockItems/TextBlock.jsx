import { GlobalContext } from "../../reducers";
import RichTextLayout from "../RichText/RichTextLayout";
import { useMemo, useContext } from "react";
import { useAccount } from "../../../../context/AccountContext";
const MAIN_APP_BASE_URL = "https://fairymail.cobaltfairy.com";

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
    let linkcolor = 'inherit';
    if(bodySettings.styles.linkColor) linkcolor = bodySettings.styles.linkColor;
    blockItem.text= `<a href="${account.website}" style="color:${linkcolor}">${account.website}</a><br><a href="mailto:${account.from_email}" style="color:${linkcolor}">${account.from_email}</a>`;
  }
  if(blockItem.subkey && "unsubscribe"==blockItem.subkey){
    let linkcolor = 'inherit';
    if(bodySettings.styles.linkColor) linkcolor = bodySettings.styles.linkColor;
    blockItem.text= `You received this email because you signed up on our website or made a purchase from us.<br><br><a style="color:${linkcolor}" href="${MAIN_APP_BASE_URL}/api/unsubscribe/{{pixel_uid}}/{{pixel_group}}">Unsubscribe</a>`;
  }
  return isEdit ? richTextElement : <div style={{ ...styles }} dangerouslySetInnerHTML={{ __html: blockItem.text }}></div>;
};

export default TextBlock;
