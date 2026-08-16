/**
 * @typedef {Object} Font
 * @property {string} [family] default font family (default: 'Segoe UI')
 * @property {FontSize} [size] Font Size configuration
 */

/**
 * @typedef {Object} FontSize
 * @property {string} [small] small font size (default: 3rem)
 * @property {string} [default] default font size (default: 4rem)
 * @property {string} [large] large font size (default: 5rem)
 * @property {string} [h1] h1 font size (default: 9rem)
 * @property {string} [h2] h2 font size (default: 7.5rem)
 * @property {string} [h3] h3 font size (default: 6rem)
 * @property {string} [h4] h4 font size (default: 5rem)
 * @property {string} [h5] h5 font size (default: 4.5rem)
 * @property {string} [h6] h6 font size (default: 4rem)
 */

export default (config, result) => {
  Object.assign(result.vars, {
    "font-family": config.font?.family || "Segoe UI",
    "font-size": config.font?.size?.default ?? "4rem",
    "font-size-small": config.font?.size?.small ?? "3rem",
    "font-size-large": config.font?.size?.large ?? "5rem",
    "font-size-h1": config.font?.size?.h1 ?? "9rem",
    "font-size-h2": config.font?.size?.h2 ?? "7.5rem",
    "font-size-h3": config.font?.size?.h3 ?? "6rem",
    "font-size-h4": config.font?.size?.h4 ?? "5rem",
    "font-size-h5": config.font?.size?.h5 ?? "4.5rem",
    "font-size-h6": config.font?.size?.h6 ?? "4rem",
    "line-height": config.line?.height ?? "1.5",
    "letter-spacing": config.letter?.spacing ?? "3%",
  });

  result.properties.font = {
    default: "font-size: $font-size; font-weight: normal",
    small: "font-size: $font-size-small",
    large: "font-size: $font-size-large",
    normal: "font-weight: normal",
    lighter: "font-weight: 200",
    light: "font-weight: 300",
    regular: "font-weight: 400",
    medium: "font-weight: 500",
    bold: "font-weight: 700",
    bolder: "font-weight: 800",
    italic: "font-style: italic",
  };

  Object.assign(result, {
    "h1, h2, h3, h4, h5, h6": {
      "font-weight": "bolder",
      "line-height": "$line-height",
      "letter-spacing": "$letter-spacing",
    },

    h1: {
      "font-size": "$font-size-h1",
    },

    h2: {
      "font-size": "$font-size-h2",
    },

    h3: {
      "font-size": "$font-size-h3",
    },

    h4: {
      "font-size": "$font-size-h4",
    },

    h5: {
      "font-size": "$font-size-h5",
    },

    h6: {
      "font-size": "$font-size-h6",
    },

    pre: {
      position: "relative",
      margin: "4rem 0 8rem",
      padding: "2rem",
      border: "$border-size solid $border-color",
      "border-radius": "$default-radius",
      background: "color-mix(in srgb, $back-color, black 5%)",
      overflow: "clip",
      "font-family": "monospace, monospace",
      "font-size": "1em",

      "[data-language]": {
        padding: "calc($font-size-small + 5rem) 2rem 3rem",

        ":before": {
          position: "absolute",
          inset: "0 0 auto 0",
          padding: ".5rem 2rem",
          content: "attr(data-language)",
          color: "$neutral-color",
          "font-size": "$font-size-small",
          "border-bottom": "$border-size solid $border-color",
        },
      },
    },

    p: {
      margin: "0",
    },

    label: {
      padding: ".5rem 2rem",
      color: "$fore-color",
      background: "$back-color",
      "border-radius": "$default-radius",
    },

    "a, ins, u": {
      "text-decoration-skip": "ink edges",
    },

    "abbr[title]": {
      "border-bottom": "none",
      "text-decoration": "underline dotted",
      cursor: "help",
    },

    "b, strong": {
      "font-weight": "bolder",
    },

    "code, kbd, samp": {
      "font-family": "monospace, monospace",
      "font-size": "1em",
    },

    small: {
      "font-size": "80%",
    },

    "sub, sup": {
      position: "relative",
      "font-size": "75%",
      "line-height": "0",
      "vertical-align": "baseline",
    },

    sub: {
      bottom: "-0.25em",
    },

    sup: {
      top: "-0.5em",
    },

    cite: {
      "font-style": "italic",
      "border-radius": "$default-radius",
      background: "color-mix(in srgb, $back-color, $fore-color, 5%)",
      padding: "0 .5rem",
    },

    kbd: {
      color: "white",
      background: "black",
      "border-radius": "$default-radius",
      "font-size": "$font-size-small",
    },

    mark: {
      color: "$info-contrast-color",
      background: "$info-color",
      padding: ".25em .5rem 0",
    },

    blockquote: {
      "border-left": "$border-size solid $border-color",
      "margin-left": "0",
      padding: "2rem 4rem",

      "p:last-child": {
        "margin-bottom": 0,
      },
    },
  });

  return result;
};
