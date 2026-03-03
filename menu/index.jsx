import { Component, Ref } from "@vistta/js";
import Button from "../button";
import Dropdown from "../dropdown";
import { assignStyle } from "../utils";

/**
 * @typedef {Omit<import("../button").ButtonProps, "type">} ButtonProps
 *
 * @typedef {Omit<ButtonProps, "ref"> & { items?: MenuItem[], divider?: boolean }} MenuItem
 *
 * @typedef {object} MenuProps
 * @extends ButtonProps
 * @property {MenuItem[]} items - The menu items.
 * @property {"horizontal" | "vertical"} [type="horizontal"] - The type of the menu.
 * @property {"click" | "hover"} [trigger="click"] - The trigger event to open the menu.
 * @property {"auto" | ((e: MouseEvent) => boolean)} [close="auto"] - The close behavior of the menu.
 * @property {import("../utils").CompositePosition} [position="left bottom"] - The position of the menu.
 * @property {() => void} [onOpen] - Callback when the menu is opened.
 * @property {() => void} [onClose] - Callback when the menu is closed.
 */

/**
 * @extends {Component<MenuProps>}
 */
class Menu extends Component {
  #register(element) {
    /*if (this.visible === "auto") {
      new ResizeObserver(() => this.checkOverflow(element)).observe(element);
      setTimeout(() => this.checkOverflow(element), 100);
    }*/
  }

  /*checkOverflow(element) {
    const target = this.type === "horizontal" ? "width" : "height";
    const space = element.getBoundingClientRect()[target];
    const dropdownSpace = this.dropdownRef.node?.getBoundingClientRect()[target] || 0;
    const gap = parseFloat(window.getComputedStyle(element).getPropertyValue("gap")) || 0;

    let acc = -gap;
    let i = 0;
    let visible = 0;
    const len = this.itemRefs.length;
    while (i < len) {
      acc += (this.itemRefs[i] as HTMLElement).getBoundingClientRect()[target] + gap;
      if (acc > space) break;
      if (acc > space - dropdownSpace) visible = i;
      i++;
    }
    if (i === len) visible = i;
    this.visible = this.minVisible > visible ? this.minVisible : visible;
  }*/

  render() {
    return (
      <div
        id={this.id}
        ref={Ref.forward(this.ref, this.#register.bind(this))}
        style={assignStyle(
          {
            container: "default",
            padding: "0.5rem",
            gap: "0.5rem",
            radius: "rounded",
            background: "color-mix(in srgb, var(--back-color), var(--fore-color) 10%)",
            button: {
              background: "color-mix(in srgb, var(--back-color), var(--fore-color) 10%)",
            },
            "> *": {
              col: this.type === "horizontal" ? "auto" : "full",
            },
          },
          this.style,
        )}
      >
        {this.items?.reduce((acc, props) => {
          if (props === null || props === false) return acc;
          if (props.divider)
            return [...acc, <div style={{ divider: this.type === "horizontal" ? "vertical" : "horizontal", m: 0 }} />];
          if (props?.items) return [...acc, <Dropdown variant="basic" {...props} />];
          return [...acc, <Button variant="basic" {...props} />];
        }, [])}
      </div>
    );
  }
}

export default Menu;
