import { useRef, useState } from "react";
import EmailEditor from "../../components/EmailEditor/index";


function Editor() {
  const emailEditorRef = useRef(null);
  const [emailData, setEmailData] = useState([]);
  const [language, setLanguage] = useState("en");

  return (
    <div className="editor" style={{width:'100%'}}>
      <div className="editor-content">{emailData && <EmailEditor ref={emailEditorRef} defaultBlockList={[]} language={language} />}</div>
    </div>
  );
}

export default Editor;
