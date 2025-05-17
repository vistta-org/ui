import { Component } from "@vistta/js";
import { getTooltipLabel } from "../utils";

class Icon extends Component {
  getClassName() {
    const className = this.className?.split(" ") || [];
    if (typeof this.tooltip === "object" && this.tooltip.position)
      className.push(`tooltip:${this.tooltip.position}`);
    return className.join(" ");
  }

  render() {
    return (
      <span
        ref={this.ref}
        className={this.getClassName()}
        data-icon={this.code}
        data-tooltip={getTooltipLabel(this.tooltip)}
        style={this.style}
      />
    );
  }
}

export default Icon;