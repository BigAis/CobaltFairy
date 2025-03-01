import { useContext } from "react";
import { GlobalContext } from "../../reducers";
import RichTextLayout from "../RichText/RichTextLayout";
import { useMemo } from "react";
import { useAccount } from "../../../../context/AccountContext";

const TextBlock = (props) => {
  const {user,account} = useAccount();
  const { index, blockItem } = props;
  const { currentItem, previewMode, actionType } = useContext(GlobalContext);
  const styles = previewMode === "desktop" ? blockItem.styles.desktop : { ...blockItem.styles.desktop, ...blockItem.styles.mobile };
  const isEdit = currentItem && currentItem.index === index;
  const richTextElement = useMemo(() => <RichTextLayout {...props} />, [isEdit, actionType]);
  if(blockItem.subkey && "footer-links"==blockItem.subkey){
    blockItem.text= `<a href="${account.website}">${account.website}</a><br><a href="mailto:${account.from_email}">${account.from_email}</a>`;
  }
  return isEdit ? richTextElement : <div style={{ ...styles }} dangerouslySetInnerHTML={{ __html: blockItem.text }}></div>;
};

export default TextBlock;
