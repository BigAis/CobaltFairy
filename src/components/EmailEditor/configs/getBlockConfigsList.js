const MAIN_APP_BASE_URL = "https://fairymail.cobaltfairy.com";
const getBlockConfigsList = (t) => {
  return [
    {
      name: 'Content',
      isDivider:true
    },
    {
      name: t("image"),
      key: "image",
      src: "",
      alt: "Image",
      type: "link",
      linkURL: "",
      contentStyles: {
        desktop: {
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 12,
          paddingRight: 12,
          textAlign: "center",
        },
        mobile: {},
      },
      styles: {
        desktop: {
          width: "auto",
        },
        mobile: {},
      },
    },
    {
      name: t("text"),
      key: "text",
      text: t("text_content"),
      styles: {
        desktop: {
          fontSize: 14,
          fontFamily: "Inter",
          color: undefined,
          lineHeight: "140%",
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 12,
          paddingRight: 12,
          textAlign: "left",
        },
        mobile: {},
      },
    },
    {
      name: t("button"),
      key: "button",
      text: t("button"),
      type: "link",
      linkURL: "",
      contentStyles: {
        desktop: {
          textAlign: "center",
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 12,
          paddingRight: 12,
        },
        mobile: {},
      },
      styles: {
        desktop: {
          width: "auto",
          fontSize: 14,
          lineHeight: "140%",
          borderRadius: 4,
          fontFamily: "Inter",
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 20,
          paddingRight: 20,
          backgroundColor: "#FF4C49",
          color: "#fff",
          display: "inline-block",
        },
        mobile: {},
      },
    },
    {
      name: t("divider"),
      key: "divider",
      contentStyles: {
        desktop: {
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 12,
          paddingRight: 12,
          textAlign: "center",
        },
        mobile: {},
      },
      styles: {
        desktop: {
          width: "100%",
          borderTopStyle: "solid",
          borderTopColor: "#ccc",
          borderTopWidth: 1,
          display: "inline-block",
          verticalAlign: "middle",
        },
        mobile: {},
      },
    },
    {
      name: t("heading"),
      key: "heading",
      text: t("heading_content"),
      type: "h1",
      styles: {
        desktop: {
          fontSize: 22,
          lineHeight: "140%",
          fontFamily: "Inter",
          color: undefined,
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 12,
          paddingRight: 12,
          textAlign: "left",
          fontWeight: "bold",
        },
        mobile: {},
      },
    },
    {
      name: 'Sections',
      isDivider:true
    },
    {
      name: '1 Section',
      key: "column",
      columnType:"1-section",
      type: "full",
      styles: {
        key: "column",
        desktop: {
          backgroundColor: "transparent",
          paddingTop: 0,
          paddingLeft: 15,
          paddingRight: 15,
          paddingBottom: 0,
          contentBackground: "transparent",
        },
        mobile: {},
      },
      children: [
        {
          name: t("content"),
          key: "content",
          width: "100%",
          styles: {
            key: "column",
            desktop: {
              backgroundColor: "transparent",
              paddingTop: 0,
              paddingLeft: 15,
              paddingRight: 15,
              paddingBottom: 0,
              contentBackground: "transparent",
            },
            mobile: {},
          },
          children: [
            {
              name: t("drag_block_here"),
              key: "empty",
              width: "100%",
              styles: {
                desktop: {
                  backgroundColor: "transparent",
                  paddingTop: 0,
                  paddingLeft: 0,
                  paddingRight: 0,
                  paddingBottom: 0,
                },
                mobile: {},
              },
            },
          ],
        },
      ],
    },
    {
      name: '2 Sections',
      key: "column",
      type: "1-1",
      columnType:"2-sections",
      styles: {
        key: "column",
        desktop: {
          backgroundColor: "transparent",
          paddingTop: 0,
          paddingLeft: 15,
          paddingRight: 15,
          paddingBottom: 0,
          contentBackground: "transparent",
        },
        mobile: {},
      },
      children:  Array.from({ length: 2 }).map(() => {
        return {
          name: t("content"),
          key: "content",
          width: "50%",
          styles: {
            key: "column",
            desktop: {
              backgroundColor: "transparent",
              paddingTop: 0,
              paddingLeft: 15,
              paddingRight: 15,
              paddingBottom: 0,
              contentBackground: "transparent",
            },
            mobile: {},
          },
          children: [
            {
              name: t("drag_block_here"),
              key: "empty",
              width: "100%",
              styles: {
                desktop: {
                  backgroundColor: "transparent",
                  paddingTop: 0,
                  paddingLeft: 0,
                  paddingRight: 0,
                  paddingBottom: 0,
                },
                mobile: {},
              },
            },
          ],
        }
      }),
    },
    {
      name: '3 Sections',
      key: "column",
      type: "1-1-1",
      columnType:"3-sections",
      styles: {
        key: "column",
        desktop: {
          backgroundColor: "transparent",
          paddingTop: 0,
          paddingLeft: 15,
          paddingRight: 15,
          paddingBottom: 0,
          contentBackground: "transparent",
        },
        mobile: {},
      },
      children:  Array.from({ length: 3 }).map(() => {
        return {
          name: t("content"),
          key: "content",
          width: "33.3333%",
          styles: {
            key: "column",
            desktop: {
              backgroundColor: "transparent",
              paddingTop: 0,
              paddingLeft: 15,
              paddingRight: 15,
              paddingBottom: 0,
              contentBackground: "transparent",
            },
            mobile: {},
          },
          children: [
            {
              name: t("drag_block_here"),
              key: "empty",
              width: "100%",
              styles: {
                desktop: {
                  backgroundColor: "transparent",
                  paddingTop: 0,
                  paddingLeft: 0,
                  paddingRight: 0,
                  paddingBottom: 0,
                },
                mobile: {},
              },
            },
          ],
        }
      }),
    },
    {
      name: '4 Sections',
      key: "column",
      type: "1-1-1-1",
      columnType:"4-sections",
      styles: {
        key: "column",
        desktop: {
          backgroundColor: "transparent",
          paddingTop: 0,
          paddingLeft: 15,
          paddingRight: 15,
          paddingBottom: 0,
          contentBackground: "transparent",
        },
        mobile: {},
      },
      children:  Array.from({ length: 4 }).map(() => {
        return {
          name: t("content"),
          key: "content",
          width: "25%",
          styles: {
            key: "column",
            desktop: {
              backgroundColor: "transparent",
              paddingTop: 0,
              paddingLeft: 15,
              paddingRight: 15,
              paddingBottom: 0,
              contentBackground: "transparent",
            },
            mobile: {},
          },
          children: [
            {
              name: t("drag_block_here"),
              key: "empty",
              width: "100%",
              styles: {
                desktop: {
                  backgroundColor: "transparent",
                  paddingTop: 0,
                  paddingLeft: 0,
                  paddingRight: 0,
                  paddingBottom: 0,
                },
                mobile: {},
              },
            },
          ],
        }
      }),
    },
    {
      name: 'Special',
      isDivider:true
    },
    {
      name: "About the book",
      key: "about_book_v2",
      icon: "/images/editor-icons/about_the_book.png",
      src: "",
      alt: "About the book",
      linkURL: "",
      imageWidth: 35,
      text: `<strong>About the book</strong><br><br>Lorem ipsum dolor sit amet. The graphic and typographic operators know this well, in reality all the professions dealing with the universe of communication have a stable relationship with these words, but what is it? Lorem ipsum is a dummy text without any sense.`,
      contentStyles: {
        desktop: {
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 12,
          paddingRight: 12,
        },
        mobile: {},
      },
      styles: {
        desktop: {
          fontSize: 14,
          fontFamily: "Inter",
          color: undefined,
          lineHeight: "140%",
          paddingBottom: 12,
          paddingLeft: 12,
          paddingRight: 12,
          textAlign: "left",
        },
        mobile: {},
      },
      image: {
        src: "",
        alt: "About the book",
        parentKey: 'about_book_v2',
        type: "link",
        linkURL: "",
        styles: {
          desktop: {
            width: "35%",
            maxWidth: "35%",
            float: "left",
            marginRight: "20px",
            marginBottom: "10px"
          },
          mobile: {
            width: "100%",
            float: "none",
          },
        },
      }
    },
    {
      name: t("social_link"),
      key: "social_link",
      list: [
        {
          image: "https://cdn.cobaltfairy.com/fairymail/social/facebook.webp",
          title: "facebook",
          linkURL: "",
        },
        {
          image: "https://cdn.cobaltfairy.com/fairymail/social/instagram.webp",
          title: "Instagram",
          linkURL: "",
        },
        {
          image: "https://cdn.cobaltfairy.com/fairymail/social/twitter.webp",
          title: "Twitter",
          linkURL: "",
        },
        {
          image: "https://cdn.cobaltfairy.com/fairymail/social/youtube.webp",
          title: "YouTube",
          linkURL: "",
        },
      ],
      imageWidth: 32,
      contentStyles: {
        desktop: {
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 12,
          paddingRight: 12,
          textAlign: "left",
        },
        mobile: {},
      },
      styles: {
        desktop: { paddingTop: 4, paddingBottom: 4, paddingLeft: 6, paddingRight: 6 },
        mobile: {},
      },
    },
    {
      name: '2 Books',
      key: "column",
      type: "1-1",
      columnType:"2-sections",
      styles: {
        key: "column",
        desktop: {
          backgroundColor: "transparent",
          paddingTop: 0,
          paddingLeft: 15,
          paddingRight: 15,
          paddingBottom: 0,
          contentBackground: "transparent",
        },
        mobile: {},
      },
      children:  Array.from({ length: 2 }).map(() => {
        return {
          name: t("content"),
          key: "content",
          width: "50%",
          styles: {
            key: "column",
            desktop: {
              backgroundColor: "transparent",
              paddingTop: 0,
              paddingLeft: 15,
              paddingRight: 15,
              paddingBottom: 0,
              contentBackground: "transparent",
            },
            mobile: {},
          },
          children: [
            {
              name: t("image"),
              key: "image",
              src: "",
              alt: "Image",
              type: "link",
              linkURL: "",
              contentStyles: { desktop: {paddingTop: 12, paddingBottom: 12, paddingLeft: 12, paddingRight: 12, textAlign: "center",}, mobile: {},},
              styles: { desktop: { width: "auto", }, mobile: {},},
            },
            {
              name: t("text"),
              key: "text",
              text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
              styles: {
                desktop: {
                  fontSize: 13,
                  fontFamily: "Inter",
                  color: undefined,
                  lineHeight: "100%",
                  paddingTop: 12,
                  paddingBottom: 12,
                  paddingLeft: 12,
                  paddingRight: 12,
                  textAlign: "left",
                },
                mobile: {},
              },
            },
            {
              name: t("button"),
              key: "button",
              text: 'Download now!',
              type: "link",
              linkURL: "",
              contentStyles: {
                desktop: {
                  textAlign: "center",
                  paddingTop: 12,
                  paddingBottom: 12,
                  paddingLeft: 12,
                  paddingRight: 12,
                },
                mobile: {},
              },
              styles: {
                desktop: {
                  width: "100%",
                  fontSize: 14,
                  lineHeight: "140%",
                  borderRadius: 4,
                  fontFamily: "Inter",
                  paddingTop: 10,
                  paddingBottom: 10,
                  paddingLeft: 20,
                  paddingRight: 20,
                  backgroundColor: "#FF4C49",
                  color: "#fff",
                  display: "inline-block",
                },
                mobile: {},
              },
            }
          ],
        }
      }),
    },
    {
      name: 'Footer',
      key: "column",
      type: "1-1",
      columnType:"footer",
      styles: {
        key: "column",
        desktop: {
          backgroundColor: "transparent",
          paddingTop: 0,
          paddingLeft: 15,
          paddingRight: 15,
          paddingBottom: 0,
          contentBackground: "transparent",
        },
        mobile: {},
      },
      styles: {
        desktop: {},
        mobile: {},
      },
      children:[
        {
          name: t("content"),
          key: "content",
          width: "50%",
          styles: {
            key: "column",
            desktop: {
              backgroundColor: "transparent",
              paddingTop: 0,
              paddingLeft: 15,
              paddingRight: 15,
              paddingBottom: 0,
              contentBackground: "transparent",
            },
            mobile: {},
          },
          children: [
            {
              name: t("text"),
              key: "text",
              subkey : 'footer-links',
              initFlag:true,
              text: 'yourwebsite.tld<br>email@yourwebsite.tld',
              styles: {
                desktop: {
                  fontSize: 14,
                  fontFamily: "Inter",
                  color: undefined,
                  lineHeight: "140%",
                  paddingTop: 12,
                  paddingBottom: 12,
                  paddingLeft: 12,
                  paddingRight: 12,
                  textAlign: "left",
                },
                mobile: {},
              },
            }
          ],
        },
        {
          name: t("content"),
          key: "content",
          width: "50%",
          styles: {
            key: "column",
            desktop: {
              backgroundColor: "transparent",
              paddingTop: 0,
              paddingLeft: 15,
              paddingRight: 15,
              paddingBottom: 0,
              contentBackground: "transparent",
            },
            mobile: {},
          },
          children: [
            {
              name: t("text"),
              key: "text",
              subkey: "unsubscribe",
              initFlag:true,
              text: `You received this email because you signed up on our website or made a purchase from us.<br><br><a href="https://unsubscribe.fairymail.app/{{pixel_uid}}/{{pixel_group}}">Unsubscribe</a>`,
              styles: {
                desktop: {
                  fontSize: 11,
                  fontFamily: "Inter",
                  color: undefined,
                  lineHeight: "140%",
                  paddingTop: 12,
                  paddingBottom: 12,
                  paddingLeft: 12,
                  paddingRight: 12,
                  textAlign: "right",
                },
                mobile: { fontSize: 11,fontFamily: "Inter",textAlign: "right",},
              },
            }
          ],
        }
      ]
    },
  ];
};

export default getBlockConfigsList;