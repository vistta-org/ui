export default (_, result) =>
  Object.assign(result, {
    "input, textarea, [role='input']": {
      padding: "2rem",
      color: "$fore-color",
      background: "$back-color",
      border: "$border-size solid $border-color",
      "border-radius": "$radius",
      "accent-color": "$primary-color",

      disabled: {
        filter: "brightness(0.5) contrast(0.5)",
      },

      "&:not(:disabled,[type='file'],[type='color'],[type='submit'],[type='range'],[type='radio'],[type='checkbox']):read-only":
        {
          background: "transparent!",
          "border-color": "transparent!",
          "border-bottom-color": "$border-color!",
          "border-radius": "0!",
        },

      "&:focus:not(:disabled, :read-only)": {
        outline: "none",
      },
    },

    "select, [role='select']": {
      padding: "2rem 4rem",
      color: "$fore-color",
      background: "$back-color",
      border: "$border-size solid $border-color",
      "border-radius": "$radius",
      "accent-color": "$primary-color",
      cursor: "pointer",

      option: {
        "accent-color": "$primary-color",
        color: "$fore-color",
        background: "$back-color",
      },

      disabled: {
        filter: "brightness(0.5) contrast(0.5)",
        cursor: "default",
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
        padding: "0 2rem",
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
        background: "$back-color",
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

    fieldset: {
      position: "relative",
      padding: "2rem",
      color: "$fore-color",
      background: "$back-color",
      border: "$border-size solid $border-color",
      "border-radius": "$radius",
      "accent-color": "$primary-color",

      "&:has([type='checkbox'], [type='radio'])": {
        border: "none",
      },

      "&:has(input:disabled, textarea:disabled, [role='input']:disabled, select:disabled, [role='select']:disabled)": {
        filter: "brightness(0.5) contrast(0.5)",
      },

      "input, textarea, select, [role='input'], [role='select']": {
        background: "transparent!",
        border: "none!",
        "border-radius": "0!",
      },

      "&:focus:not(:disabled, :read-only)": {
        outline: "none",
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

    "label:has(input, textarea, select, [role='input'], [role='select'])": {
      display: "flex",
      "align-items": "center",
      padding: "0 2rem",

      "input, textarea, select, [role='input'], [role='select']": {
        flex: "1",
        height: "100%",
        "margin-left": "2rem",
        padding: "0",
      },
    },

    textarea: {
      overflow: "auto",
    },
  });
