import { Component, Ref } from "@vistta/js";
import Button, { type ButtonVariants } from "../button";
import Popover from "../popover";
import { getIconCode, getTooltipLabel, type Icon, type Position, type Tooltip } from "../utils";
import style from "./style.scss";

export type DropdownItem = Omit<Button, "ref"> & { items?: DropdownItem[] };

class Dropdown extends Component {
  id?: string;
  ref: Ref<HTMLButtonElement> | ((element: HTMLButtonElement) => void) | null = new Ref<HTMLButtonElement>();
  anchor?: any;
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
  autoClose?: boolean = true;
  position?: Omit<Position, "center"> = "bottom";
  items: DropdownItem[];
  onClick?: (e: MouseEvent) => void;
  private show: boolean = false;
  #timeout;

  getClassName() {
    const className = this.className?.split(" ") || [];
    if (this.variant) className.push(this.variant);
    if (this.action) className.push("action");
    if (this.active) className.push("active");
    if (typeof this.tooltip === "object" && this.tooltip.position) className.push(`tooltip:${this.tooltip.position}`);
    if (typeof this.icon === "object" && this.icon.position) className.push(`icon:${this.icon.position}`);
    else if (this.label && !this.action) className.push(`icon:right`);
    return className.join(" ");
  }

  render() {
    return (
      <button
        ref={this.ref}
        id={this.id}
        anchor={this.anchor}
        className={this.getClassName()}
        data-icon={getIconCode(this.icon) || ((this.position as string)?.includes("top") ? "\ue5c7" : "\ue5c5")}
        aria-label={this.label || this.name}
        name={this.label || this.name}
        data-tooltip={getTooltipLabel(this.tooltip)}
        type={"button" as const}
        onClick={this.trigger === "click" ? (e) => (this.onClick?.(e), (this.show = !this.show)) : this.onClick}
        onMouseEnter={
          this.trigger === "hover"
            ? () => {
                this.show = true;
                clearTimeout(this.#timeout);
              }
            : null
        }
        onMouseLeave={this.trigger === "hover" ? () => (this.#timeout = setTimeout(() => (this.show = false), 100)) : null}
        disabled={this.disabled}
        readonly={this.readonly}
        style={this.style}
        {...style}
      >
        {!this.action && this.label}
        <Popover
          className="dropdown"
          anchor={{ target: this.ref, position: this.position }}
          open={this.show}
          onOutsideClick={() => this.autoClose && (this.show = false)}
          style={{
            transform: this.position === "left" || this.position === "right" ? "translateY(-50%)" : "translateX(-50%)",
          }}
        >
          {this.items?.map((props) =>
            props?.items ? (
              <Dropdown variant={this.variant} items={[]} {...props} />
            ) : (
              <Button variant={this.variant} {...props} />
            ),
          )}
        </Popover>
      </button>
    );
  }
}

export default Dropdown;
