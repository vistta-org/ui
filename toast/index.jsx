import { Component } from "@vistta/js";
import Button from "../button/index.jsx";
import Popover from "../popover/index.jsx";
import { Style, style as globalStyle } from "../utils";

/**
 * @typedef {object} ToastProps
 * @property {string} [id]
 * @property {import("@vistta/js").Ref<HTMLElement> | ((element: HTMLElement) => void)} [ref]
 * @property {JSX.Style & { variant?: "basic" | "success" | "error" | "info" | "warning"; float: "top" | "bottom" }} [style]
 * @property {string} [message]
 * @property {(event: MouseEvent) => void} [onDismiss]
 * @property {(event: MouseEvent) => void} [onOutsideClick]
 */

/**
 * @extends {Component<ToastProps>}
 */
class Toast extends Component {
  static set style(value) {
    globalStyle.update("toast", value);
  }

  static get style() {
    return globalStyle.value?.toast || {};
  }

  globalStyle = globalStyle();

  get styleObj() {
    return Style.ensureObject(this.style);
  }

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
            inset: this.styleObj?.float === "bottom" ? "100% auto auto 50%" : "0% auto auto 50%",
            translate: this.styleObj?.float === "bottom" ? "-50% calc(-100% - 4rem)" : "-50% 4rem",
            animate: this.styleObj?.float === "bottom" ? "slide-top" : "slide-bottom",
            width: "max-content",
            background: getBackgroundColor(this.styleObj?.variant || "basic"),
            backdropFilter: "$blur",
            shadow: "default",
          },
          this.globalStyle.toast || {},
          this.styleObj,
        )}
      >
        <p>
          {`${this.message}`}
          {this.onDismiss && (
            <Button
              style={{
                variant: "raw",
                display: "inline",
                ml: "4rem",
                p: "0!",
                float: "right",
                color: "inherit!",
                ":before": { left: "0!" },
              }}
              icon="e5cd"
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
