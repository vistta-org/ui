import { Component, Ref } from "@vistta/js";
import { assignStyle } from "../utils";

/**
 * @extends {Component<{
 *   id?: string,
 *   ref?: Ref<HTMLSpanElement> | ((element: HTMLSpanElement) => void),
 *   code?: string,
 *   outlined?: boolean,
 *   style?: JSX.Style;
 * }>}
 */
class Icon extends Component {
  render() {
    if (!this.code) return null;
    return (
      <span
        id={this.id}
        ref={this.ref}
        style={assignStyle(this.style, `icon:${this.code}`, this.outlined && "icon:outlined")}
      />
    );
  }
}

export default Icon;
