import getFontsList from "../configs/getFontsList";
// const PIXEL_URL = 'https://fairymail.cobaltfairy.com/api'
const PIXEL_URL = 'https://pixel.fairymail.app'


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
  
  // Add the width check for float behavior
  const imageWidth = imageConfig.styles.desktop.width && imageConfig.styles.desktop.width.includes('%') 
    ? parseInt(imageConfig.styles.desktop.width) 
    : 50;
  
  // Adjust styles based on width
  const floatStyle = imageWidth > 65 ? 'float: none; margin-bottom: 20px;' : 'float: right; margin-left: 20px;';
  
  const imageStyle = `max-width:100%;${imageConfig.styleConfig.desktop};${floatStyle}`;
  
  const imageString = `<img src="${imageConfig.src}" alt="${imageConfig.alt}" style="${imageStyle}" 
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
    style="${buttonBlock.styleConfig.desktop};text-decoration:none!important" target="_black" href="https://${buttonBlock.linkURL}">${buttonBlock.text}</a>
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
        const { image, title, link } = socialLinkItem;
        console.log('socialLinkItem',socialLinkItem)
        return `<a target="_black" href="${link}" style="${socialLinkBlock.styleConfig.desktop};display:inline-block;">
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

    if (item.key === "about_book_v2") {
      // Create a container with text wrapping around image
      const containerStyles = item.contentStyles && item.contentStyles.desktop ? 
        Object.entries(item.contentStyles.desktop)
          .map(([key, value]) => `${key}:${value}`)
          .join(';') : '';
      
      content += `<div class="about-book-v2-container" style="overflow:auto; width:100%; ${containerStyles}">`;
      
      // Get image width safely
      const imageWidth = item.imageWidth || 35;
      const useVerticalLayout = imageWidth >= 100;
      
      // Generate image styles
      const imageFloatStyle = useVerticalLayout ? 
        "float:none; margin-right:0; margin-bottom:20px;" : 
        "float:left; margin-right:20px; margin-bottom:10px;";
      
      // Get image height if defined
      const imageHeight = item.image && item.image.styles && item.image.styles.desktop && item.image.styles.desktop.height ? 
        `height:${item.image.styles.desktop.height};` : '';
      
      // Add the image
      if (item.src) {
        const imageStyle = `max-width:100%; width:${imageWidth}%; display:block; ${imageFloatStyle} ${imageHeight}`;
        const imageString = `<img src="${item.src}" alt="${item.alt || ''}" style="${imageStyle}" />`;
        
        content += `<div style="display:block; ${imageFloatStyle} width:${imageWidth}%;">
            ${item.linkURL ? 
              `<a href="${item.linkURL}" target="_blank">${imageString}</a>` : 
              imageString}
        </div>`;
      } else {
        // Placeholder for missing image - respect custom height if set
        const placeholderHeight = imageHeight || 'height:150px;';
        content += `<div style="${imageFloatStyle} width:${imageWidth}%; background-color:#f0f0f0; ${placeholderHeight} display:flex; align-items:center; justify-content:center;">
          <span style="color:#999; text-align:center; width:100%;">Image Placeholder</span>
        </div>`;
      }
      
      // Add text content
      const textStyles = item.styles && item.styles.desktop ? 
        Object.entries(item.styles.desktop)
          .map(([key, value]) => `${key}:${value}`)
          .join(';') : '';
      
      content += `<div style="${textStyles}">${item.text}</div>`;
      
      // Clear floats
      content += `<div style="clear:both;"></div>`;
      
      // Close container
      content += `</div>`;
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
      
      // Get image width to determine positioning
      const imageWidth = item.image?.styles?.desktop?.width && 
                        item.image.styles.desktop.width.includes('%') 
        ? parseInt(item.image.styles.desktop.width) 
        : 50;
      
      // Adjust styles based on width
      if(item.image?.styles?.desktop) {
        if (imageWidth > 65) {
          item.image.styles.desktop.float = "none";
          item.image.styles.desktop.marginLeft = "0";
          item.image.styles.desktop.marginBottom = "20px";
        } else {
          item.image.styles.desktop.float = "right";
          item.image.styles.desktop.marginLeft = "20px";
          item.image.styles.desktop.marginBottom = "0";
        }
        
        // Remove conflicting margins
        if(item.image.styles.desktop.marginRight) {
          delete item.image.styles.desktop.marginRight;
        }
      }
      
      // Create a container for the book content with clearfix
      content += `<div class="about-the-book-container" style="position: relative; display: block; width: 100%; overflow: hidden;">`;
      content += createImageString(item.image);
      content += createTextString(item.text);
      content += `</div>`;
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
const dataToHtml = ({ bodySettings, blockList, isPreview=false }) => {
  const fontList = extractFonts(blockList); //recursively itterate blocklist to export all fonts, and find the required urls to add.
  let content = "";
  const { newBlockList, styles } = createStyleTag(blockList);
  content = blockListToHtml(newBlockList, bodySettings);
  let links = extractUrls(content)

  // if (links)
  //   for (let l = 0; l < links.length; l++) {
  //     if (links[l].includes('fairymail.cobaltfairy.com') || links[l].includes('cdn.cobaltfairy.online') || links[l].includes('cdn.cobaltfairy.com') || links[l].includes('fairymail.app')) {
  //       continue
  //     }
  //     if (links[l].includes(' ')) links[l] = links[l].split(' ')[0]
  //     if (
  //       !links[l].includes('.jpg') &&
  //       !links[l].includes('.jpeg') &&
  //       !links[l].includes('.png') &&
  //       !links[l].includes('.gif') &&
  //       !links[l].includes('.webp') &&
  //       !links[l].includes('.svg') &&
  //       !links[l].includes('cdn.cobaltfairy.online') &&
  //       !links[l].includes('cdn.cobaltfairy.com') && 
  //       !links[l].includes('pixel.fairymail.app')
  //     ) {
  //       if (links[l].includes('"')) links[l] = links[l].split('"')[0]
  //       if (!links[l].startsWith('http')) links[l] = `http://${links[l]}`
  //       content = content
  //         .split(links[l])
  //         .join(
  //           `${PIXEL_URL}/redir?cid=${campaignUUID}&uid={{pixel_uid}}&v={{cmp_version}}&r=${encodeURIComponent(links[l])}`
  //         )
  //     }
  //   }
  content = content.split('https://https://').join('https://').split('https://http://').join('https://')
  let fontStyles = "";
  let fontMediaStyles = "";
  let pixel = `${PIXEL_URL}/pixel.gif?cid=${''}&uid={{pixel_uid}}&v={{cmp_version}}`
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

      ${isPreview ? `
        html,body {
            height:100%;
            overflow-y:auto;
          }
        ` : `
        body {
          margin: 0;
          padding: 0;
          width: 100% !important;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
      `}

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
      
      .about-the-book-container {
        position: relative;
        width: 100%;
        display: flex;
        clear: both;
      }

      .block-item.image.parent-about_the_book .block-item-tools,
      .block-item.text.parent-about_the_book .block-item-tools {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
      
      .image-content-about_the_book {
        position: relative;
        z-index: 5;
      }
      
      .image-content-about_the_book img {
        width: 100% !important;
        float: left;
        margin-right: 20px;
      }
      
      @media(max-width:620px) {
        td {
          display: inline-block;
          width: 100% !important;
        }

          .about-the-book-container {
          flex-direction: column !important;
        }

          .block-item.image.parent-about_the_book {
          width: 100% !important;
          margin-right: 0 !important;
          margin-bottom: 20px !important;
        }

        .about-the-book-container img {
        max-width: 100% !important;
        float: none !important;
        margin-right: 0 !important;
        margin-bottom: 20px;
        width: 100% !important;
      }
        
        .image-content-about_the_book {
          width: 100% !important;
          float: none !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          margin-bottom: 20px;
        }
        
        .image-content-about_the_book img {
          width: 100% !important;
        }
      }

      .about-book-v2-container {
        position: relative;
        overflow: auto; /* Creates a block formatting context */
        width: 100%;
        clear: both;
      }

      .about-book-v2-container::after {
        content: "";
        display: table;
        clear: both; /* Proper clearfix */
      }

      @media(max-width:620px) {
        .about-book-v2-container img {
          float: none !important;
          width: 100% !important;
          margin-right: 0 !important;
          margin-bottom: 20px !important;
        }
      }

      .parent-about_book_v2 img,
      .parent-about_book_v2 .empty-image {
        max-width: 100%;
        display: block;
      }

      .parent-about_book_v2.image {
        float: left;
        margin-right: 20px;
        margin-bottom: 10px;
      }

      @media(max-width:620px) {
        .parent-about_book_v2.image {
          float: none;
          width: 100% !important;
          margin-right: 0;
          margin-bottom: 20px;
        }
      }
      /* Add these styles to src/components/EmailEditor/assets/App.css or the appropriate CSS file */

      /* Updates for handling custom image heights in the About Book V2 component */
      .about-book-v2-container img {
        max-width: 100%;
        display: block;
        height: auto; /* Default to auto height */
      }

      /* Ensure the empty-image placeholder respects custom heights */
      .about-book-v2-container .empty-image {
        width: 100%;
        min-height: 150px;
        background-color: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Media queries for responsive behavior */
      @media(max-width: 620px) {
        .about-book-v2-container img,
        .about-book-v2-container .empty-image {
          width: 100% !important;
          float: none !important;
          margin-right: 0 !important;
          margin-bottom: 20px !important;
        }
      }

    </style>
  </head>
  <body style="background-color:${bodySettings.styles.backgroundColor};${backgroundImageString}">
      <div style="opacity:0;height:0;overflow:hidden;">${bodySettings.preHeader}</div>
      <div style="color:${bodySettings.styles.color}; font-family:${bodySettings.styles.fontFamily.attribute};"> ${content}</div>
  </body>
  </html>`;
};

export default dataToHtml;