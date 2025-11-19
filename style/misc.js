export default (_, result) => {
  result.animations["progress-indeterminate"] = {
    from: {
      "background-position": "200% 0%",
    },
    to: {
      "background-position": "-200% 0%",
    },
  };
  return Object.assign(result, {
    main: {
      display: "block",
    },

    hr: {
      "box-sizing": "content-box",
      height: "0",
      overflow: "visible",
    },

    img: {
      "border-style": "none",
      "max-width": "100%",
      height: "auto",
      "vertical-align": "middle",
      "font-style": "italic",
      "background-repeat": "no-repeat",
      "background-size": "cover",
      "shape-margin": "0.75rem",
    },

    dialog: {
      inset: "50% auto auto 50%",
      translate: "-50% -50%",
      padding: "2rem",
      background: "$back-color",
      border: "none",
      "border-radius": "$radius",
      shadow: "$shadow",
    },

    progress: {
      position: "relative",
      height: "1rem",
      width: "100%",
      color: "$primary-color",
      background: "$back-color",
      border: "none",
      "border-radius": "$radius",
      "vertical-align": "baseline",
      appearance: "none",

      "&::-webkit-progress-bar": {
        background: "transparent",
        "border-radius": "$radius",
      },

      "&::-webkit-progress-value, &::-moz-progress-bar": {
        background: "$primary-color",
        "border-radius": "$radius",
      },

      indeterminate: {
        animation: "progress-indeterminate 1.5s linear infinite",
        background:
          "$back-color linear-gradient(to right, $primary-color 30%, $back-color 30%) top left / 150% 150% no-repeat",

        "&::-moz-progress-bar": {
          background: "transparent",
        },
      },
    },

    meter: {
      height: "3rem",
      width: "100%",
      border: "none",
      "border-radius": "$radius",
      background: "$back-color",
      display: "block",

      "&::-webkit-meter-inner-element": {
        display: "block",
      },

      ["&::-webkit-meter-bar," +
      "&::-webkit-meter-optimum-value," +
      "&::-webkit-meter-suboptimum-value," +
      "&::-webkit-meter-even-less-good-value," +
      "&::-moz-meter-bar," +
      "&:-moz-meter-optimum," +
      "&:-moz-meter-sub-optimum," +
      "&:-moz-meter-sub-sub-optimum"]: {
        "border-radius": "$radius",
      },

      "&::-webkit-meter-optimum-value, &:-moz-meter-optimum::-moz-meter-bar": {
        background: "$success-color",
      },

      "&::-webkit-meter-suboptimum-value, &:-moz-meter-sub-optimum::-moz-meter-bar": {
        background: "$warning-color",
      },

      "&::-webkit-meter-even-less-good-value, &:-moz-meter-sub-sub-optimum::-moz-meter-bar,": {
        background: "$error-color",
      },
    },

    details: {
      display: "block",
    },

    summary: {
      display: "list-item",
    },

    "template, [hidden]": {
      display: "none",
    },
  });
};
