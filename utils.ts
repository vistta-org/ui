export type HorizontalPosition = "left" | "right" | "center";
export type VerticalPosition = "top" | "bottom" | "center";
export type Position = HorizontalPosition | VerticalPosition;
export type CompositePosition = Position | `${VerticalPosition} ${HorizontalPosition}`;
export type Icon = string | { code: string; position: Omit<HorizontalPosition, "center"> };
export type Tooltip = string | { label: string; position?: Position };

export const getIconCode = (icon) => (typeof icon === "object" ? icon.code : icon);
export const getTooltipLabel = (tooltip) => (typeof tooltip === "object" ? tooltip.label : tooltip);
