import { Component } from "@vistta/js";
import { Style, style as globalStyle } from "../utils";

const HANDLED_PROPS = ["style", "open", "title", "icon", "iconPosition", "onClick"];

/**
 * @typedef {JSX.EventHandlers & {
 *  ref?: import("@vistta/js").Ref<HTMLDivElement> | ((element: HTMLDivElement) => void),
 *  id?: string,
 *  style?: JSX.Style,
 *  open?: boolean,
 *  title: string | JSX.Element,
 *  icon?: boolean | string | { code: string | boolean; position: "left" | "right" },
 *  onClick?: (event: MouseEvent) => void,
 * }} AccordionProps
 */

/**
 * @typedef {object} AccordionGroupProps
 * @property {import("@vistta/js").Ref<HTMLDivElement> | ((element: HTMLDivElement) => void)} [ref] - Ref for the accordion container element.
 * @property {string} [id] - The unique identifier for the accordion element.
 * @property {JSX.Style} [style] - Style object or array of style objects to apply to the accordion container.
 * @property {(Omit<AccordionProps, "children" | "icon" | "open" | "iconPosition"> & { content: JSX.Element})[]} items - An array of accordion items to be rendered within the group.
 * @property {number} [open] - The index of the accordion item that should be open by default. Default is -1 (no items open).
 * @property {boolean | string | { code: string | boolean; position: "left" | "right" }} [icon] - Default is "e313". Set to false to disable.
 * @property {boolean} [allowMultipleOpen] - If true, allows multiple accordion items to be open at the same time. Default is false (only one item can be open).
 */

/**
 * @extends {Component<AccordionProps>}
 */
class Accordion extends Component {
  /**
   * @extends {Component<AccordionGroupProps>}
   */
  static Group = class AccordionGroup extends Component {
    items = [];
    allowMultipleOpen = false;
    // @ts-ignore
    open = -1;

    static set style(value) {
      globalStyle.update("accordionGroup", value);
    }

    static get style() {
      return globalStyle.value?.accordionGroup || {};
    }

    globalStyle = globalStyle();

    render() {
      return (
        <div
          style={Style.assign(
            {
              container: "default",
            },
            this.globalStyle.accordionGroup || {},
            this.style,
          )}
          {...this.props("style")}
        >
          {this.items.map(({ content, ...props }, index) => (
            <Accordion
              {...props}
              icon={this.icon}
              open={!this.allowMultipleOpen && index === this.open}
              onClick={
                !this.allowMultipleOpen &&
                (() => {
                  this.open = this.open === index ? -1 : index;
                })
              }
            >
              {content}
            </Accordion>
          ))}
        </div>
      );
    }
  };

  static set style(value) {
    globalStyle.update("accordion", value);
  }

  static get style() {
    return globalStyle.value?.accordion || {};
  }

  globalStyle = globalStyle();

  open = false;

  get iconCode() {
    if (this.icon === false) return false;
    if (typeof this.icon === "string") return this.icon;
    if (typeof this.icon === "object" && this.icon.code !== undefined) return this.icon.code;
    return "e313";
  }

  get iconPosition() {
    if (typeof this.icon === "object" && this.icon.position !== undefined) return this.icon.position;
    return "left";
  }

  render() {
    return (
      //@ts-ignore
      <div
        style={Style.assign(
          {
            container: "default",
            gap: 0,
            border: "default",
            radius: "rounded",
            overflow: "clip",
            background: "$back-color",
          },
          this.globalStyle.accordion || {},
          this.style,
        )}
        {...this.props(...HANDLED_PROPS)}
      >
        <div
          style={{
            col: "full",
            cursor: "pointer",
            p: "2rem",
            icon: this.iconCode,
            ":before": {
              float: this.iconPosition === "right" ? "right" : "left",
              rotate: this.open ? "0" : "-90deg",
              transition: "rotate $duration",
            },
          }}
          onClick={(event) => {
            if (this.onClick) this.onClick(event);
            this.open = !this.open;
          }}
        >
          {this.title}
        </div>
        <div
          style={{
            col: "full",
            container: "default",
            p: "2rem",
            display: this.open ? "block" : "none",
            height: this.open ? "auto" : 0,
            transition: "display $duration allow-discrete, height $duration",
            ":initial": {
              height: 0,
            },
          }}
        >
          {this.children}
        </div>
      </div>
    );
  }
}

export default Accordion;
