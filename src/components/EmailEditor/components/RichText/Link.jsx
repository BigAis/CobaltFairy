import { useMemo, useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faUnlink } from "@fortawesome/free-solid-svg-icons";
import useSection from "../../utils/useSection";
import classNames from "../../utils/classNames";
import { GlobalContext } from "../../reducers";
import { Modal, Input } from "antd";
import PopupText from '../../../PopupText/PopupText'

const Link = ({ modifyText, setTextContent }) => {
  const { selectionRange, blockList } = useContext(GlobalContext);
  const { getSelectionNode } = useSection();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputConfig, setInputConfig] = useState({
    value: "",
    range: null,
  });

  const node = useMemo(() => {
    if (selectionRange) {
      return getSelectionNode(selectionRange.commonAncestorContainer, "a");
    } else {
      return null;
    }
  }, [selectionRange, blockList]);

  const addLink = () => {
    const { range, value, rangeIsLink } = inputConfig;
    if (rangeIsLink) {
      range.commonAncestorContainer.parentNode.href = value;
    } else {
      let link = document.createElement("a");
      link.target = "_black";
      link.href = value;
      range.surroundContents(link);
    }

    setTextContent();
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setInputConfig({ value: "", range: null });
  };

  const addLinkTag = async () => {
    let selection = window.getSelection();
    let range = selection.getRangeAt(0);
    const rangeParentNode = range.commonAncestorContainer.parentNode;
    const rangeIsLink = rangeParentNode.nodeName === "A";
    const newInputConfig = { ...inputConfig, range };
    if (rangeIsLink) {
      if(rangeParentNode.href.includes('api/unsubscribe') && rangeParentNode.href.includes('pixel_uid')){
        await PopupText.fire({text:'Unsubscribe links cannot be edited.',showCancelButton:false})
        return;
      }
      newInputConfig.rangeIsLink = true;
      newInputConfig.value = rangeParentNode.href.replace("https://", "").replace("http://","");
    }
    setInputConfig(newInputConfig);
    setIsModalOpen(true);
    setTextContent();
  };

  return (
    <>
      <button className={classNames("rich-text-tools-button ", node && "rich-text-tools-button-active")} title="Link" onClick={addLinkTag}>
        <FontAwesomeIcon icon={faLink} className="rich-text-tools-button-icon" />
      </button>
      <button
        className={classNames("rich-text-tools-button")}
        title="Remove link"
        onClick={ async () => {
          let selection = window.getSelection();
          let range = selection.getRangeAt(0);
          const rangeParentNode = range.commonAncestorContainer.parentNode;
          if(rangeParentNode.href.includes('api/unsubscribe') && rangeParentNode.href.includes('pixel_uid')){
            await PopupText.fire({text:'Unsubscribe links cannot be removed.',showCancelButton:false})
            return;
          }
          modifyText("unlink", false, null);
          setTextContent();
        }}
      >
        <FontAwesomeIcon icon={faUnlink} className="rich-text-tools-button-icon" />
      </button>
      <Modal title="Link URL" open={isModalOpen} zIndex={1100} onOk={addLink} onCancel={closeModal} okText="Ok" cancelText="Cancel">
        <Input
          addonBefore="https://"
          value={inputConfig.value.replace("https://", "")}
          onChange={(event) => setInputConfig({ ...inputConfig, value: "https://" + event.target.value })}
        />
      </Modal>
    </>
  );
};

export default Link;
