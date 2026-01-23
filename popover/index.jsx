import { Component, Ref } from "@vistta/js";
import { assignStyle } from "../utils";

/**
 * @typedef {object} PopoverProps
 * @property {string} [id]
 * @property {Ref<HTMLElement> | ((element: HTMLElement) => void)} [ref]
 * @property {string} [anchor]
 * @property {boolean} [open]
 * @property {boolean} [inert]
 * @property {JSX.Style} [style]
 * @property {(event: MouseEvent) => void} [onOutsideClick]
 */

/**
 * @extends {Component<PopoverProps>}
 */
class Popover extends Component {
  #node;
  #handler;

  onConnect() {
    this.#handler = (event) => {
      if (!this.#node || !this.open || this.#node.contains(event.target)) return;
      this.onOutsideClick?.(event);
    };
    this.onOutsideClick && document.addEventListener("click", this.#handler);
  }

  onDisconnect() {
    this.onOutsideClick && document.removeEventListener("click", this.#handler);
  }

  register(element) {
    this.#node = element;
    if (this.open) requestAnimationFrame(() => this.#node.showPopover());
  }

  render() {
    if (!this.open) return null;
    if (this.inert)
      return (
        <aside
          ref={Ref.forward(this.ref, this.register.bind(this))}
          id={this.id}
          anchor={this.anchor}
          style={assignStyle(
            {
              container: "center",
              width: "fit-content",
              animate: "fade",
            },
            this.style,
          )}
          popover="manual"
        >
          {this.children}
        </aside>
      );
    return (
      <dialog
        ref={Ref.forward(this.ref, this.register.bind(this))}
        id={this.id}
        anchor={this.anchor}
        style={assignStyle(
          {
            container: "center",
            width: "fit-content",
            animate: "fade",
          },
          this.style,
        )}
        popover="manual"
      >
        {this.children}
      </dialog>
    );
  }
}

export default Popover;
