import { useState, useContext, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDesktop, faMobileAlt, faUndo, faRedo, faEye, faTabletAlt, faTimes } from "@fortawesome/free-solid-svg-icons";
import classNames from "../../utils/classNames";
// import { deepClone } from "../../utils/helpers";
import Button from '../../../Button'
import { GlobalContext } from "../../reducers";
import { Drawer } from "antd";
import dataToHtml from "../../utils/dataToHTML";
import { deepClone } from "../../utils/helpers";
import Icon from '../../../Icon/Icon'
import { ApiService } from "../../../../service/api-service";
import { useAccount } from "../../../../context/AccountContext";
import NotificationBar from '../../../NotificationBar/NotificationBar'

const Header = ({setStep,currentCampaign}) => {
  const {user, account } = useAccount();
  const { previewMode, setPreviewMode, bodySettings, blockList, actionType, setBlockList, setBodySettings, editorRef } = useContext(GlobalContext);
  const [notifications,setNotifications] = useState([])
  const [modalPreview, setModalPreview] = useState(previewMode);
  const [blockListHistory, setBlockListHistory] = useState({
    histories: [],
    index: 0,
  });
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const { histories, index } = blockListHistory;
  console.log('currentCampaign',currentCampaign)
  const saveCampaign = async (showConfirmationMsg=true)=>{
    if(editorRef && editorRef.current){
      const html = editorRef.current.exportHtml(['Inter:400,700']);
      const data = editorRef.current.exportData(['Inter:400,700']);
      let updResp = await ApiService.post(`fairymailer/updateCampaign`,{data:{uuid:currentCampaign.uuid,design:JSON.stringify(data),html}},user.jwt)
      console.log('updresp',updResp)
      setNotifications([...notifications,{id:new Date().getTime()/1000,message:'Email data saved successfully.'}])
    }
    return true
  }


  useEffect(() => {
    const newBlockList = deepClone(blockList);
    const newBodySettings = deepClone(bodySettings);
    if (actionType === "firstRender") {
      setBlockListHistory({
        histories: [
          {
            blockList: newBlockList,
            bodySettings: newBodySettings,
          },
        ],
        index: 0,
      });
    } else if (!actionType.includes("set_history")) {
      let newHistories = deepClone(histories);

      newHistories = newHistories.slice(0, index + 1);
      newHistories.push({
        blockList: newBlockList,
        bodySettings: newBodySettings,
      });

      setBlockListHistory({
        histories: newHistories,
        index: index + 1,
      });
    }
  }, [blockList, bodySettings]);

  const closeModal = () => {
    setIsPreviewModalOpen(false);
  };

  const openModal = () => {
    setIsPreviewModalOpen(true);
  };

  const prevHistory = () => {
    if (histories[index - 1]) {
      const newHistories = deepClone(histories[index - 1]);
      setBlockListHistory({ ...blockListHistory, index: index - 1 });
      setBlockList(newHistories.blockList, `set_history_${index - 1}`);
      setBodySettings(newHistories.bodySettings);
    }
  };

  const nextHistory = () => {
    if (histories[index + 1]) {
      const newHistories = deepClone(histories[index + 1]);
      setBlockListHistory({ ...blockListHistory, index: index + 1 });
      setBlockList(newHistories.blockList, `set_history_${index + 1}`);
      setBodySettings(newHistories.bodySettings);
    }
  };

  return (
    <>
      <div className="header">
        <div className="email-editor-notifications">
          {notifications.map(n=>{return (
            <NotificationBar type="warning" message={n.message} onClose={()=>{
              setNotifications(notifications.filter(not=>not.id!=n.id))
            }}/>
          )
          })}
          {}
        </div>
        <div className="header-box" style={{textAlign:'left'}}>
          <Button 
          type="secondary" 
          icon="Desktop" 
          style={{padding:'5px'}}
          onClick={() => setPreviewMode("desktop")}
            className={classNames(
              "header-icon-small",
              previewMode === "desktop" && "header-icon_active",
              previewMode !== "desktop" && "header-icon_disabled"
            )}
          ></Button>
          <Button 
          type="secondary" 
          icon="Tablet" 
          style={{padding:'5px'}}
          onClick={() => setPreviewMode("tablet")}
            className={classNames(
              "header-icon-small",
              previewMode === "tablet" && "header-icon_active",
              previewMode !== "tablet" && "header-icon_disabled"
            )}
          ></Button>
          <Button 
          type="secondary" 
          icon="Mobile" 
          style={{padding:'5px'}}
          onClick={() => setPreviewMode("mobile")}
            className={classNames(
              "header-icon-small",
              previewMode === "mobile" && "header-icon_active",
              previewMode !== "mobile" && "header-icon_disabled"
            )}
          ></Button>
        </div>
        <div className="header-box text-center">
        <Button style={{margin:'0 10px'}} icon="Save" type="secondary" className={'savebtn'} onClick={()=>{
          saveCampaign();
        }}>Save</Button>
        <Button style={{margin:'0 10px'}} icon="Export" type="secondary" className={'exportbtn'} onClick={()=>{exportHTML()}}>Export</Button>
        </div>
        <div className="header-box text-right">
          <Icon
            onClick={prevHistory}
            name="Undo"
            className={classNames(
              "header-icon-history",
              histories[index - 1] && "header-icon-history_active",
              !histories[index - 1] && "header-icon-history_disabled"
            )}
          />
          <Icon
            onClick={nextHistory}
            name="Redo"
            className={classNames(
              "header-icon-history",
              histories[index + 1] && "header-icon-history_active",
              !histories[index + 1] && "header-icon-history_disabled"
            )}
          />
          <Button style={{margin:'0 10px', marginLeft:'20px'}} type="secondary" onClick={openModal}>Preview</Button>
          <Button style={{margin:'0 10px'}} onClick={ async ()=>{ 
            let savedData = await saveCampaign();
            if(savedData) setStep(4)
           }}>Done Editing</Button>
        </div>
      </div>

      <Drawer
        title={
          <div className="flex justify-between">
            <div className="header-box text-center"></div>
            <div className="header-box text-center">
              <Icon
                onClick={() => {
                  setModalPreview("desktop");
                  setPreviewMode("desktop");
                }}
                name="Desktop"
                className={classNames(
                  "header-icon",
                  modalPreview === "desktop" && "header-icon_active",
                  modalPreview !== "desktop" && "header-icon_disabled"
                )}
              />
              <Icon
                name="Tablet"
                onClick={() => {
                  setModalPreview("tablet");
                }}
                className={classNames(
                  "header-icon",
                  modalPreview === "tablet" && "header-icon_active",
                  modalPreview !== "tablet" && "header-icon_disabled"
                )}
              />
              <Icon
                name="Mobile"
                onClick={() => {
                  setModalPreview("mobile");
                  setPreviewMode("mobile");
                }}
                className={classNames(
                  "header-icon",
                  modalPreview === "mobile" && "header-icon_active",
                  modalPreview !== "mobile" && "header-icon_disabled"
                )}
              />
            </div>
            <div className="header-box text-right">
              <div onClick={closeModal} className="header-drawer-close">
                <FontAwesomeIcon icon={faTimes} className="text-sm" />
              </div>
            </div>
          </div>
        }
        open={isPreviewModalOpen}
        zIndex={1100}
        closable={false}
        onCancel={closeModal}
        footer={false}
        width="100vw"
        style={{
          top: 0,
          bottom: 0,
          padding: 0,
          height: "100%",
        }}
        cont
      >
        <div
          className="header-drawer-body"
          style={{
            width: (modalPreview === "desktop" && "100%") || (modalPreview === "tablet" && 768) || (modalPreview === "mobile" && 364),
          }}
        >
          <div className="header-drawer-head">
            <div className="header-drawer-head-item"></div>
            <div className="header-drawer-head-item"></div>
            <div className="header-drawer-head-item"></div>
          </div>
          <div className="header-drawer-content">
            <iframe
              src={"data:text/html," + encodeURIComponent(dataToHtml({ bodySettings, blockList }))}
              title="preview"
              scrolling="no"
              className="header-drawer-iframe"
            ></iframe>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default Header;
