import { Component, Ref } from "@vistta/js";
import { getIconCode, getTooltipLabel, type Icon, type Tooltip } from "../utils";

type ButtonTypeVariants = "default" | "soft" | "raw" | "outline";
type ButtonStyleVariants =
  | "primary"
  | "secondary"
  | "tertiary"
  | "light"
  | "dark"
  | "info"
  | "success"
  | "warning"
  | "error";
export type ButtonVariants =
  | ButtonTypeVariants
  | ButtonStyleVariants
  | `${ButtonTypeVariants} ${ButtonStyleVariants}`
  | `${ButtonStyleVariants} ${ButtonTypeVariants}`;

class Button extends Component {
  id?: string;
  ref?: Ref<HTMLButtonElement> | ((element: HTMLButtonElement) => void) | null;
  anchor?: any;
  class?: string;
  variant?: ButtonVariants;
  action?: boolean;
  active?: boolean;
  icon?: Icon;
  label?: string;
  name?: string;
  tooltip?: Tooltip;
  type?: "button" | "submit" | "reset";
  style?: Record<string, string>;
  loading?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  onClick?: (event?: MouseEvent) => any;

  getClass() {
    const result = this.class?.split(" ") || [];
    if (this.variant) result.push(this.variant);
    if (this.action) result.push("action");
    if (this.active) result.push("active");
    if (this.loading) result.push("loading");
    if (typeof this.tooltip === "object" && this.tooltip.position) result.push(`tooltip:${this.tooltip.position}`);
    if (typeof this.icon === "object" && this.icon.position) result.push(`icon:${this.icon.position}`);
    return result.join(" ");
  }

  render() {
    return (
      <button
        ref={this.ref}
        id={this.id}
        class={this.getClass()}
        data-icon={getIconCode(this.icon)}
        aria-label={this.label || this.name}
        name={this.label || this.name}
        data-tooltip={getTooltipLabel(this.tooltip)}
        type={this.type || "button"}
        style={this.style}
        onClick={this.onClick}
        disabled={this.disabled}
        readonly={this.readonly}
      >
        {!this.action && (this.label || this.children)}
      </button>
    );
  }
}

export default Button;
