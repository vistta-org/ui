import { contrastColor, formatColor, mixColors } from "@vistta/utils";

export default (config, result) => {
  const colors = Object.assign(
    {
      dark: "#181818",
      light: "#e0e0e0",
      primary: "#c68346",
      secondary: "#3d3d3d",
      info: "#23abb6",
      success: "#37cc73",
      warning: "#f7b737",
      error: "#e23b3b",
    },
    config.colors || {},
  );

  result.properties.color = {
    default: "color: $fore-color",
    "*": "color: ${}",
  };
  result.properties.background = {
    default: "background: $back-color",
    overlay: "background: $overlay-color; backdrop-filter: $blur",
    "*": "background: ${}",
  };
  if (!colors.dark && !colors.light)
    throw new Error('You must provide at least a "dark" or "light" color scheme in the colors config.');
  colors.neutral = mixColors(colors.dark, colors.light);
  const colorNames = Object.keys(colors || {});
  for (let i = 0, len = colorNames.length; i < len; i++) {
    const color = colorNames[i];
    result.vars[`${color}-color`] = colors[color].startsWith("#") ? colors[color] : formatColor(colors[color], "hex");
    result.properties.color[color] = "color: $" + color + "-color";
    result.properties.background[color] = "background: $" + color + "-color";
    if (color === "light" || color === "dark" || color === "neutral") continue;
    result.vars[`${color}-contrast-color`] = contrastColor(colors[color]);
    result.properties.color[color + "-contrast"] = "color: $" + color + "-contrast-color";
    result.properties.background[color + "-contrast"] = "background: $" + color + "-contrast-color";
  }
  return result;
};
