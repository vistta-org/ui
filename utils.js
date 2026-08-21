import { Context, Style } from "@vistta/js";

export { Style };

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
export const style = new Context(
  "vistta.ui.style",
  {
    accordion: {},
    accordionGroup: {},
    button: {},
    calendar: {},
    card: {},
    carousel: {},
    dropdown: {},
    icon: {},
    input: {},
    menu: {},
    modal: {},
    popover: {},
    skeleton: {},
    table: {},
    toast: {},
  },
  {
    cache: "local",
    actions: {
      update: (prev, key, value) => {
        if (typeof value !== "object") return prev;
        prev[key] = value;
        return prev;
      },
    },
  },
);
