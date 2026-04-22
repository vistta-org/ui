import { Component } from "@vistta/js";
import Button from "../button/index.jsx";
import Popover from "../popover/index.jsx";
import { Style } from "../utils";

/**
 * @typedef {object} ToastProps
 * @property {string} [id]
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

  render() {
    return (
      <Popover
        ref={this.ref}
        id={this.id}
        open
        inert
        onOutsideClick={this.onOutsideClick}
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
      </Popover>
    );
  }
}

export default Toast;

function getBackgroundColor(variant) {
  if (variant === "success" || variant === "error" || variant === "info" || variant === "warning")
    return `color-mix(in srgb, color-mix(in srgb, $${variant}-color 80%, $back-color) 80%, transparent)`;
  return `color-mix(in srgb, color-mix(in srgb, $fore-color 20%, $back-color) 80%, transparent)`;
}
