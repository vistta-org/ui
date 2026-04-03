import { Component, Ref } from "@vistta/js";
import Button from "../button/index.jsx";
import { Style } from "../utils";

/**
 * @typedef {object} ToastProps
 * @property {string} [id]
 * @property {Ref<HTMLButtonElement> | ((element: HTMLButtonElement) => void)} [ref]
 * @property {JSX.Style} [style]
 * @property {string} [message]
 * @property {"top" | "bottom"} [position]
 * @property {"basic" | "success" | "error" | "info" | "warning"} [variant]
 * @property {(event: MouseEvent) => void} [onDismiss]
 * @property {(event: MouseEvent) => void} [onOutsideClick]
 */

/**
 * @extends {Component<ToastProps>}
 */
class Toast extends Component {
  variant = /** @type {"basic"} */ ("basic");
  #node;
  #handler;

  onConnect() {
    this.#handler = (event) => {
      if (!this.#node || this.#node.contains(event.target)) return;
      this.onOutsideClick?.(event);
    };
    this.onOutsideClick && document.addEventListener("click", this.#handler);
  }

  onDisconnect() {
    this.onOutsideClick && document.removeEventListener("click", this.#handler);
  }

  register(element) {
    this.#node = element;
    requestAnimationFrame(() => this.#node.showPopover());
  }

  render() {
    return (
      <aside
        ref={Ref.forward(this.ref, this.register.bind(this))}
        id={this.id}
        style={Style.assign(
          {
            p: "4rem",
            inset: this.position === "bottom" ? "100% auto auto 50%" : "0% auto auto 50%",
            translate: this.position === "bottom" ? "-50% calc(-100% - 4rem)" : "-50% 4rem",
            animate: this.position === "bottom" ? "slide-top" : "slide-bottom",
            background: getBackgroundColor(this.variant),
            backdropFilter: "$blur",
            shadow: "default",
          },
          this.style,
        )}
        popover="manual"
      >
        <p>
          {`${this.message}`}
          {this.onDismiss && (
            <Button
              variant="raw"
              icon="e5cd"
              style="display:inline; ml:4rem; p:0!; float:right; color:inherit!; :before:(left:0!)"
              onClick={this.onDismiss}
            />
          )}
        </p>
      </aside>
    );
  }
}

export default Toast;

function getBackgroundColor(variant) {
  if (variant === "success" || variant === "error" || variant === "info" || variant === "warning")
    return `color-mix(in srgb, color-mix(in srgb, $${variant}-color 80%, $back-color) 80%, transparent)`;
  return `color-mix(in srgb, color-mix(in srgb, $fore-color 20%, $back-color) 80%, transparent)`;
}
