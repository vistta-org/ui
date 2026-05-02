import { Component, Ref } from "@vistta/js";
import { Style, getTooltipLabel } from "../utils";

const ICON_POSITION = {
  left: { pl: "10rem", ":before": { position: "absolute", left: "2rem", top: "50%", translate: "0 -50%" } },
  right: { pr: "10rem", ":before": { position: "absolute", right: "2rem", top: "50%", translate: "0 -50%" } },
};

const HANDLED_PROPS = ["name", "label", "variant", "icon", "loading", "style", "tooltip", "disabled", "type"];

/**
 * @typedef {import("../utils").Tooltip} Tooltip
 * @typedef {any} Icon
 *
 * @typedef {"primary" | "secondary" | "tertiary" | "light" | "dark" | "info" | "success" | "warning" | "error"} Colors
 *
 * @typedef {JSX.EventHandlers & {
 *  id?: string,
 *  ref?: Ref<HTMLButtonElement> | ((element: HTMLButtonElement) => void),
 *  name?: string,
 *  label?: string,
 *  variant?: "" | "default" | "basic" | "raw" | Colors | `raw ${Colors}` | `${Colors} raw`,
 *  active?: boolean,
 *  icon?: Icon,
 *  loading?: boolean,
 *  style?: JSX.Style,
 *  tooltip?: Tooltip,
 *  disabled?: boolean,
 *  hidden?: boolean,
 *  type?: HTMLButtonElement["type"],
 * }} ButtonProps
 */

/**
 * @extends {Component<ButtonProps>}
 */
export class Button extends Component {
  render() {
    return (
      <button
        aria-label={this.label || this.name}
        name={this.label || this.name}
        tooltip={getTooltipLabel(this.tooltip)}
        type={this.type || "button"}
        style={Style.assign(
          {
            p: !this.label && "2rem!",
            tooltip: typeof this.tooltip === "object" && this.tooltip?.position,
          },
          variantToStyle(this.variant),
          iconToStyle(this.loading ? "loading" : this.icon, !this.label),
          this.style,
        )}
        disabled={this.disabled || this.loading}
        {...this.props(...HANDLED_PROPS)}
      >
        {this.label || this.children}
      </button>
    );
  }
}

export default Button;

export function variantToStyle(variant) {
  if (!variant || variant === "default") return [];
  switch (variant) {
    case "basic":
      return {
        background: "default",
        color: "default",
      };
    case "raw":
      return {
        background: "none",
        color: "default",
      };
    default: {
      let raw = false;
      if (variant.startsWith("raw ")) ((raw = true), (variant = variant.slice(4)));
      else if (variant.endsWith(" raw")) ((raw = true), (variant = variant.slice(0, -4)));
      if (raw) return { background: "none", color: variant };
      if (variant === "light") return { background: "light", color: "dark" };
      if (variant === "dark") return { background: "dark", color: "light" };
      return { background: variant, color: `${variant}-contrast` };
    }
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
