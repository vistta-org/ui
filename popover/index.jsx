import { Component, Ref } from "@vistta/js";

/**
 * @extends {Component<{
 *   id?: string,
 *   ref?: Ref<HTMLButtonElement> | ((element: HTMLButtonElement) => void),
 *   anchor?: any,
 *   open?: boolean,
 *   inert?: boolean,
 *   style?: JSX.Style;
 *   onOutsideClick?: (event: MouseEvent) => void;
 * }>}
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
          style={this.style}
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
        style={this.style}
        popover="manual"
      >
        {this.children}
      </dialog>
    );
  }
}

export default Popover;
