import { Component } from "@vistta/js";
import { assignStyle, getTooltipLabel } from "../utils";

const ICON_POSITION = {
  left: { pl: "10rem", before: { position: "absolute", left: "2rem", top: "50%", translate: "0 -50%" } },
  right: { pr: "10rem", before: { position: "absolute", right: "2rem", top: "50%", translate: "0 -50%" } },
};

/**
 * @typedef {import("../utils").Tooltip} Tooltip
 * @typedef {object} ButtonProps
 * @property {string} [id]
 * @property {Ref<HTMLButtonElement> | ((element: HTMLButtonElement) => void)} [ref]
 * @property {string} [name]
 * @property {string} [label]
 * @property {JSX.Anchor} [anchor]
 * @property {"basic" | "primary" | "secondary" | "tertiary" | "light" | "dark" | "info" | "success" | "warning" | "error"} [variant]
 * @property {boolean} [action]
 * @property {boolean} [active]
 * @property {Icon} [icon]
 * @property {boolean} [loading]
 * @property {boolean} [raw]
 * @property {JSX.Style} [style]
 * @property {Tooltip} [tooltip]
 * @property {boolean} [disabled]
 * @property {HTMLButtonElement["type"]} [type]
 * @property {HTMLButtonElement["onclick"]} [onClick]
 * @property {HTMLButtonElement["oncontextmenu"]} [onContextMenu]
 * @property {HTMLButtonElement["ondblclick"]} [onDblClick]
 * @property {HTMLButtonElement["onmousedown"]} [onMouseDown]
 * @property {HTMLButtonElement["onmouseenter"]} [onMouseEnter]
 * @property {HTMLButtonElement["onmousemove"]} [onMouseMove]
 * @property {HTMLButtonElement["onmouseleave"]} [onMouseLeave]
 * @property {HTMLButtonElement["onmouseover"]} [onMouseOver]
 * @property {HTMLButtonElement["onmouseout"]} [onMouseOut]
 * @property {HTMLButtonElement["onmouseup"]} [onMouseUp]
 */

/**
 * @extends {Component<ButtonProps>}
 */
export class Button extends Component {
  render() {
    return (
      <button
        id={this.id}
        ref={this.ref}
        anchor={this.anchor}
        aria-label={this.label || this.name}
        name={this.label || this.name}
        tooltip={getTooltipLabel(this.tooltip)}
        type={this.type || "button"}
        style={assignStyle(
          {
            p: this.action && "2rem!",
            tooltip: this.tooltip?.position,
          },
          variantToStyle(this.variant, this.raw),
          iconToStyle(this.loading ? "loading" : this.icon, this.action),
          this.style,
        )}
        onClick={this.onClick}
        onContextMenu={this.onContextMenu}
        onDblClick={this.onDblClick}
        onMouseDown={this.onMouseDown}
        onMouseEnter={this.onMouseEnter}
        onMouseMove={this.onMouseMove}
        onMouseLeave={this.onMouseLeave}
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}
        onMouseUp={this.onMouseUp}
        active={this.active}
        disabled={this.disabled || this.loading}
      >
        {!this.action && (this.label || this.children)}
      </button>
    );
  }
}

export default Button;

export function variantToStyle(variant, raw) {
  if (!variant) return raw ? ["background:none", "color:default"] : [];
  switch (variant) {
    case "basic":
      return {
        background: raw ? "none" : "default",
        color: "default",
      };
    case "primary":
      return raw ? { background: "none", color: "primary" } : { background: "primary", color: "primary-contrast" };
    case "secondary":
      return raw ? { background: "none", color: "secondary" } : { background: "secondary", color: "secondary-contrast" };
    case "tertiary":
      return raw ? { background: "none", color: "tertiary" } : { background: "tertiary", color: "tertiary-contrast" };
    case "light":
      return raw ? { background: "none", color: "light" } : { background: "light", color: "dark" };
    case "dark":
      return raw ? { background: "none", color: "dark" } : { background: "dark", color: "light" };
    case "info":
      return raw ? { background: "none", color: "info" } : { background: "info", color: "info-contrast" };
    case "success":
      return raw ? { background: "none", color: "success" } : { background: "success", color: "success-contrast" };
    case "warning":
      return raw ? { background: "none", color: "warning" } : { background: "warning", color: "warning-contrast" };
    case "error":
      return raw ? { background: "none", color: "error" } : { background: "error", color: "error-contrast" };
    default:
      return {};
  }
}

export function iconToStyle(icon, action) {
  if (!icon) return [];
  if (typeof icon === "object") {
    if (action) return { icon: icon.code };
    return { icon: icon.code, ...ICON_POSITION[icon.position || "left"] };
  }
  return action ? { icon } : { icon, ...ICON_POSITION["left"] };
}
