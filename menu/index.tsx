import { Component, Ref } from "@vistta/js";
import Button, { type ButtonVariants } from "../button";
import Dropdown from "../dropdown";
import style from "./style.scss";

export type MenuItem = Omit<Button, "ref"> & { items?: MenuItem[] };

class Menu extends Component {
  id?: string;
  ref?: Ref<HTMLElement> | ((element: HTMLElement) => void) | null;
  anchor?: string;
  type?: "horizontal" | "vertical" = "horizontal";
  group?: boolean;
  variant?: ButtonVariants;
  class?: string;
  name?: string;
  style?: Record<string, string>;
  items: MenuItem[];
  visible?: number | "auto" | "all" = "auto";
  align?: "start" | "end" | "center" = "start";
  minVisible?: number;
  dropdown?: Omit<Dropdown, "items" | "ref">;
  private itemRefs: HTMLElement[] = [];
  private dropdownRef = new Ref<HTMLButtonElement>();

  register(element) {
    if (this.visible === "auto") {
      new ResizeObserver(() => this.checkOverflow(element)).observe(element);
      setTimeout(() => this.checkOverflow(element), 100);
    }
  }

  checkOverflow(element) {
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
  }

  getClass() {
    const result = this.class?.split(" ") || [];
    result.unshift("menu");
    if (this.group) result.unshift(this.type === "vertical" ? "group:vertical" : "group");
    else if (this.type === "vertical") result.push("vertical");
    if (this.align) result.push("align:" + this.align);
    return result.join(" ");
  }

  render() {
    return (
      <div
        ref={Ref.forward(this.ref, this.register.bind(this))}
        id={this.id}
        anchor={this.anchor}
        class={this.getClass()}
        style={this.style}
        aria-label={this.name}
        {...style}
      >
        {this.items?.map(({ class: className, items, ...props }, index) =>
          items ? (
            <Dropdown
              ref={(e) => (this.itemRefs[index] = e)}
              class={(typeof this.visible === "number" && index + 1 > this.visible ? "hidden " : "") + (className || "")}
              variant={this.variant}
              items={items}
              {...props}
            />
          ) : (
            <Button
              ref={(e) => (this.itemRefs[index] = e)}
              class={(typeof this.visible === "number" && index + 1 > this.visible ? "hidden " : "") + (className || "")}
              variant={this.variant}
              {...props}
            />
          ),
        )}
        {(this.visible as any) < this.items.length && (
          <Dropdown
            ref={this.dropdownRef}
            variant={this.variant}
            items={this.items?.slice(this.visible as number)}
            {...assignDropdownProps(this.dropdown)}
          />
        )}
      </div>
    );
  }
}

export default Menu;

function assignDropdownProps(dropdown: Omit<Dropdown, "ref" | "items">) {
  const props = Object.assign({}, dropdown || ({} as Omit<Dropdown, "ref" | "items">));
  if (props.class) props.class = "dropdown-button " + props.class;
  return props;
}
