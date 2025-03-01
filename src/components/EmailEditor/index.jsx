import { useReducer, forwardRef, useImperativeHandle } from "react";
import {
  GlobalContext,
  reducer,
  setBlockList,
  setActionType,
  setPreviewMode,
  setCurrentItem,
  setBodySettings,
  setIsDragStart,
  setSelectionRange,
  setTextRange,
  defaultState,
  setLanguage,
  setLanguageLibraries,
} from "./reducers";
import dataToHtml from "./utils/dataToHTML";
import Main from "./components/Main/index";
import "./assets/App.css";

const EmailEditor = forwardRef(({ blockList, bodySettings, fontList, language = "en", customLanguageLibraries, setStep, currentCampaign}, ref) => {
  // console.log('bodySettings',bodySettings)
  const [state, dispatch] = useReducer(reducer, {
    ...defaultState,
    fontList: fontList ?? [],
    bodySettings: bodySettings&&bodySettings.styles ? bodySettings : defaultState.bodySettings,
    blockList: blockList ?? defaultState.blockList,
    languageLibraries: customLanguageLibraries,
  });
  useImperativeHandle(ref, () => ({
    blockList: state.blockList,
    actionType: state.actionType,
    exportHtml: (fontList=[]) => dataToHtml({ bodySettings: state.bodySettings, blockList: state.blockList, fontList }),
    exportData: (fontList=[]) => {return { bodySettings: state.bodySettings, blockList: state.blockList, fontList }},
  }));

  return (
    <GlobalContext.Provider
      value={{
        editorRef: ref,
        blockList: state.blockList,
        actionType: state.actionType,
        previewMode: state.previewMode,
        currentItem: state.currentItem,
        bodySettings: state.bodySettings,
        isDragStart: state.isDragStart,
        selectionRange: state.selectionRange,
        textRange: state.textRange,
        language: state.language,
        languageLibraries: state.languageLibraries,
        setIsDragStart: (isDragStart) => {
          dispatch(setIsDragStart(isDragStart));
        },
        setBodySettings: (bodySettings, actionType) => {
          actionType && dispatch(setActionType(actionType));
          dispatch(setBodySettings(bodySettings));
        },
        setBlockList: (blockList, actionType) => {
          actionType && dispatch(setActionType(actionType));
          dispatch(setBlockList(blockList));
        },
        setPreviewMode: (previewMode) => {
          dispatch(setPreviewMode(previewMode));
        },
        setCurrentItem: (currentItem) => {
          dispatch(setCurrentItem(currentItem));
        },
        setSelectionRange: (selectionRange) => {
          dispatch(setSelectionRange(selectionRange));
        },
        setTextRange: (textRange) => {
          dispatch(setTextRange(textRange));
        },
        setActionType: (actionType) => {
          dispatch(setActionType(actionType));
        },
        setLanguage: (language) => {
          dispatch(setLanguage(language));
        },
        setLanguageLibraries: (languageLibraries) => {
          dispatch(setLanguageLibraries(languageLibraries));
        },
      }}
    >
      <Main language={language} setStep={setStep} currentCampaign={currentCampaign}/>
    </GlobalContext.Provider>
  );
});

export default EmailEditor;
