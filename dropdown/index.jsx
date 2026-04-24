import { Anchor, Component, Ref } from "@vistta/js";
import Button from "../button";
import Popover from "../popover";

/**
 * @typedef {Omit<import("../button").ButtonProps, "type">} ButtonProps
 *
 * @typedef {Omit<ButtonProps, "ref"> & { items?: DropdownItem[], divider?: boolean }} DropdownItem
 *
 * @typedef {ButtonProps & {
 *  items: DropdownItem[],
 *  height?: number | string,
 *  width?: number | string,
 *  position?: "top" | "bottom" | "left" | "right",
 *  trigger?: "click" | "hover",
 *  close?: "auto" | ((e: MouseEvent) => boolean),
 *  buttonVariant?: ButtonProps["variant"],
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

  #setVisible(value) {
    if (value) this.onOpen?.();
    else this.onClose?.();
    this.visible = value;
  }

  render() {
    return (
      <Button
        id={this.id}
        ref={Ref.forward(this.ref, this.button)}
        name={this.name}
        tooltip={this.tooltip}
        variant={this.buttonVariant ?? this.variant}
        icon={this.loading ? "loading" : this.icon}
        active={this.active}
        disabled={this.disabled || this.loading}
        loading={this.loading}
        style={this.style}
        onClick={(e) => {
          this.onClick?.(e);
          if (this.trigger === "click" && !this.#preventClose && !e.defaultPrevented) this.#setVisible(!this.visible);
        }}
        onContextMenu={this.onContextMenu}
        onDblClick={this.onDblClick}
        onMouseDown={this.onMouseDown}
        onMouseEnter={
          this.trigger === "hover"
            ? (e) => (this.onMouseEnter?.(e), (this.visible = true), clearTimeout(this.#timeout))
            : this.onMouseEnter
        }
        onMouseMove={this.onMouseMove}
        onMouseLeave={
          this.trigger === "hover"
            ? (e) => (this.onMouseLeave?.(e), (this.#timeout = setTimeout(() => this.#setVisible(false), 100)))
            : this.onMouseLeave
        }
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}
        onMouseUp={this.onMouseUp}
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
            ...this.button(this.position || "bottom", { gap: "2rem" }),
            container: "default",
            gap: "1rem",
            padding: "1rem",
            "> *": { col: "full", text: "left" },
            height: this.height,
            width: this.width || `min-content`,
            minWidth: !this.width && this.button.width,
            background: this.variant !== "raw" && "inherit",
          }}
        >
          {this.items?.reduce((acc, props) => {
            if (!props) return acc;
            if (props.divider) return [...acc, <div style="divider; my:1rem" />];
            if (props?.items)
              return [
                ...acc,
                <Dropdown
                  onOpen={() => (this.#preventClose = true)}
                  onClose={() => (this.#preventClose = false)}
                  variant={this.variant}
                  {...props}
                />,
              ];
            return [...acc, <Button variant={this.variant} {...props} />];
          }, [])}
        </Popover>
      </Button>
    );
  }
}

export default Dropdown;
