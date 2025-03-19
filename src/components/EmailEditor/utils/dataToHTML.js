import getFontsList from "../configs/getFontsList";
const PIXEL_URL = 'https://fairymail.cobaltfairy.com/api'


const createStyleString = (className, styles) => {
  const regex = new RegExp(/[A-Z]/g);
  const kebabCase = (str) => str.replace(regex, (v) => `-${v.toLowerCase()}`);

  let stylesConfig = {
      className: className,
      desktop: "",
      mobile: "",
    };
    for (let item of Object.entries(styles.desktop)) {
      if (item[1] && item[0] !== "contentBackground") {
        stylesConfig.desktop += `${kebabCase(item[0])}:${typeof item[1] === "number" ? item[1] + "px" : item[1]};`;
      }
    }
  
    if (Object.keys(styles.mobile).length) {
      let mobile = "";
      for (let item of Object.entries(styles.mobile)) {
        if (item[1] && item[0] !== "contentBackground") {
          mobile += `${kebabCase(item[0])}:${typeof item[1] === "number" ? item[1] + "px" : item[1]} !important;`;
        }
      }
  
      stylesConfig.mobile += `@media(max-width:620px){
      .${className} {
          ${mobile}
        }
      }`;
    }


  return stylesConfig;
};

const createStyleTag = (list, styles = "", parentIndex) => {
  let injectionList = {}
  let newBlockList = list.map((item, index) => {
    if(item.key=="about_the_book"){
      let newItem1 = parseItem({...item.image,name:'Image',key:'image'},index,styles,parentIndex)
      let newItem2 = parseItem({...item.text,name:'Text',key:'text'},index,styles,parentIndex)
      injectionList[index] = newItem2
      return {
        ...newItem1,
      };
    }
    let newItem=parseItem(item)
    return {
      ...newItem,
    };
  });
  for(const injectionIndex of Object.keys(injectionList)){
    newBlockList.splice(injectionIndex+1, 0, injectionList[injectionIndex]);
  }
  return {
    newBlockList,
    styles,
  };
};

const parseItem = (item, index, styles, parentIndex) => {
  let newItem = item;
  if(newItem.parentKey && newItem.parentKey=="about_the_book"){
    index="about_the_book";
  }
  newItem.styleConfig = createStyleString(parentIndex ? `${parentIndex}-${item.key}-${index}` : `${item.key}-${index}`, item.styles);
  if (newItem.contentStyles) {
    newItem.contentStyleConfig = createStyleString(`${item.key}-content-${index}`, item.contentStyles);

    if (newItem.contentStyleConfig.mobile) {
      styles += newItem.contentStyleConfig.mobile;
    }
  }
  if (newItem.styleConfig.mobile) {
    styles += newItem.styleConfig.mobile;
  }
  if (item.styles.desktop.contentBackground) {
    newItem.contentStyleConfig = {
      className: `${item.key}-content-${index}`,
      desktop: `background-color:${item.styles.desktop.contentBackground};`,
      mobile: "",
    };
  }
  if(!newItem.contentStyleConfig) newItem.contentStyleConfig={}
  if (item.styles.mobile.contentBackground) {
    newItem.contentStyleConfig.mobile = ` @media(max-width:620px){
      .${newItem.contentStyleConfig.className} {background-color:${item.styles.mobile.contentBackground};}
      }`;
    styles += newItem.contentStyleConfig.mobile;
  }
  if(newItem.parentKey && newItem.parentKey=="about_the_book"){
    newItem.contentStyleConfig.mobile = ` @media(max-width:620px){
      .image-content-about_the_book {width:100%;}
    }`;
    if(!newItem.contentStyleConfig.mobile) newItem.contentStyleConfig.mobile = {}
    newItem.contentStyleConfig.mobile += ";width:100%;"
    styles += newItem.contentStyleConfig.mobile;
  }
  if (item.children?.length) {
    const { newBlockList: childrenList, styles: childrenStyles } = createStyleTag(item.children, styles, index);
    styles += childrenStyles;
    newItem.children = childrenList;
  }
  return newItem;
}

const createImageString = (imageConfig) => {
  if(!imageConfig.linkURL.includes("://")) imageConfig.linkURL = `https://${imageConfig.linkURL}`
  const imageString = `<img src="${imageConfig.src}" alt="${imageConfig.alt}" style="max-width:100%;${imageConfig.styleConfig.desktop}" 
      ${imageConfig.styleConfig.mobile ? `class="${imageConfig.styleConfig.className}"` : ""}/> `
  return `<div ${imageConfig.contentStyleConfig.mobile ? `class="${imageConfig.contentStyleConfig.className}"` : ""} 
  style="${imageConfig.contentStyleConfig.desktop}">
      ${imageConfig.linkURL && imageConfig.linkURL.length>0 ? `<a href="${imageConfig.linkURL}" target="_blank">${imageString}</a>` : imageString}
  </div>`;
};

const createTextString = (textBlock) => {
  return `<div ${textBlock.styleConfig.mobile ? `class="${textBlock.styleConfig.className}"` : ""} 
  style="${textBlock.styleConfig.desktop}">${textBlock.text}</div>`;
};

const createHeaderString = (headerBlock) => {
  return `<${headerBlock.type} ${headerBlock.styleConfig.mobile ? `class="${headerBlock.styleConfig.className}"` : ""} 
  style="${headerBlock.styleConfig.desktop}">
  ${headerBlock.text}
  </${headerBlock.type}>`;
};

const createButtonString = (buttonBlock) => {
  return `<div ${buttonBlock.contentStyleConfig.mobile ? `class="${buttonBlock.contentStyleConfig.className}"` : ""} 
  style="${buttonBlock.contentStyleConfig.desktop}">
    <a ${buttonBlock.styleConfig.mobile ? `class="${buttonBlock.styleConfig.className}"` : ""} 
    style="${buttonBlock.styleConfig.desktop}" target="_black" href="https://${buttonBlock.linkURL}">${buttonBlock.text}</a>
  </div>`;
};

const createDividerString = (dividerBLock) => {
  return `<div ${dividerBLock.contentStyleConfig.mobile ? `class="${dividerBLock.contentStyleConfig.className}"` : ""} 
  style="${dividerBLock.contentStyleConfig.desktop}">
    <div ${dividerBLock.styleConfig.mobile ? `class="${dividerBLock.styleConfig.className}"` : ""} 
    style="${dividerBLock.styleConfig.desktop}"></div>
  </div>`;
};

const createSocialLinkString = (socialLinkBlock) => {
  return `<div ${socialLinkBlock.contentStyleConfig.mobile ? `class="${socialLinkBlock.contentStyleConfig.className}"` : ""} 
  style="${socialLinkBlock.contentStyleConfig.desktop}">
    ${socialLinkBlock.list
      .map((socialLinkItem) => {
        const { image, title, linkURL } = socialLinkItem;
        return `<a target="_black" href="https://${linkURL}" style="${socialLinkBlock.styleConfig.desktop};display:inline-block;">
        <img src="${image}" alt="${title}" style="width:${socialLinkBlock.imageWidth}px;" 
        ${socialLinkBlock.styleConfig.mobile ? `class="${socialLinkBlock.styleConfig.className}"` : ""}/> 
      </a>`;
      })
      .join("")}
  </div>`;
};

const blockListToHtml = (blockList, bodySettings) => {
  let content = "";
  blockList.forEach((item) => {
    if (item.key === "column") {
      content += `<div ${item.styleConfig.mobile ? `class="${item.styleConfig.className}"` : ""} 
      style="${item.styleConfig.desktop};width:100%;display:block;">
        <table ${item.contentStyleConfig.mobile ? `class="${item.contentStyleConfig.className}"` : ""} 
        style="width:100%;max-width:${bodySettings.contentWidth}px;margin:0 auto;${item.contentStyleConfig.desktop}">
      <tbody><tr>${blockListToHtml(item.children)}</tr></tbody>
       </table></div>`;
    }

    if (item.key === "content") {
      content += `<td ${item.styleConfig.mobile ? `class="${item.styleConfig.className}"` : ""} 
      style="width:${item.width}; ${item.styleConfig.desktop}">${blockListToHtml(item.children)}</td>`;
    }

    if (item.key === "text") {
      content += createTextString(item);
    }

    if (item.key === "heading") {
      content += createHeaderString(item);
    }

    if (item.key === "image") {
      content += createImageString(item);
    }

    if (item.key === "button") {
      content += createButtonString(item);
    }

    if (item.key === "divider") {
      content += createDividerString(item);
    }

    if (item.key === "social_link") {
      content += createSocialLinkString(item);
    }
    if (item.key === "about_the_book") {
      if(item.image?.contentStyles?.desktop?.paddingTop==12) item.image.contentStyles.desktop.paddingTop=0;
      if(item.image?.contentStyles?.desktop?.paddingBottom==12) item.image.contentStyles.desktop.paddingBottom=0;
      if(item.text?.contentStyles?.desktop?.paddingTop==12) item.text.contentStyles.desktop.paddingTop=0;
      content += createImageString(item.image);
      content += createTextString(item.text);
    }
  });

  return content;
};

const extractFonts = (blockList=[], fontList=[]) => {
  const availFonts = getFontsList();
  for(const block of blockList){
    if(block.styles && block.styles.desktop && block.styles.desktop.fontFamily){
      let f = availFonts.filter(font=>{if(font.family && font.attribute==block.styles.desktop.fontFamily) return font;})
      if(!f || f.length<1) continue;
      if(!fontList.includes(f) && f[0].family) fontList.push(f[0].family)
    }
    if(block.styles && block.styles.mobile && block.styles.mobile.fontFamily){
      let f = availFonts.filter(font=>{if(font.family && font.attribute==block.styles.mobile.fontFamily) return font;})
      if(!f || f.length<1) continue;
      if(!fontList.includes(f) && f[0].family) fontList.push(f[0].family)
    }
    if(block.children) fontList = [...fontList, ...extractFonts(block.children,fontList)];
  }
  return fontList;
}
const extractUrls = (htmlText) => {
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?[\w.-]+(?:\.[a-z]{2,})+(?:\/[\w@?^=%&/~+#{}*-]*)*/gi
  const matches = htmlText.match(urlRegex)
  return [...new Set(matches)]
}
const dataToHtml = ({ bodySettings, blockList, campaignUUID="" }) => {
  const fontList = extractFonts(blockList); //recursively itterate blocklist to export all fonts, and find the required urls to add.
  let content = "";
  const { newBlockList, styles } = createStyleTag(blockList);
  content = blockListToHtml(newBlockList, bodySettings);
  let links = extractUrls(content)

  if (links)
    for (let l = 0; l < links.length; l++) {
      if (links[l].includes('fairymail.cobaltfairy.com') || links[l].includes('cdn.cobaltfairy.online') || links[l].includes('cdn.cobaltfairy.com')) {
        continue
      }
      if (links[l].includes(' ')) links[l] = links[l].split(' ')[0]
      if (
        !links[l].includes('.jpg') &&
        !links[l].includes('.jpeg') &&
        !links[l].includes('.png') &&
        !links[l].includes('.gif') &&
        !links[l].includes('.webp') &&
        !links[l].includes('.svg') &&
        !links[l].includes('cdn.cobaltfairy.online') &&
        !links[l].includes('cdn.cobaltfairy.com')
      ) {
        if (links[l].includes('"')) links[l] = links[l].split('"')[0]
        if (!links[l].startsWith('http')) links[l] = `http://${links[l]}`
        content = content
          .split(links[l])
          .join(
            `${PIXEL_URL}/custom/redir?cid=${campaignUUID}&uid={{pixel_uid}}&v={{cmp_version}}&r=${encodeURIComponent(links[l])}`
          )
      }
      content = content.split('https://https://').join('https://').split('https://http://').join('https://')
    }
  let fontStyles = "";
  let fontMediaStyles = "";
  let pixel = `${PIXEL_URL}/custom/pixel.gif?cid=${campaignUUID}&uid={{pixel_uid}}&v={{cmp_version}}`
  if(fontList.length>0) {
    fontStyles += `
      <!--[if mso]>
      <!--style>
        * {
        font-family: sans-serif !important;
      }
      </style-->
      <![endif]-->
      <!--[if !mso]><!-->
      `;
      for(const font of fontList){
        fontStyles += ` <link href='https://fonts.googleapis.com/css?family=${font}' rel='stylesheet' type='text/css'> `
        fontMediaStyles += ` @import url('https://fonts.googleapis.com/css2?family=${font}&display=swap');`
      }
      fontStyles += `
      <!--<![endif]-->
      <style>
          @font-face {
            font-family: 'Inter';
            font-style: normal;
            font-weight: 400;
            src: url(https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf) format('truetype');
          }
          @media screen {
              ${fontMediaStyles}
          }
      </style>
      `
  } 
  const backgroundImageString = bodySettings.styles.backgroundImage && bodySettings.styles.backgroundImage.length>0 ? `background-image:${bodySettings.styles.backgroundImage}; background-size:${bodySettings.styles.backgroundSize ?? 'auto'}; background-position:${bodySettings.styles.backgroundPosition ?? 'center center'};` : ''
  return `<html>
  <head>
  <meta charset="UTF-8">
  <title>email</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ${fontStyles}
  <style type="text/css">
  *{
    margin: 0;
    padding: 0;
    border: none;
    box-sizing: border-box;
  }

  html,body {
    height:100%;
    overflow-y:auto;
  }

  table {
    width: 100%;
    color:unset;
  }

  table, tr, td {
    vertical-align: top;
    border-collapse: collapse;
 }

  h1,h2,h3,h4 {
    display: block;
    margin-block-start: 0px;
    margin-block-end: 0px;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
  }
  .image-content-about_the_book{
    width:50%;
  }
  .image-content-about_the_book img{
    width:100%!important;
  }
  @media(max-width:620px){
    td {
      display:inline-block;
      width:100% !important;
    }
    .image-content-about_the_book, .image-content-about_the_book img{
      width:100%!important;
      margin-bottom:20px;
    }
  }
  ${styles}
  <img alt="Fairy Mail tracking pixel" src=${pixel}/>
</style>
  </head>
  <body style="background-color:${bodySettings.styles.backgroundColor};${backgroundImageString}">
  <div style="opacity:0;height:0;overflow:hidden;">${bodySettings.preHeader}</div>
  <div style="color:${bodySettings.styles.color}; font-family:${bodySettings.styles.fontFamily.attribute};"> ${content}</div>
  </body>
  </html>`;
};

export default dataToHtml;
