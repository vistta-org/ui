export { Style } from "@vistta/js";

/**
 * @typedef {"left" | "right" | "center"} HorizontalPosition
 * @typedef {"top" | "bottom" | "center"} VerticalPosition
 * @typedef {HorizontalPosition | VerticalPosition} Position
 * @typedef {Position | `${HorizontalPosition} ${VerticalPosition}`} CompositePosition
 * @typedef {string | { code: string, position: Exclude<HorizontalPosition, "center"> }} Icon
 * @typedef {string | { label: string, position?: Position }} Tooltip
 */
export const getIconCode = (icon) => (typeof icon === "object" ? icon.code : icon);
export const getTooltipLabel = (tooltip) => (typeof tooltip === "object" ? tooltip.label : tooltip);
