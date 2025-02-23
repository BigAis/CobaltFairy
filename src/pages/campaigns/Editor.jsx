import { useEffect, useRef, useState } from "react";
import EmailEditor from "../../components/EmailEditor/index";
import PopupText from "../../components/PopupText/PopupText";


function Editor({currentCampaign, setStep}) {
    const emailEditorRef = useRef(null);
    const [language, setLanguage] = useState("en");
    const [design, setDesign] = useState(null);

    const parseDesign = async (des) =>{
        if(des) {
            console.log('in des',des)
            //check if old builder
            if(des.components || des.styles){
                await PopupText.fire({icon:'warning',text:'This campaign was created with the old version of Fairy Mail. You need to edit it with that version.',showCancelButton:false});
                setStep(2);
                return;
            }
            if(des.bodySettings && des.blockList){
                setDesign(des);
                console.log('after set design')
            }
        }
    }
    useEffect(()=>{
        //Should also implement design B here.
        if(currentCampaign && currentCampaign.design){
            let des = JSON.parse(currentCampaign.design)
            parseDesign(des)   
        }else{
            setDesign({blockList:[],bodySettings:[],fontList:[]})
        }
    },[currentCampaign])

    return (
        <div className="editor" style={{width:'100%'}}>
        <div className="editor-content">{currentCampaign && design && design.blockList && <EmailEditor ref={emailEditorRef} blockList={design.blockList} fontList={design.fontList} bodySettings={design.bodySettings} language={language} setStep={setStep} currentCampaign={currentCampaign} />}</div>
        </div>
    );
}

export default Editor;
