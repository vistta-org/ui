import { Component } from "@vistta/js";
import { getTooltipLabel } from "../utils";

class Button extends Component {
  getClassName() {
    const className = this.className?.split(" ") || [];
    if (this.variant) className.push(this.variant);
    if (this.theme) className.push(this.theme);
    if (this.action) className.push("action");
    if (this.active) className.push("active");
    if (typeof this.tooltip === "object" && this.tooltip.position)
      className.push(`tooltip:${this.tooltip.position}`);
    return className.join(" ");
  }

  render() {
    return (
      <button
        ref={this.ref}
        id={this.id}
        className={this.getClassName()}
        data-icon={this.icon}
        aria-label={this.label || this.name}
        name={this.label || this.name}
        data-tooltip={getTooltipLabel(this.tooltip)}
        type={this.type || "button"}
        style={this.style}
        onClick={this.onClick}
      >
        {!this.action && (this.label || this.children)}
      </button>
    );
  }
}

export default Button;