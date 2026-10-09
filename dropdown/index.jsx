import { Anchor, Component, Ref, Style } from "@vistta/js";
import Button, { iconToStyle } from "../button";
import Popover from "../popover";
import { style as globalStyle } from "../utils";

const HANDLED_PROPS = [
  "ref",
  "label",
  "icon",
  "style",
  "disabled",
  "hidden",
  "items",
  "height",
  "width",
  "position",
  "trigger",
  "close",
  "onOpen",
  "onClose",
  "onClick",
  "onMouseEnter",
  "onMouseLeave",
];

/**
 * @typedef {Omit<import("../button").ButtonProps, "type">} ButtonProps
 * @typedef {import("../button").Variants} ButtonVariants
 *
 * @typedef {Omit<ButtonProps, "ref" | "onClose" | "onOpen"> & { items?: DropdownItem[], divider?: boolean, onOpen?: () => void, onClose?: () => void }} DropdownItem
 *
 * @typedef {Omit<ButtonProps, "onClose" | "style"> & {
 *  items: DropdownItem[],
 *  trigger?: "click" | "hover",
 *  close?: "auto" | ((e: MouseEvent) => boolean),
 *  style?: JSX.Style & { variant?: ButtonVariants, button?: (JSX.Style & { variant?: ButtonVariants }), align?: "top" | "bottom" | "left" | "right", height?: number | string, width?: number | string },
 *  onOpen?: () => void,
 *  onClose?: () => void,
 * }} DropdownProps
 */

/**
 * @extends {Component<DropdownProps>}
 */
class Dropdown extends Component {
  /** @type {"click" | "hover"} */
  trigger = "click";
  /** @type {"auto" | ((e: MouseEvent) => boolean)} */
  close = "auto";
  visible = false;
  button = new Anchor();
  #timeout;
  #preventClose;

  static set style(value) {
    globalStyle.update("dropdown", value);
  }

  static get style() {
    return globalStyle.value?.dropdown || {};
  }

  globalStyle = globalStyle();

  #setVisible(value) {
    if (value) this.onOpen?.();
    else this.onClose?.();
    this.visible = value;
  }

  render() {
    return (
      <Button
        ref={Ref.forward(this.ref, this.button)}
        icon={this.loading ? "loading" : this.icon}
        disabled={this.disabled || this.loading}
        style={Style.assign(
          {
            p: !this.label && "2rem!",
            variant: this.style?.variant || this.style?.button?.variant,
          },
          iconToStyle(this.loading ? "loading" : this.icon, !this.label),
          this.globalStyle.dropdown || {},
          this.style,
        )}
        onClick={(e) => {
          this.onClick?.(e);
          if (this.trigger === "click" && !this.#preventClose && !e.defaultPrevented) this.#setVisible(!this.visible);
        }}
        onMouseEnter={
          this.trigger === "hover"
            ? (e) => (this.onMouseEnter?.(e), (this.visible = true), clearTimeout(this.#timeout))
            : this.onMouseEnter
        }
        onMouseLeave={
          this.trigger === "hover"
            ? (e) => (this.onMouseLeave?.(e), (this.#timeout = setTimeout(() => this.#setVisible(false), 100)))
            : this.onMouseLeave
        }
        {...this.props(...HANDLED_PROPS)}
      >
        {this.label || ""}
        <Popover
          open={this.visible}
          onOutsideClick={(e) =>
            typeof this.close === "function"
              ? /** @type {any} */ (this.close)(e)
              : this.close === "auto" && this.#setVisible(false)
          }
          style={{
            ...this.button(this.style?.align || "bottom", { gap: "2rem" }),
            container: "default",
            gap: "1rem",
            padding: "1rem",
            "> *": { col: "full", text: "left" },
            height: this.style?.height,
            width: this.style?.width || `min-content`,
            minWidth: !this.style?.width && this.button.width,
            background: this.style?.variant !== "raw" && "inherit",
          }}
        >
          {this.items?.reduce?.((acc, props) => {
            if (!props) return acc;
            if (props.divider) return [...acc, <div style="divider; my:0" />];
            if (props?.items)
              return [
                ...acc,
                <Dropdown
                  onOpen={() => (this.#preventClose = true)}
                  onClose={() => (this.#preventClose = false)}
                  style:variant={this.style?.variant}
                  {...props}
                />,
              ];
            return [...acc, <Button style:variant={this.style?.variant} {...props} />];
          }, [])}
        </Popover>
      </Button>
    );
  }
}

export default Dropdown;
