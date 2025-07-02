import { Component, Ref } from "@vistta/js";
import Button, { type ButtonVariants } from "../button";
import {
  getAnchorId,
  getIconCode,
  getTooltipLabel,
  type Anchor,
  type CompositePosition,
  type Icon,
  type Tooltip,
} from "../utils";
import Popover from "../popover";
import style from "./style.scss";

let anchors = 0;
export type DropdownItem = Omit<Button, "ref"> & { items?: DropdownItem[] };

class Dropdown extends Component {
  id?: string;
  ref?: Ref<HTMLButtonElement> | ((element: HTMLButtonElement) => void) | null;
  anchor?: Anchor;
  className?: string;
  variant?: ButtonVariants;
  action?: boolean;
  active?: boolean;
  icon?: Icon;
  label?: string;
  name?: string;
  tooltip?: Tooltip;
  style?: Record<string, string>;
  disabled?: boolean;
  readonly?: boolean;
  trigger?: "click" | "hover" = "click";
  position?: CompositePosition;
  items: DropdownItem[];
  private show: boolean = false;
  #anchorId = `--dropdown-anchor-${anchors++}`;
  #timeout;

  #getClassName() {
    const className = this.className?.split(" ") || [];
    if (this.variant) className.push(this.variant);
    if (this.action || !this.label) className.push("action");
    if (this.active) className.push("active");
    if (typeof this.anchor === "object" && this.anchor.position)
      className.push(`anchor:${this.anchor.position.replace(" ", ":")}`);
    if (typeof this.tooltip === "object" && this.tooltip.position)
      className.push(`tooltip:${this.tooltip.position}`);
    if (typeof this.icon === "object" && this.icon.position)
      className.push(`icon:${this.icon.position}`);
    else if (this.label) className.push(`icon:right`);
    return className.join(" ");
  }

  render() {
    return (
      <button
        ref={this.ref}
        id={this.id}
        anchor={getAnchorId(this.anchor)}
        className={this.#getClassName()}
        data-icon={
          getIconCode(this.icon) ||
          ((this.position as string)?.includes("top") ? "\ue5c7" : "\ue5c5")
        }
        aria-label={this.label || this.name}
        name={this.label || this.name}
        data-tooltip={getTooltipLabel(this.tooltip)}
        type={"button" as const}
        onClick={
          this.trigger === "click"
            ? (e) => (e.stopPropagation(), (this.show = !this.show))
            : null
        }
        onMouseEnter={
          this.trigger === "hover"
            ? () => {
                this.show = true;
                clearTimeout(this.#timeout);
              }
            : null
        }
        onMouseLeave={
          this.trigger === "hover"
            ? () => {
                this.#timeout = setTimeout(() => (this.show = false), 100);
              }
            : null
        }
        disabled={this.disabled}
        readonly={this.readonly}
        style={Object.assign(this.style || {}, {
          "anchor-name": this.id || this.#anchorId,
        })}
        {...style}
      >
        {!this.action && this.label}
        <Popover
          className={
            "dropdown" +
            (this.position ? ` anchor:${this.position.replace(" ", ":")}` : "")
          }
          open={this.show}
          style={{ "position-anchor": this.id || this.#anchorId }}
        >
          {this.items?.map((props) =>
            props?.items ? (
              <Dropdown variant={this.variant} items={[]} {...props} />
            ) : (
              <Button variant={this.variant} {...props} />
            )
          )}
        </Popover>
      </button>
    );
  }
}

export default Dropdown;
