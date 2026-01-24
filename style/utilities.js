import icons from "./MaterialSymbols.ttf";

/**
 * @typedef {Object} Animation
 * @property {string} [duration] default animation duration (default: 0.5s)
 * @property {object} [range] default animation range (default: contain -5% contain 15%)
 */

/**
 * @typedef {Object} Icon
 * @property {string} [size] default icon size (default: 1.5em)
 * @property {object} [font] icon font config (default: Material Symbols)
 */

/**
 * @typedef {Object} Border
 * @property {string} [size] default border size (default: 1px)
 * @property {object} [color] default border color (default: #0000001a)
 */

/**
 * @typedef {Object} Shadow
 * @property {string} [offset] default shadow offset (default: 1px)
 * @property {string} [blur] default shadow blur (default: 8px)
 * @property {object} [color] default shadow color (default: #00000040)
 */

export default (config, result) => {
  /* Global Vars */
  result.vars.duration = config.duration ?? "0.35s";
  result.vars.blur = `blur(${config.blur ?? "8px"})`;

  /* Animations */
  result.vars["animate-transform"] = "none";
  result.vars["animate-duration"] = config.animation?.duration ?? config.duration ?? "0.35s";
  result.vars["animate-range"] = config.animation?.range ?? "contain -5% contain 15%";
  result.animations["animate-property"] = {
    from: {
      opacity: "0",
      transform: "$animate-transform",
    },
  };
  const animate = (transform, onScroll) =>
    onScroll
      ? {
          "$animate-transform": transform,
          "view-timeline-name": "--item-timeline",
          animation: "animate-property both",
          "animation-timeline": "--item-timeline",
          "animation-range": "$animate-range",
        }
      : {
          "$animate-transform": transform,
          animation: "animate-property $animate-duration linear",
        };
  result.properties["animate"] = {
    "fade-in": animate("none"),
    "zoom-in": animate("scale(2)"),
    "zoom-out": animate("scale(0)"),
    "slide-top": animate("translateY(50%)"),
    "slide-right": animate("translateX(-50%)"),
    "slide-bottom": animate("translateY(-50%)"),
    "slide-left": animate("translateX(50%)"),
    "*": animate("${}"),
  };
  result.properties["animate-scroll"] = {
    "fade-in": animate("none", true),
    "zoom-in": animate("scale(2)", true),
    "zoom-out": animate("scale(0)", true),
    "slide-top": animate("translateY(50%)", true),
    "slide-right": animate("translateX(-50%)", true),
    "slide-bottom": animate("translateY(-50%)", true),
    "slide-left": animate("translateX(50%)", true),
    "*": animate("${}", true),
  };

  /* Border */
  result.vars["border-size"] = config.border?.size ?? "1px";
  result.vars["border-color"] = config.border?.color ?? "rgba(125, 125, 125, 0.4)";
  result.properties["border"] = {
    default: "border: $border-size solid $border-color",
    x: "border-left: $border-size solid $border-color; border-right: $border-size solid $border-color",
    y: "border-top: $border-size solid $border-color; border-bottom: $border-size solid $border-color",
    top: "border-top: $border-size solid $border-color",
    right: "border-right: $border-size solid $border-color",
    bottom: "border-bottom: $border-size solid $border-color",
    left: "border-left: $border-size solid $border-color",
    transparent: "border: $border-size solid transparent",
    "*": "border: ${}",
  };
  result.properties["border-x"] = {
    "*": "border-left: ${}; border-right: ${}",
  };
  result.properties["border-y"] = {
    "*": "border-top: ${}; border-bottom: ${}",
  };

  /* Border Radius */
  result.vars.radius = config.radius ?? "6px";
  result.properties["rounded"] = {
    default: "border-radius: $radius",
  };
  result.properties["edged"] = {
    default: "border-radius: 0",
  };
  result.properties["circular"] = {
    default: "border-radius: 50%",
  };
  result.properties["radius"] = {
    edged: "border-radius: 0",
    rounded: "border-radius: $radius",
    circular: "border-radius: 50%",
    "*": "border-radius: ${}",
  };

  /* Visibility */
  result.properties["hidden"] = {
    default: "display: none",
  };
  result.properties["visible"] = {
    default: "display: block",
  };
  result.properties["invisible"] = {
    default: "display: block; visibility: hidden",
  };

  /* Divider */
  const divider = {
    position: "relative",
    width: "100%",
    height: "$border-size",
    background: "$border-color",
    margin: "4rem 0",
    display: "block",

    after: {
      position: "absolute",
      content: "attr(label)",
      "max-width": "90%",
      left: "50%",
      padding: "0 2rem",
      color: "$border-color",
      "font-size": "$font-size-small",
      "backdrop-filter": "$blur",
      overflow: "hidden",
      "text-overflow": "ellipsis",
      "white-space": "nowrap",
      translate: "-50% -50%",
    },
  };
  result.properties["divider"] = {
    default: divider,
    horizontal: divider,
    vertical: {
      ...divider,
      height: "100%",
      width: "$border-size",
      margin: "0 4rem",
      after: { ...divider.after, top: "50%", "max-height": "90%", "max-width": "unset", padding: "2rem 0" },
    },
  };

  /* Group */
  const group = (vertical) => ({
    display: "flex",
    "flex-flow": vertical ? "column nowrap" : "row nowrap",
    "align-items": "stretch",
    "border-radius": "$radius",
    border: "$border-size solid $border-color",
    gap: "0",
    overflow: "clip",

    ">*": {
      flex: "none",
      [vertical ? "height" : "width"]: "auto",
      "border-radius": "0!",
      border: "none!",

      "&:not(:first-child)": {
        [vertical ? "border-top" : "border-left"]: "$border-size solid $border-color!",
      },
    },
  });
  result.properties["group"] = {
    default: group(),
    horizontal: group(),
    vertical: group(true),
  };

  /* Hightlight */
  result.properties["hightlight"] = {
    default:
      "box-shadow: color-mix(in srgb, $light-color 50%, white) 0px 0px 6px 1px, color-mix(in srgb, $light-color 50%, white) 0px 0px 2px 0px;",
    "*": "box-shadow: color-mix(in srgb, ${} 50%, white) 0px 0px 6px 1px, color-mix(in srgb, ${} 50%, white) 0px 0px 2px 0px;",
  };

  /* Icons */
  result.vars["icon-size"] = config.icon?.size ?? "1.5em";
  result.vars["icon-font"] = config.icon?.font?.family ?? "Material Symbols";
  const { family: iconFontFamily, ...options } = config.icon?.font || {
    src: `url('${icons}') format('truetype')`,
  };
  result.fonts[iconFontFamily ?? "Material Symbols"] = options;
  result.animations["loading"] = { from: { rotate: "0deg" }, to: { rotate: "360deg" } };
  result.properties["icon"] = {
    outlined: "before:(font-variation-settings:'FILL' 0!)",
    right: "before:(float:right)",
    loading:
      "before:(content: ''; display:inline-block; float: left; animation: loading 1s linear infinite; height:$icon-size; width:$icon-size; border-radius:50%; border:.5rem solid currentColor; border-top-color:transparent; border-right-color:transparent)",
    "*":
      "before:(font-family:$icon-font; content:'\\${}'; float:left; font-size:$icon-size; font-variation-settings:'FILL' 1; font-weight:normal; font-style: normal; " +
      "line-height: 100%; text-transform:none; letter-spacing:normal; word-wrap:normal; white-space:nowrap; direction:ltr; -webkit-font-soothing:antialiased; " +
      "text-rendering:optimizeLegibility; -moz-osx-font-soothing:grayscale; font-feature-settings:'liga')",
  };

  /* Position */
  result.properties["relative"] = {
    default: "position: relative",
  };
  result.properties["absolute"] = {
    default: "position:absolute",
    center: "position:absolute; top:50%; left:50%; translate:-50% -50%;",
  };
  result.properties["fixed"] = {
    default: "position:fixed",
    center: "position:fixed; top:50%; left:50%; translate:-50% -50%;",
  };
  result.properties["sticky"] = {
    default: "position: sticky",
  };
  result.properties["static"] = {
    default: "position: static",
  };
  result.properties["anchor"] = {
    "*": "position-area: ${}",
  };
  result.properties["z"] = {
    "*": "z-index: ${}",
  };

  /* Overflow */
  result.properties["scroll"] = {
    default: "overflow: scroll; scrollbar-gutter: stable both-edges",
    x: "overflow-x: scroll; scrollbar-gutter: stable both-edges",
    y: "overflow-y: scroll; scrollbar-gutter: stable both-edges",
  };
  result.properties["scrollbar"] = {
    hidden: "scrollbar-width: none; &::-webkit-scrollbar { display: none; }",
  };
  result.properties["overflow"] = {
    default: "overflow: auto",
    "*": "overflow: ${}",
  };

  /* Shadows */
  result.vars["shadow-offset"] = config.shadow?.offset ?? "0px 4px";
  result.vars["shadow-blur"] = config.shadow?.blur ?? config.blur ?? "8px";
  result.vars["shadow-color"] = config.shadow?.color ?? "#00000040";
  result.root["$shadow"] = "$shadow-offset $shadow-blur 0px $shadow-color";
  result.properties["shadow"] = {
    default: "box-shadow: $shadow",
    none: "box-shadow: none",
    inset: "box-shadow: inset $shadow",
    "*": "box-shadow: ${}",
  };

  /* Spacing */
  result.properties["m"] = {
    "*": "margin: ${}",
  };
  result.properties["mx"] = {
    "*": "margin-left: ${}; margin-right: ${}",
  };
  result.properties["my"] = {
    "*": "margin-top: ${}; margin-bottom: ${}",
  };
  result.properties["mt"] = {
    "*": "margin-top: ${}",
  };
  result.properties["mr"] = {
    "*": "margin-right: ${}",
  };
  result.properties["mb"] = {
    "*": "margin-bottom: ${}",
  };
  result.properties["ml"] = {
    "*": "margin-left: ${}",
  };
  result.properties["p"] = {
    "*": "padding: ${}",
  };
  result.properties["px"] = {
    "*": "padding-left: ${}; padding-right: ${}",
  };
  result.properties["py"] = {
    "*": "padding-top: ${}; padding-bottom: ${}",
  };
  result.properties["pt"] = {
    "*": "padding-top: ${}",
  };
  result.properties["pr"] = {
    "*": "padding-right: ${}",
  };
  result.properties["pb"] = {
    "*": "padding-bottom: ${}",
  };
  result.properties["pl"] = {
    "*": "padding-left: ${}",
  };

  /* Text */
  result.properties["text"] = {
    center: "text-align: center",
    right: "text-align: right",
    left: "text-align: left",
    justify: "text-align: justify",
    lowercase: "text-transform: lowercase",
    uppercase: "text-transform: uppercase",
    capitalize: "text-transform: capitalize",
    ellipsis: "overflow: clip visible; text-overflow: ellipsis; white-space: nowrap",
    clip: "overflow: clip visible; text-overflow: clip; white-space: nowrap",
    trucante: "display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: clip visible",
    break: "hyphens: auto; word-break: break-word; white-space: break-spaces",
  };

  /* Tooltip */
  result["[tooltip]:not([disabled])"] = {
    position: "relative",
    after: {
      position: "absolute",
      with: "max-content",
      "max-width": "50vw",
      content: "attr(tooltip)",
      inset: "50% auto auto 50%",
      padding: "1rem 2rem",
      "font-size": "$font-size-small",
      "white-space": "break-spaces",
      color: "$secondary-contrast-color",
      background: "color-mix(in srgb, transparent 40%, $secondary-color)",
      "backdrop-filter": "$blur",
      "border-radius": "$radius",
      translate: "-50% -50%",
      "box-shadow": "$shadow",
      opacity: "0",
      overflow: "clip",
      "z-index": "20",
      "pointer-events": "none",
      display: "block",
      transition: "opacity $duration, inset $duration, translate $duration",
    },

    "@media(hover: hover)": {
      hover: {
        after: {
          opacity: "1",
          inset: "var(--tooltip-position, 0 auto auto 50%)",
          translate: "var(--tooltip-translate, -50% calc(-100% - 2rem))",
        },
      },
    },
  };
  result.properties["tooltip"] = {
    top: "$tooltip-position: 0 auto auto 50%; $tooltip-translate: -50% calc(-100% - 2rem)",
    right: "$tooltip-position: 50% auto auto 100%; $tooltip-translate: 2rem -50%",
    bottom: "$tooltip-position: 100% auto auto 50%; $tooltip-translate: -50% 2rem",
    left: "$tooltip-position: 50% auto auto 0; $tooltip-translate: calc(-100% - 2rem) -50%",
  };

  return result;
};
