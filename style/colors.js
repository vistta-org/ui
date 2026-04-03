import { contrastColor, formatColor, mixColors } from "@vistta/utils";

export default (config, result) => {
  const colors = Object.assign(
    {
      dark: "#232323",
      light: "#ebebeb",
      primary: "#c68346",
      secondary: "#3d3d3d",
      info: "#23abb6",
      success: "#37cc73",
      warning: "#f7b737",
      error: "#e23b3b",
    },
    config.colors || {},
  );
  result.root.$foreColor = `light-dark($dark-color, $light-color)`;
  result.root.$backColor = `light-dark($light-color, $dark-color)`;

  result.properties.color = {
    default: { color: "$fore-color" },
    "*": { color: "${}" },
  };
  result.properties.background = {
    default: { background: "$back-color" },
    "*": { background: "${}" },
  };
  result.functions.tint = "color-mix(in srgb, ${1}, white ${2:10%})";
  result.functions.shade = "color-mix(in srgb, ${1}, black ${2:10%})";
  result.functions.transparent = "color-mix(in srgb, ${1}, transparent ${2:10%})";

  if (!colors.dark && !colors.light)
    throw new Error('You must provide at least a "dark" or "light" color scheme in the colors config.');
  colors.neutral = mixColors(colors.dark, colors.light);
  const colorNames = Object.keys(colors || {});
  for (let i = 0, len = colorNames.length; i < len; i++) {
    const value = colorNames[i];
    result.vars[`${value}-color`] = colors[value].startsWith("#") ? colors[value] : formatColor(colors[value], "hex");
    result.properties.color[value] = { color: `$${value}-color` };
    result.properties.background[value] = { background: `$${value}-color` };
    if (value === "light" || value === "dark" || value === "neutral") continue;
    result.vars[`${value}-contrast-color`] = contrastColor(colors[value]);
    result.properties.color[value + "-contrast"] = { color: `$${value}-contrast-color` };
    result.properties.background[value + "-contrast"] = { background: `$${value}-contrast-color` };
  }
  return result;
};
