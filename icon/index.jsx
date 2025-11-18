import { Component } from "@vistta/js";
import { expandStyle } from "../utils";

/**
 * @typedef {HTMLSpanElement & {
 *   code: string
 * }} IconProps
 */

/**
 * @extends {Component<ButtonProps>}
 */
class Icon extends Component {
  /** @type {string} */
  code;

  render() {
    const { code, style, ...props } = this;
    return <span style={expandStyle(style, `icon:${code}`)} {...props} />;
  }
}

export default Icon;
