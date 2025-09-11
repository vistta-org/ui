import { Component, Ref } from "@vistta/js";
import { getTooltipLabel, type Tooltip } from "../utils";

class Icon extends Component {
  id?: string;
  ref?: Ref<HTMLElement> | ((element: HTMLElement) => void) | null;
  anchor?: string;
  class?: string;
  code?: string;
  tooltip?: Tooltip;
  style?: Record<string, string>;

  getClass() {
    const result = this.class?.split(" ") || [];
    if (typeof this.tooltip === "object" && this.tooltip.position) result.push(`tooltip:${this.tooltip.position}`);
    return result.join(" ");
  }

  render() {
    return (
      <span
        id={this.id}
        ref={this.ref}
        anchor={this.anchor}
        class={this.getClass()}
        data-icon={this.code}
        data-tooltip={getTooltipLabel(this.tooltip)}
        style={this.style}
      />
    );
  }
}

export default Icon;
