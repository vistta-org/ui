import { Component, Ref, Style } from "@vistta/js";

/**
 * @typedef {JSX.EventHandlers & {
 *  ref?: Ref<HTMLDivElement> | ((element: HTMLDivElement) => void),
 *  id?: string,
 *  style?: JSX.Style,
 * }} CardProps
 */

/**
 * @extends {Component<CardProps>}
 */
export default class Card extends Component {
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
            "> *": {
              col: "full",
            },
          },
          this.style,
        )}
        {...this.props("style")}
      >
        {this.children}
      </div>
    );
  }
}
