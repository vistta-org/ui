import { Component, Ref } from "@vistta/js";
import { getAnchorId, getIconCode, getTooltipLabel, type Anchor, type Icon, type Tooltip } from "../utils";

type ButtonTypeVariants = "default" | "soft" | "raw" | "outline";
type ButtonStyleVariants = "primary" | "secondary" | "tertiary" | "light" | "dark" | "info" | "success" | "warning" | "error";
export type ButtonVariants =
  | ButtonTypeVariants
  | ButtonStyleVariants
  | `${ButtonTypeVariants} ${ButtonStyleVariants}`
  | `${ButtonStyleVariants} ${ButtonTypeVariants}`;

class Button extends Component {
  id?: string;
  ref?: Ref<HTMLButtonElement> | ((element: HTMLButtonElement) => void) | null;
  anchor?: Anchor;
  className?: string;
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

  getClassName() {
    const className = this.className?.split(" ") || [];
    if (this.variant) className.push(this.variant);
    if (this.action) className.push("action");
    if (this.active) className.push("active");
    if (this.loading) className.push("loading");
    if (typeof this.anchor === "object" && this.anchor.position) className.push(`anchor:${this.anchor.position.replace(" ", ":")}`);
    if (typeof this.tooltip === "object" && this.tooltip.position) className.push(`tooltip:${this.tooltip.position}`);
    if (typeof this.icon === "object" && this.icon.position) className.push(`icon:${this.icon.position}`);
    return className.join(" ");
  }

  render() {
    return (
      <button
        ref={this.ref}
        id={this.id}
        anchor={getAnchorId(this.anchor)}
        className={this.getClassName()}
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
