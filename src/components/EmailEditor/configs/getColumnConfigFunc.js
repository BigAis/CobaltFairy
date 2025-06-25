// Update in src/components/EmailEditor/configs/getColumnConfigFunc.js

const getColumnConfigFunc = (t) => {
  return (item) => {
    const contentConfig = {
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
    };

    return {
      name: t("column"),
      key: "column",
      type: "full",
      styles: {
        key: "column",
        desktop: {
          backgroundColor: "transparent",
          paddingTop: 0,
          paddingLeft: 15,  // Changed from 0 to 15
          paddingRight: 15, // Changed from 0 to 15
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
              paddingLeft: 15,  // Changed from 0 to 15
              paddingRight: 15, // Changed from 0 to 15
              paddingBottom: 0,
              contentBackground: "transparent",
            },
            mobile: {},
          },
          children: [item ? item : contentConfig],
        },
      ],
    };
  };
};

export default getColumnConfigFunc;