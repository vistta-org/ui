import { Component, Ref } from "@vistta/js";

/**
 * @typedef {{
 *   id?: string,
 *   ref?: Ref<HTMLButtonElement> | ((element: HTMLButtonElement) => void),
 *   anchor?: any,
 *   open?: boolean,
 *   style?: JSX.Style;
 *   onOutsideClick?: (event: MouseEvent) => void;
 * }} ButtonProps
 */

/**
 * @extends {Component<ButtonProps>}
 */
class Popover extends Component {
  id;
  ref;
  anchor;
  open;
  style;
  onOutsideClick;
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
    return (
      <dialog
        ref={Ref.forward(this.ref, this.register.bind(this))}
        id={this.id}
        anchor={this.anchor}
        style={this.style}
        popover="manual"
      >
        {this.children}
      </dialog>
    );
  }
}

export default Popover;
