import { Component } from "@vistta/js";
import { expandStyle, getTooltipLabel, iconToStyle } from "../utils";

/**
 * @typedef {HTMLButtonElement & {
 *   variant?: "primary" | "secondary" | "tertiary" | "light" | "dark" | "info" | "success" | "warning" | "error",
 *   action?: boolean,
 *   raw?: boolean,
 *   icon?: Icon,
 *   tooltip?: Tooltip,
 *   loading?: boolean
 * }} ButtonProps
 */

/**
 * @extends {Component<ButtonProps>}
 */
class Button extends Component {
  variant;
  action;
  raw;
  icon;
  tooltip;
  loading;

  render() {
    const { label, name, tooltip, type, style, variant, raw, action, loading, icon, children, ...props } = this;
    return (
      <button
        aria-label={label || name}
        name={label || name}
        tooltip={getTooltipLabel(tooltip)}
        type={type || "button"}
        style={expandStyle(
          style,
          ...variantToStyle(variant, raw),
          action && "p:2rem!",
          loading && "icon:loading",
          ...iconToStyle(icon),
        )}
        {...props}
      >
        {!action && (label || children)}
      </button>
    );
  }
}

export default Button;

function variantToStyle(variant, raw) {
  if (!variant) return raw ? ["background:none", "color:default"] : [];
  switch (variant) {
    case "primary":
      return raw ? ["background:none", "color:primary"] : ["background:primary", "color:primary-contrast"];
    case "secondary":
      return raw ? ["background:none", "color:secondary"] : ["background:secondary", "color:secondary-contrast"];
    case "tertiary":
      return raw ? ["background:none", "color:tertiary"] : ["background:tertiary", "color:tertiary-contrast"];
    case "light":
      return raw ? ["background:none", "color:light"] : ["background:light", "color:dark"];
    case "dark":
      return raw ? ["background:none", "color:dark"] : ["background:dark", "color:light"];
    case "info":
      return raw ? ["background:none", "color:info"] : ["background:info", "color:info-contrast"];
    case "success":
      return raw ? ["background:none", "color:success"] : ["background:success", "color:success-contrast"];
    case "warning":
      return raw ? ["background:none", "color:warning"] : ["background:warning", "color:warning-contrast"];
    case "error":
      return raw ? ["background:none", "color:error"] : ["background:error", "color:error-contrast"];
    default:
      return [];
  }
}
