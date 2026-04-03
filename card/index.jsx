import { Component, Ref, Style } from "@vistta/js";

/**
 * @typedef {object} CardProps
 * @property {Ref<HTMLDivElement> | ((element: HTMLDivElement) => void)} [ref] - Ref for the card container element.
 * @property {string} [id] - The unique identifier for the card element.
 * @property {JSX.Style} [style] - Style object or array of style objects to apply to the card container.
 * @property {(event: MouseEvent) => void} [onClick] - Click event handler for the card container.
 * @property {(event: MouseEvent) => void} [onContextMenu] - Context menu event handler for the card container.
 *
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
        onClick={this.onClick}
        onContextMenu={this.onContextMenu}
      >
        {this.children}
      </div>
    );
  }
}
