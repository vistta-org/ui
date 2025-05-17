export function getTooltipLabel(tooltip) {
    if (typeof tooltip === "object") return tooltip.label;
    return tooltip;
}