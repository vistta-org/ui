export default (config, result) =>
  Object.assign(result, {
    root: {
      "interpolate-size": "allow-keywords",
      "color-scheme": "light dark",
      "$scroll-color": config.scroll?.color || "color-mix(in srgb, $back-color, $fore-color, 10%)",
      "$scroll-background": config.scroll?.background || "$back-color",
      "$scroll-size": config.scroll?.size || "3rem",
      "$scroll-radius": config.scroll?.radius || config?.radius || "8px",
    },

    "html, body": {
      color: "$fore-color",
      "line-height": "$line-height",
      "letter-spacing": "$letter-spacing",
      "font-family": "$font-family, system-ui, -apple-system, BlinkMacSystemFont",
      position: "absolute",
      height: "min(100%, 100dvh)",
      width: "min(100%, 100dvw)",
      inset: "0",
      "overflow-y": "auto",
      "overflow-x": "clip",
      background: "light-dark(shade($back-color, 5%), shade($back-color, 25%))",
      "scrollbar-color": "$scroll-color $scroll-background",
      "scrollbar-width": "thin",
    },

    html: {
      "font-size": "$size !important",
      "box-sizing": "border-box",
      "-webkit-font-smoothing": "antialiased",
      "-moz-osx-font-smoothing": "grayscale",

      "&[theme='light']": {
        "color-scheme": "light",
        "$fore-color": `$dark-color`,
        "$back-color": `$light-color`,
      },

      "&[theme='dark']": {
        "color-scheme": "dark",
        "$fore-color": `$light-color`,
        "$back-color": `$dark-color`,
      },
    },

    body: {
      "font-size": "$font-size",
      margin: "0",
      "text-rendering": "optimizeLegibility",
    },

    "*, *::before, *::after": {
      margin: "0",
      padding: "0",
      "box-sizing": "inherit",
      "scrollbar-color": "$scroll-color transparent",
      "scrollbar-width": "thin",
    },

    "*:focus:not(:focus-visible):not(:focus-within)": {
      outline: "none",
    },

    "button, input, optgroup, select, textarea": {
      "font-family": "inherit",
      "font-size": "100%",
      "line-height": "1.15",
      margin: "0",
    },

    "@media (prefers-reduced-motion: reduce)": {
      "*, *:before, *:after": {
        animation: "none !important",
        transition: "none !important",
        "scroll-behavior": "auto !important",
      },
    },
  });
