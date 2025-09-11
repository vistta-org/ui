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
  class?: string;
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
  close?: "auto" | ((e: MouseEvent) => boolean) = "auto";
  position?: Omit<Position, "center"> = "bottom";
  items: DropdownItem[];
  onClick?: (e: MouseEvent) => void;
  onClose?: () => void;
  onOpen?: () => void;
  private visible: boolean = false;
  #button: HTMLButtonElement;
  #timeout;
  #preventClose;

  setVisible(value: boolean) {
    if (value) this.onOpen?.();
    else this.onClose?.();
    this.visible = value;
  }

  getClass() {
    const result = this.class?.split(" ") || [];
    if (this.variant) result.push(this.variant);
    if (this.action) result.push("action");
    if (this.active) result.push("active");
    if (typeof this.tooltip === "object" && this.tooltip.position) result.push(`tooltip:${this.tooltip.position}`);
    if (typeof this.icon === "object" && this.icon.position) result.push(`icon:${this.icon.position}`);
    else if (this.label && !this.action) result.push(`icon:right`);
    return result.join(" ");
  }

  render() {
    return (
      <button
        ref={Ref.forward(this.ref, (e) => (this.#button = e))}
        id={this.id}
        anchor={this.anchor}
        class={this.getClass()}
        data-icon={getIconCode(this.icon) || ((this.position as string)?.includes("top") ? "\ue5c7" : "\ue5c5")}
        aria-label={this.label || this.name}
        name={this.label || this.name}
        data-tooltip={getTooltipLabel(this.tooltip)}
        type={"button" as const}
        onClick={(e) => {
          this.onClick?.(e);
          if (this.trigger === "click" && !this.#preventClose && !e.defaultPrevented) this.setVisible(!this.visible);
        }}
        onMouseEnter={
          this.trigger === "hover"
            ? () => {
                this.visible = true;
                clearTimeout(this.#timeout);
              }
            : null
        }
        onMouseLeave={
          this.trigger === "hover" ? () => (this.#timeout = setTimeout(() => this.setVisible(false), 100)) : null
        }
        disabled={this.disabled}
        readonly={this.readonly}
        style={this.style}
        {...style}
      >
        {!this.action && this.label}
        <Popover
          class="dropdown"
          anchor={{ target: this.#button, position: this.position }}
          open={this.visible}
          onOutsideClick={(e) =>
            typeof this.close === "function" ? this.close(e) : this.close === "auto" && this.setVisible(false)
          }
          style={{
            transform: this.position === "left" || this.position === "right" ? "translateY(-50%)" : "translateX(-50%)",
          }}
        >
          {this.items?.map((props) =>
            props?.items ? (
              <Dropdown
                onOpen={() => (this.#preventClose = true)}
                onClose={() => (this.#preventClose = false)}
                variant={this.variant}
                {...props}
              />
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
