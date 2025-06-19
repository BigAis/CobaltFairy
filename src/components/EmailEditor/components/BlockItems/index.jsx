import TextBlock from "./TextBlock";
import HeadingBlock from "./HeadingBlock";
import ButtonBlock from "./ButtonBlock";
import DividerBlock from "./DividerBlock";
import ImageBlock from "./ImageBlock";
import SocialLinkBlocks from "./SocialLinkBlocks";
import AboutTheBookBlock from "./AboutTheBookBlock";
import AboutBookComponentV2 from "./AboutBookComponentV2";

const BlockItems = ({ blockItem, index }) => {
  return (
    <>
      {blockItem && blockItem.key === "text" && <TextBlock blockItem={blockItem} index={index} />}
      {blockItem && blockItem.key === "heading" && <HeadingBlock blockItem={blockItem} index={index} />}
      {blockItem && blockItem.key === "button" && <ButtonBlock blockItem={blockItem} index={index} />}
      {blockItem && blockItem.key === "divider" && <DividerBlock blockItem={blockItem} index={index} />}
      {blockItem && blockItem.key === "image" && <ImageBlock blockItem={blockItem} index={index} />}
      {blockItem && blockItem.key === "about_the_book" && <AboutTheBookBlock blockItem={blockItem} index={index} />}
      {blockItem && blockItem.key === "about_book_v2" && <AboutBookComponentV2 blockItem={blockItem} index={index} />}
      {blockItem && blockItem.key === "social_link" && <SocialLinkBlocks blockItem={blockItem} index={index} />}
    </>
  );
};

export default BlockItems;