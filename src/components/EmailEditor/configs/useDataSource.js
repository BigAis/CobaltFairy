import useTranslation from "../translation";
import getBlockConfigsList from "./getBlockConfigsList";
import getColumnsSettings from "./getColumnsSettings";
import getColumnConfigFunc from "./getColumnConfigFunc";
import getFontsList from "./getFontsList";

const useDataSource = () => {
  const { t } = useTranslation();
  const blockConfigsList = getBlockConfigsList(t);
  const columnsSetting = getColumnsSettings(t);
  const getColumnConfig = getColumnConfigFunc(t);
  const fontsList = getFontsList();

  return {
    blockConfigsList,
    columnsSetting,
    getColumnConfig,
    fontsList
  };
};

export default useDataSource;
