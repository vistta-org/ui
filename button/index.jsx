import { Component } from "@vistta/js";
import { Style, getTooltipLabel, style as globalStyle } from "../utils";

const ICON_POSITION = {
  left: { pl: "10rem", ":before": { position: "absolute", left: "2rem", top: "50%", translate: "0 -50%" } },
  right: { pr: "10rem", ":before": { position: "absolute", right: "2rem", top: "50%", translate: "0 -50%" } },
};

const HANDLED_PROPS = ["name", "label", "icon", "loading", "style", "tooltip", "disabled", "type"];

/**
 * @typedef {import("../utils").Tooltip} Tooltip
 * @typedef {import("../utils").Icon} Icon
 *
 * @typedef {"primary" | "secondary" | "tertiary" | "light" | "dark" | "info" | "success" | "warning" | "error"} Colors
 * @typedef {"" | "default" | "basic" | "raw" | "outlined" | Colors | `raw ${Colors}` | `${Colors} raw` | `outlined ${Colors}` | `${Colors} outlined`} Variants
 *
 * @typedef {JSX.EventHandlers & {
 *  id?: string,
 *  ref?: import("@vistta/js").Ref<HTMLButtonElement> | ((element: HTMLButtonElement) => void),
 *  name?: string,
 *  label?: string,
 *  active?: boolean,
 *  icon?: Icon,
 *  loading?: boolean,
 *  style?: JSX.Style | JSX.StyleObject & { variant?: Variants },
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
  static set style(value) {
    globalStyle.update("button", value);
  }

  static get style() {
    return globalStyle.value?.button || {};
  }

  globalStyle = globalStyle();

  get styleObj() {
    return Style.ensureObject(this.style);
  }

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
          variantToStyle(this.styleObj?.variant),
          iconToStyle(this.loading ? "loading" : this.icon, !this.label),
          this.globalStyle.button || {},
          this.styleObj,
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
    case "outlined":
      return {
        background: "transparent($fore-color, 90%)",
        color: "default",
        border: "$border-size solid transparent($fore-color, 50%)",
      };
    default: {
      let raw = false,
        outlined = false;
      if (variant.startsWith("raw ")) ((raw = true), (variant = variant.slice(4)));
      else if (variant.endsWith(" raw")) ((raw = true), (variant = variant.slice(0, -4)));
      else if (variant.startsWith("outlined ")) ((outlined = true), (variant = variant.slice(9)));
      else if (variant.endsWith(" outlined")) ((outlined = true), (variant = variant.slice(0, -9)));
      if (raw) return { background: "none", color: variant };
      if (outlined)
        return {
          background: `transparent($${variant}-color, 90%)`,
          color: variant,
          border: `$border-size solid transparent($${variant}-color, 50%)`,
        };
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
