import { Component, Ref, Style } from "@vistta/js";

const HANDLED_PROPS = ["id", "ref", "style"];

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
        id={this.id}
        ref={this.ref}
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
        {...Component.forwardProps(this, HANDLED_PROPS)}
      >
        {this.children}
      </div>
    );
  }
}
