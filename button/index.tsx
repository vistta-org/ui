import { Component, Ref } from "@vistta/js";
import { getTooltipLabel, type Tooltip } from "../utils";

type ButtonTypeVariants = "raw" | "outline" | "default";
type ButtonStyleVariants =
  | "primary"
  | "secondary"
  | "tertiary"
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
  anchor?: string;
  className?: string;
  variant?: ButtonVariants;
  action?: boolean;
  active?: boolean;
  icon?: string | { code: string; position: "left" | "right" };
  label?: string;
  name?: string;
  tooltip?: Tooltip;
  type?: "button" | "submit" | "reset";
  style?: Record<string, string>;
  disabled?: boolean;
  readonly?: boolean;
  onClick?: (event?: MouseEvent) => any;

  getClassName() {
    const className = this.className?.split(" ") || [];
    if (this.variant) className.push(this.variant);
    if (this.action) className.push("action");
    if (this.active) className.push("active");
    if (typeof this.tooltip === "object" && this.tooltip.position)
      className.push(`tooltip:${this.tooltip.position}`);
    if (typeof this.icon === "object" && this.icon.position)
      className.push(`icon:${this.icon.position}`);
    return className.join(" ");
  }

  render() {
    return (
      <button
        ref={this.ref}
        id={this.id}
        anchor={this.anchor}
        className={this.getClassName()}
        data-icon={typeof this.icon === "object" ? this.icon.code : this.icon}
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
