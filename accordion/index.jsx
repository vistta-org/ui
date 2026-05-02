import { Component, Ref } from "@vistta/js";
import { Style } from "../utils";

const HANDLED_PROPS = ["style", "open", "title", "icon", "iconPosition", "onClick"];

/**
 * @typedef {JSX.EventHandlers & {
 *  ref?: Ref<HTMLDivElement> | ((element: HTMLDivElement) => void),
 *  id?: string,
 *  style?: JSX.Style,
 *  open?: boolean,
 *  title: string | JSX.Element,
 *  icon?: boolean | string,
 *  iconPosition?: "left" | "right",
 *  onClick?: (event: MouseEvent) => void,
 * }} AccordionProps
 */

/**
 * @typedef {object} AccordionGroupProps
 * @property {Ref<HTMLDivElement> | ((element: HTMLDivElement) => void)} [ref] - Ref for the accordion container element.
 * @property {string} [id] - The unique identifier for the accordion element.
 * @property {JSX.Style} [style] - Style object or array of style objects to apply to the accordion container.
 * @property {(Omit<AccordionProps, "children" | "icon" | "open" | "iconPosition"> & { content: JSX.Element})[]} items - An array of accordion items to be rendered within the group.
 * @property {number} [open] - The index of the accordion item that should be open by default. Default is -1 (no items open).
 * @property {boolean | string} [icon] - Default is "e313". Set to false to disable.
 * @property {"left" | "right"} [iconPosition] - Position of the toggle icon. Default is "left".
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

    render() {
      return (
        <div
          style={Style.assign(
            {
              container: "default",
            },
            this.style,
          )}
          {...this.props("style")}
        >
          {this.items.map(({ content, ...props }, index) => (
            <Accordion
              {...props}
              icon={this.icon}
              iconPosition={this.iconPosition}
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

  open = false;

  render() {
    return (
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
          this.style,
        )}
        {...this.props(...HANDLED_PROPS)}
      >
        <div
          style={{
            col: "full",
            cursor: "pointer",
            p: "2rem",
            icon: this.icon !== false && (typeof this.icon === "string" ? this.icon : "e313"),
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
