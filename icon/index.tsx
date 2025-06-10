import { Component, Ref } from "@vistta/js";
import { getTooltipLabel, type Tooltip } from "../utils";

class Icon extends Component {
  id?: string;
  ref?: Ref<HTMLElement> | ((element: HTMLElement) => void) | null;
  anchor?: string;
  className?: string;
  code?: string;
  tooltip?: Tooltip;
  style?: Record<string, string>;

  getClassName() {
    const className = this.className?.split(" ") || [];
    if (typeof this.tooltip === "object" && this.tooltip.position)
      className.push(`tooltip:${this.tooltip.position}`);
    return className.join(" ");
  }

  render() {
    return (
      <span
        id={this.id}
        ref={this.ref}
        anchor={this.anchor}
        className={this.getClassName()}
        data-icon={this.code}
        data-tooltip={getTooltipLabel(this.tooltip)}
        style={this.style}
      />
    );
  }
}

export default Icon;
