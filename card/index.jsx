import { Component, Style } from "@vistta/js";
import { style as globalStyle } from "../utils";

/**
 * @typedef {JSX.EventHandlers & {
 *  ref?: import("@vistta/js").Ref<HTMLDivElement> | ((element: HTMLDivElement) => void),
 *  id?: string,
 *  style?: JSX.Style,
 * }} CardProps
 */

/**
 * @extends {Component<CardProps>}
 */
export default class Card extends Component {
  static set style(value) {
    globalStyle.update("card", value);
  }

  static get style() {
    return globalStyle.value?.card || {};
  }

  globalStyle = globalStyle();

  render() {
    return (
      <div
        style={Style.assign(
          {
            position: "relative",
            container: "default",
            padding: "2rem",
            background: "default",
            radius: "rounded",
            border: "default",
          },
          this.globalStyle.card || {},
          this.style,
        )}
        {...this.props("style")}
      >
        {this.children}
      </div>
    );
  }
}
