/**
 * @typedef {"left" | "right" | "center"} HorizontalPosition
 * @typedef {"top" | "bottom" | "center"} VerticalPosition
 * @typedef {HorizontalPosition | VerticalPosition} Position
 * @typedef {Position | `${VerticalPosition} ${HorizontalPosition}`} CompositePosition
 * @typedef {string | { code: string, position: Exclude<HorizontalPosition, "center"> }} Icon
 * @typedef {string | { label: string, position?: Position }} Tooltip
 */
export const getIconCode = (icon) => (typeof icon === "object" ? icon.code : icon);
export const getTooltipLabel = (tooltip) => (typeof tooltip === "object" ? tooltip.label : tooltip);

export const expandStyle = (style, ...args) => {
  const typeofStyle = typeof style;
  if (typeofStyle === "string") {
    for (let i = 0, len = args.length; i < len; i++) {
      if (!args[i]) continue;
      style += (style.endsWith(";") ? "" : ";") + ` ${args[i]};`;
    }
    return style;
  }
  if (typeofStyle === "object") {
    if (Array.isArray(style)) {
      style = [...style];
      for (let i = 0, len = args.length; i < len; i++) {
        if (!args[i]) continue;
        style.push(args[i]);
      }
      return style;
    }
    style = { ...(style || {}) };
  } else style = {};
  for (let i = 0, len = args.length; i < len; i++) {
    if (!args[i]) continue;
    const [key, value] = args[i].split(":");
    style[key.trim()] = value.trim().endsWith(";") ? value.trim().slice(0, -1) : value.trim();
  }
  return style;
};
