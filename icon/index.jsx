import { Component, Ref } from "@vistta/js";
import { getTooltipLabel, style as globalStyle, Style } from "../utils";

/**
 * @extends {Component<{
 *   id?: string,
 *   ref?: Ref<HTMLSpanElement> | ((element: HTMLSpanElement) => void),
 *   code?: string,
 *   tooltip?: import("../utils").Tooltip,
 *   outlined?: boolean,
 *   style?: JSX.Style;
 * }>}
 */
class Icon extends Component {
  static set style(value) {
    globalStyle.update("icon", value);
  }

  static get style() {
    return globalStyle.value?.icon || {};
  }

  globalStyle = globalStyle();

  render() {
    if (!this.code) return null;
    return (
      <span
        id={this.id}
        ref={this.ref}
        tooltip={getTooltipLabel(this.tooltip)}
        style={Style.assign(this.style, this.globalStyle.icon || {}, {
          icon: this.code,
          iconStyle: this.outlined && "outlined",
          tooltip: typeof this.tooltip === "object" && this.tooltip?.position,
        })}
      />
    );
  }
}

export default Icon;
