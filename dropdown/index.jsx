import { Component, Ref } from "@vistta/js";
import { Button, iconToStyle, variantToStyle } from "../button";
import Popover from "../popover";
import { assignStyle, getTooltipLabel } from "../utils";

/**
 * @typedef {Omit<import("../button").ButtonProps, "type">} ButtonProps
 *
 * @typedef {Omit<ButtonProps, "ref"> & { items?: DropdownItem[], divider?: boolean }} DropdownItem
 *
 * @typedef {object} DropdownProps
 * @extends ButtonProps
 * @property {DropdownItem[]} items - The dropdown items.
 * @property {number | string} height - The height of the dropdown.
 * @property {number | string} width - The width of the dropdown.
 * @property {"click" | "hover"} [trigger="click"] - The trigger event to open the dropdown.
 * @property {"auto" | ((e: MouseEvent) => boolean)} [close="auto"] - The close behavior of the dropdown.
 * @property {import("../utils").CompositePosition} [position="left bottom"] - The position of the dropdown.
 * @property {() => void} [onOpen] - Callback when the dropdown is opened.
 * @property {() => void} [onClose] - Callback when the dropdown is closed.
 */

/**
 * @extends {Component<DropdownProps>}
 */
class Dropdown extends Component {
  trigger = "click";
  close = "auto";
  position = "left bottom";
  visible = false;
  #button;
  #timeout;
  #preventClose;

  #setVisible(value) {
    if (value) this.onOpen?.();
    else this.onClose?.();
    this.visible = value;
  }

  render() {
    return (
      <button
        id={this.id}
        ref={Ref.forward(this.ref, (e) => (this.#button = e))}
        anchor={this.anchor}
        aria-label={this.label || this.name}
        name={this.label || this.name}
        tooltip={getTooltipLabel(this.tooltip)}
        type="button"
        style={assignStyle(
          {
            p: this.action && "2rem!",
            tooltip: this.tooltip?.position,
          },
          variantToStyle(this.variant, this.raw),
          iconToStyle(this.loading ? "loading" : this.icon, this.action),
          this.style,
        )}
        onClick={(e) => {
          this.onClick?.(e);
          if (this.trigger === "click" && !this.#preventClose && !e.defaultPrevented) this.#setVisible(!this.visible);
        }}
        onContextMenu={this.onContextMenu}
        onDblClick={this.onDblClick}
        onMouseDown={this.onMouseDown}
        onMouseEnter={
          this.trigger === "hover"
            ? () => (this.onMouseEnter?.(e), (this.visible = true), clearTimeout(this.#timeout))
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
        active={this.active}
        disabled={this.disabled || this.loading}
      >
        {!this.action && (this.label || this.children)}
        <Popover
          anchor={this.#button}
          open={this.visible}
          onOutsideClick={(e) =>
            typeof this.close === "function" ? this.close(e) : this.close === "auto" && this.#setVisible(false)
          }
          style={{
            positionArea: this.position,
            container: "default",
            gap: "1rem",
            padding: "1rem",
            "> *": { col: "full", text: "left" },
            height: this.height,
            width: this.width,
          }}
        >
          {this.items?.reduce((acc, props) => {
            if (props === null || props === false) return acc;
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
            return [...acc, <Button variant={this.variant} raw={this.raw} {...props} />];
          }, [])}
        </Popover>
      </button>
    );
  }
}

export default Dropdown;
