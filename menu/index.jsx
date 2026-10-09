import { Component, Ref } from "@vistta/js";
import Button from "../button";
import Dropdown from "../dropdown";
import { Style, style as globalStyle } from "../utils";

/**
 * @typedef {Omit<import("../button").ButtonProps, "type">} ButtonProps
 *
 * @typedef {Omit<ButtonProps, "ref"> & { items?: (MenuItem | null | false)[], divider?: boolean }} MenuItem
 *
 * @typedef {ButtonProps & {
 *  items?: (MenuItem | null | false)[],
 *  type?: "horizontal" | "vertical",
 *  trigger?: "click" | "hover",
 *  close?: "auto" | ((e: MouseEvent) => boolean),
 *  position?: import("../utils").CompositePosition,
 *  onOpen?: () => void,
 *  onClose?: () => void,
 * }} MenuProps
 */

/**
 * @extends {Component<MenuProps>}
 */
class Menu extends Component {
  visibleIndex = -1;
  dropdownPosition;
  itemRefs = [];

  static set style(value) {
    globalStyle.update("menu", value);
  }

  static get style() {
    return globalStyle.value?.menu || {};
  }

  globalStyle = globalStyle();

  #registerContainer(element) {
    this.observer = new ResizeObserver(() => this.#checkOverflow(element));
    this.observer.observe(element);
  }

  #registerItem(index, element) {
    if (!element) return;
    this.itemRefs[index] = element;
    if (this.observer) this.observer.observe(element);
  }

  #checkOverflow(element) {
    const target = this.type === "horizontal" ? "width" : "height";
    const space = element.getBoundingClientRect()[target] - 40;
    for (let i = this.itemRefs.length; i >= 0; i--) {
      const item = this.itemRefs[i];
      if (!item) continue;
      const itemSpace = this.type === "horizontal" ? item.offsetLeft + item.clientWidth : item.offsetTop + item.clientHeight;
      if (space < itemSpace) continue;
      this.visibleIndex = i + 1;
      this.dropdownPosition = itemSpace + parseFloat(window.getComputedStyle(element).gap);
      return;
    }
    this.visibleIndex = this.itemRefs.length;
  }

  render() {
    if (this.items?.length === 0) return null;
    return (
      <div
        id={this.id}
        ref={Ref.forward(this.ref, this.#registerContainer.bind(this))}
        style={Style.assign(
          {
            container: "default",
            flexWrap: this.type === "horizontal" && "nowrap",
            padding: "0.5rem",
            gap: "0.5rem",
            background: "default",
            radius: "rounded",
            border: "default",
            overflow: "clip",
            button: {
              background: "inherit",
            },
            "> *": {
              col: this.type === "horizontal" ? "auto" : "full",
              [`:nth-child(n + ${this.visibleIndex + 1})`]: {
                opacity: 0,
                pointerEvents: "none",
              },
            },
          },
          this.globalStyle.menu || {},
          this.style,
        )}
      >
        {this.items.reduce((acc, props, index) => {
          if (props === null || props === false) return acc;
          if (props.divider)
            return [
              ...acc,

              <div
                style={
                  this.type === "horizontal"
                    ? {
                        divider: "vertical",
                        height: "10rem!",
                        width: "1px!",
                        m: 0,
                      }
                    : {
                        divider: "horizontal",
                        height: "1px!",
                        width: "10rem!",
                        m: 0,
                      }
                }
              />,
            ];
          if (props?.items)
            return [
              ...acc,
              // @ts-ignore
              <Dropdown
                style:variant="basic"
                style:align="bottom"
                {...props}
                ref={
                  props["ref"]
                    ? Ref.forward(props["ref"], this.#registerItem.bind(this, index))
                    : this.#registerItem.bind(this, index)
                }
              />,
            ];
          return [
            ...acc,
            <Button
              style:variant="basic"
              {...props}
              ref={
                props["ref"]
                  ? Ref.forward(props["ref"], this.#registerItem.bind(this, index))
                  : this.#registerItem.bind(this, index)
              }
            />,
          ];
        }, [])}
        {this.visibleIndex >= 0 && this.visibleIndex < this.items.length && (
          <Dropdown
            style={{
              variant: "basic",
              position: "absolute",
              align: "bottom",
              inset:
                this.type === "horizontal" ? `0 auto 0 ${this.dropdownPosition}px` : `auto 0 ${this.dropdownPosition}px 0`,
              icon: this.type === "horizontal" ? "e5d3" : "e5d3",
              opacity: "1!",
              pointerEvents: "auto!",
              background: "inherit",
              "> dialog > div:first-child": {
                display: "none",
              },
            }}
            items={/** @type {any} */ (this.items.slice(this.visibleIndex))}
          />
        )}
      </div>
    );
  }
}

export default Menu;
