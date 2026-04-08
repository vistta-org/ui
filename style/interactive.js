export default (_, result) =>
  Object.assign(result, {
    a: {
      "background-color": "transparent",
      color: "$link-color",

      "&:link": {
        "text-decoration": "none",
      },

      "&:focus, &:hover, &:active, &.active": {
        color: "color-mix(in srgb, $link-color, black 10%)",
        "text-decoration": "underline",
      },

      "&:visited": {
        color: "color-mix(in srgb, $link-color, white 10%)",
      },
    },

    "button, [role='button'], [type='button'], [type='reset'], [type='submit']": {
      position: "relative",
      padding: "2rem 6rem",
      color: "$back-color",
      background: "$fore-color",
      border: "none",
      radius: "$radius",
      "-webkit-appearance": "button",
      "text-transform": "none",
      overflow: "visible",
      cursor: "pointer",
      "user-select": "none",
      transition: "text-shadow $duration, box-shadow $duration",

      ":disabled": {
        filter: "brightness(0.5) contrast(0.5)",
        cursor: "default",
      },

      "&:is(&:hover, &:active, &[active]):not(:disabled)": {
        "text-shadow": "0 0 .1rem currentColor",
        "box-shadow": "inset 0 0 60rem -50rem currentColor",
      },

      "&::moz-focus-inner": {
        "border-style": "none",
        padding: "0",
      },
      "&:-moz-focusring": {
        outline: "1px dotted ButtonText",
      },
    },
  });
