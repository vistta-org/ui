export default (_, result) =>
  Object.assign(result, {
    "input, textarea, [role='input']": {
      padding: "2rem",
      height: "10rem",
      color: "default",
      background: "light-dark(shade($back-color, 5%), shade($back-color, 25%))",
      border: "$border-size solid $border-color",
      "border-radius": "$radius",
      "accent-color": "$primary-color",
      cursor: "text",

      disabled: {
        filter: "brightness(0.5) contrast(0.5)",
      },

      "&:not(:disabled,[type='file'],[type='color'],[type='submit'],[type='range'],[type='radio'],[type='checkbox']):is(:read-only,[readonly])":
        {
          background: "transparent!",
          "border-color": "transparent!",
          "border-radius": "0!",
        },

      "&:focus": {
        outline: "none",
      },

      "&[readonly]": {
        cursor: "default!",
        "pointer-events": "none!",
      },
    },

    "select, [role='select']": {
      padding: "2rem 4rem",
      "line-height": "1.4",
      cursor: "pointer",
      background: "light-dark(shade($back-color, 5%), shade($back-color, 25%))",

      "&, &::picker(select)": {
        appearance: "base-select",
        "accent-color": "$primary-color",
        color: "default",
        border: "$border-size solid $border-color",
        "border-radius": "$radius",
        "list-style": "none",
        outline: "none",
      },

      "&::picker(select)": {
        translate: "-2rem 2rem",
        background: "default",
      },

      option: {
        padding: "2rem 6rem 2rem 2rem",
        "accent-color": "$primary-color",
        color: "default",
        background: "default",
        "list-style": "none",

        "&:checked, &:hover, &:focus": {
          color: "$back-color",
          background: "$fore-color",
        },

        "&::checkmark": {
          position: "absolute",
          right: "2rem",
        },
      },

      disabled: {
        filter: "brightness(0.5) contrast(0.5)",
        cursor: "default!",
      },

      "&[readonly]": {
        background: "transparent!",
        "border-color": "transparent!",
        "border-radius": "0!",
        cursor: "default!",
        "pointer-events": "none!",

        "&::picker-icon": {
          display: "none!",
        },
      },
    },

    input: {
      overflow: "visible",

      "&[type='file']": {
        padding: "0",
        "font-size": "$font-size-small",

        "&::file-selector-button ": {
          padding: "2rem 4rem",
          "margin-right": "4rem",
          background: "none",
          "font-size": "$font-size",
          border: "$border-size solid transparent",
          "border-right-color": "$border-color",
          cursor: "pointer",

          disabled: {
            cursor: "default!",
            filter: "brightness(0.5) contrast(0.5)",
          },
        },
      },

      "&[type='color']": {
        minWidth: "9rem",
        appearance: "none",
        cursor: "pointer",
        "&::-webkit-color-swatch, &::-moz-color-swatch": {
          border: "none",
          "border-radius": "$radius",
        },
      },

      "&[type='submit']": {
        padding: "2rem 6rem",
        cursor: "pointer",

        disabled: {
          cursor: "default!",
          filter: "brightness(0.5) contrast(0.5)",
        },
      },

      "&[type='range']": {
        "-webkit-appearance": "none",
        appearance: "none",
        width: "100%",
        padding: "0",
        height: "2rem",
        background: "light-dark(shade($back-color, 5%), shade($back-color, 25%))",
        border: "$border-size solid $border-color",
        cursor: "pointer",

        "&::-webkit-slider-thumb": {
          "-webkit-appearance": "none",
          appearance: "none",
          width: "4rem",
          height: "4rem",
          "border-radius": "100%",
          background: "$primary-color",
          cursor: "pointer",
        },
      },

      "&[type='checkbox'], &[type='radio']": {
        "box-sizing": "border-box",
        height: "$font-size-large",
        width: "$font-size-large",
        padding: "0",
        cursor: "pointer",
      },

      "&[type='number']::-webkit-inner-spin-button, &[type='number']::-webkit-outer-spin-button": {
        height: "auto",
      },

      "&[type='search']": {
        "-webkit-appearance": "textfield",
        "outline-offset": "-2px",

        "&::-webkit-search-decoration": {
          "-webkit-appearance": "none",
        },
      },

      "&::-webkit-file-upload-button": {
        "-webkit-appearance": "button",
        font: "inherit",
      },
    },

    textarea: {
      resize: "none",
      minHeight: "10rem",
      height: "auto",
      "field-sizing": "content",
    },

    fieldset: {
      position: "relative",
      container: "default",
      width: "fit-content",
      border: "none",
      "> *": {
        col: "full",
      },
    },

    legend: {
      "box-sizing": "border-box",
      color: "inherit",
      display: "table",
      "max-width": "100%",
      padding: "0",
      "white-space": "normal",
    },
  });
