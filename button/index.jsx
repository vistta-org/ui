import { Component } from "@vistta/js";
import { expandStyle, getTooltipLabel } from "../utils";

const ICON_POSITION = {
  left: ["pl:10rem", "before:(position:absolute; left:2rem; top:50%; translate: 0-50%)"],
  right: ["pr:10rem", "before:(position:absolute; right:2rem; top:50%; translate: 0-50%)"],
};

/**
 * @extends {Component<{
 *   id?: string,
 *   ref?: Ref<HTMLButtonElement> | ((element: HTMLButtonElement) => void),
 *   name?: string,
 *   label?: string,
 *   anchor?: JSX.Anchor,
 *   varian?: "basic" | "primary" | "secondary" | "tertiary" | "light" | "dark" | "info" | "success" | "warning" | "error",
 *   action?: boolean,
 *   active?: boolean,
 *   icon?: Icon,
 *   loading?: boolean,
 *   raw?: boolean,
 *   style?: JSX.Style;
 *   tooltip?: Tooltip,
 *   type?: HTMLButtonElement["type"]
 *   onClick?: HTMLButtonElement["onclick"]
 *   onContextMenu?: HTMLButtonElement["oncontextmenu"]
 *   onDblClick?: HTMLButtonElement["ondblclick"]
 *   onMouseDown?: HTMLButtonElement["onmousedown"]
 *   onMouseEnter?: HTMLButtonElement["onmouseenter"]
 *   onMouseMove?: HTMLButtonElement["onmousemove"]
 *   onMouseLeave?: HTMLButtonElement["onmouseleave"]
 *   onMouseOver?: HTMLButtonElement["onmouseover"]
 *   onMouseOut?: HTMLButtonElement["onmouseout"]
 *   onMouseUp?: HTMLButtonElement["onmouseup"]
 * }>}
 */
class Button extends Component {
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
        style={expandStyle(
          this.style,
          ...variantToStyle(this.variant, this.raw),
          this.action && "p:2rem!",
          ...iconToStyle(this.loading ? "loading" : this.icon, this.action),
          this.tooltip?.position && `tooltip:${this.tooltip.position}`,
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

function variantToStyle(variant, raw) {
  if (!variant) return raw ? ["background:none", "color:default"] : [];
  switch (variant) {
    case "basic":
      return raw ? ["background:none", "color:default"] : ["background:default", "color:default"];
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

function iconToStyle(icon, action) {
  if (!icon) return [];
  if (typeof icon === "object") {
    if (action) return [`icon:${icon.code}`];
    if (icon.position) return [`icon:${icon.code}`, ...ICON_POSITION[icon.position]];
    return [`icon:${icon.code}`, ...ICON_POSITION["left"]];
  }
  return action ? [`icon:${icon}`] : [`icon:${icon}`, ...ICON_POSITION["left"]];
}
