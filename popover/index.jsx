import { Component, Ref } from "@vistta/js";
import { Style } from "../utils";

const HANDLED_PROPS = ["ref", "open", "manual", "inert", "style", "onOutsideClick"];

/**
 * @typedef {JSX.EventHandlers & {
 *  id?: string,
 *  ref?: Ref<HTMLElement> | ((element: HTMLElement) => void),
 *  open?: boolean,
 *  manual?: boolean,
 *  inert?: boolean,
 *  style?: JSX.Style,
 *  onOutsideClick?: (event: MouseEvent) => void,
 * }} PopoverProps
 */

/**
 * @extends {Component<PopoverProps>}
 */
class Popover extends Component {
  #node;
  #handler;

  onConnect() {
    if (this.manual) return;
    this.#handler = (event) => {
      if (!this.#node || !this.open || this.#node.contains(event.target)) return;
      this.onOutsideClick?.(event);
    };
    this.onOutsideClick && document.addEventListener("click", this.#handler);
  }

  onDisconnect() {
    if (this.manual) return;
    this.onOutsideClick && document.removeEventListener("click", this.#handler);
  }

  #register(element) {
    if (this.manual) return;
    this.#node = element;
    if (this.open) requestAnimationFrame(() => this.#node.isConnected && this.#node.showPopover());
  }

  onUpdate(prev) {
    if (this.manual || prev.open === this.open) return;
    if (this.open) this.#node?.showPopover();
    else this.#node?.hidePopover();
  }

  render() {
    if (this.inert)
      return (
        <aside
          ref={Ref.forward(this.ref, this.#register.bind(this))}
          style={Style.assign(
            {
              container: "center",
              width: "min-content",
              animate: "fade",
            },
            this.style,
          )}
          popover="manual"
          open={this.manual ? this.open : undefined}
          {...this.props(...HANDLED_PROPS)}
        >
          {this.children}
        </aside>
      );
    return (
      <dialog
        ref={Ref.forward(this.ref, this.#register.bind(this))}
        style={Style.assign(
          {
            container: "center",
            width: "min-content",
            animate: "fade",
          },
          this.style,
        )}
        popover="manual"
        open={this.manual ? this.open : undefined}
        {...this.props(...HANDLED_PROPS)}
      >
        {this.children}
      </dialog>
    );
  }
}

export default Popover;
