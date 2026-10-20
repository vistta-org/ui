import { Anchor, Component, Ref, Style } from "@vistta/js";
import Button, { iconToStyle } from "../button";
import Popover from "../popover";
import { style as globalStyle } from "../utils";

const HANDLED_PROPS = [
  "ref",
  "label",
  "icon",
  "style",
  "button",
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
 * @typedef {import("../utils").Tooltip} Tooltip
 * @typedef {import("../utils").Icon} Icon
 * @typedef {Omit<import("../button").ButtonProps, "type">} ButtonProps
 * @typedef {import("../button").Variants} ButtonVariants
 *
 * @typedef {Omit<ButtonProps, "ref" | "onClose" | "onOpen"> & { items?: DropdownItem[], divider?: boolean, onOpen?: () => void, onClose?: () => void }} DropdownItem
 *
 * @typedef {JSX.EventHandlers & {
 *  id?: string,
 *  ref?: Ref<HTMLButtonElement> | ((element: HTMLButtonElement) => void),
 *  label?: string,
 *  items: DropdownItem[],
 *  trigger?: "click" | "hover",
 *  close?: "auto" | ((e: MouseEvent) => boolean),
 *  icon?: Icon,
 *  loading?: boolean,
 *  style?: JSX.Style | JSX.StyleObject & { variant?: ButtonVariants, align?: "top" | "bottom" | "left" | "right" },
 *  button?: ButtonProps,
 *  disabled?: boolean,
 *  hidden?: boolean,
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
  #button = new Anchor();
  #timeout;
  #preventClose;

  static set style(value) {
    globalStyle.update("dropdown", value);
  }

  static get style() {
    return globalStyle.value?.dropdown || {};
  }

  globalStyle = globalStyle();

  get styleObj() {
    return Style.ensureObject(this.style);
  }

  get buttonStyleObj() {
    return Style.ensureObject(this.button?.style);
  }

  #setVisible(value) {
    if (value) this.onOpen?.();
    else this.onClose?.();
    this.visible = value;
  }

  render() {
    return (
      <>
        <Button
          {...(this.button || {})}
          ref={Ref.forward(this.ref, this.button?.ref, this.#button)}
          label={this.label || this.button?.label}
          icon={this.loading || this.button?.loading ? "loading" : this.icon || this.button?.icon}
          loading={this.loading || this.button?.loading}
          disabled={this.disabled || this.button?.disabled || this.loading || this.button?.loading}
          hidden={this.hidden ?? this.button?.hidden}
          style={Style.assign(
            {
              p: !(this.label || this.button?.label) && "2rem!",
              variant: /** @type {any} */ this.buttonStyleObj?.variant || this.styleObj?.variant,
            },
            iconToStyle(
              this.loading || this.button?.loading ? "loading" : this.icon || this.button?.icon,
              !(this.label || this.button?.label),
            ),
            /** @type {any} */ (this.globalStyle.dropdown)?.button || {},
            this.buttonStyleObj,
          )}
          onClick={(e) => {
            this.button?.onClick?.(e);
            this.onClick?.(e);
            if (this.trigger === "click" && !this.#preventClose && !e.defaultPrevented) this.#setVisible(!this.visible);
          }}
          onMouseEnter={
            this.trigger === "hover"
              ? (e) => (
                  this.button?.onMouseEnter?.(e),
                  this.onMouseEnter?.(e),
                  (this.visible = true),
                  clearTimeout(this.#timeout)
                )
              : (e) => (this.button?.onMouseEnter?.(e), this.onMouseEnter?.(e))
          }
          onMouseLeave={
            this.trigger === "hover"
              ? (e) => (
                  this.button?.onMouseLeave?.(e),
                  this.onMouseLeave?.(e),
                  (this.#timeout = setTimeout(() => this.#setVisible(false), 100))
                )
              : (e) => (this.button?.onMouseLeave?.(e), this.onMouseLeave?.(e))
          }
          {...this.props(...HANDLED_PROPS)}
        >
          {this.label || this.button?.label || ""}
        </Button>
        <Popover
          open={this.visible}
          onOutsideClick={(e) =>
            typeof this.close === "function"
              ? /** @type {any} */ (this.close)(e)
              : this.close === "auto" && this.#setVisible(false)
          }
          style={Style.assign(
            {
              ...this.#button(this.styleObj?.align || "bottom", { gap: "2rem" }),
              container: "default",
              gap: "1rem",
              padding: "1rem",
              "> *": { col: "full", text: "left" },
              height: this.styleObj?.height,
              width: this.styleObj?.width || `min-content`,
              minWidth: !this.styleObj?.width && this.#button.width,
              background: this.styleObj?.variant !== "raw" && "inherit",
            },
            this.globalStyle.dropdown || {},
            this.styleObj,
          )}
        >
          {this.items?.reduce?.((acc, props) => {
            if (!props) return acc;
            if (props.divider) return [...acc, <div style="divider; my:0" />];
            if (props?.items)
              return [
                ...acc,
                <Dropdown
                  {...props}
                  onOpen={() => (this.#preventClose = true)}
                  onClose={() => (this.#preventClose = false)}
                  style={Style.assign({ variant: this.styleObj?.variant }, props.style)}
                />,
              ];
            return [...acc, <Button {...props} style={Style.assign({ variant: this.styleObj?.variant }, props.style)} />];
          }, [])}
        </Popover>
      </>
    );
  }
}

export default Dropdown;
