import { Component, ScopedFragment, Ref } from "@vistta/js";
import Button, { type ButtonVariants } from "../button";
import Input from "../input";
import Popover from "../popover";
import style from "./style.scss";

let anchors = 0;
type MenuItem = Omit<Button, "ref"> & { items?: MenuItem[] };

class Menu extends Component {
  id?: string;
  ref?: Ref<HTMLElement> | ((element: HTMLElement) => void) | null;
  anchor?: string;
  type: "horizontal" | "vertical" | "dropdown" | "auto" = "auto";
  variant?: ButtonVariants;
  className?: string;
  name?: string;
  style?: Record<string, string>;
  items: MenuItem[];
  dropdown?: Omit<Button, "onClick">;
  private show: boolean = false;
  private anchorId = `--dropdown-anchor-${anchors++}`;
  private visible: number;
  private itemRefs: HTMLElement[] = [];
  private dropdownRef = new Ref<HTMLButtonElement>();

  register(element) {
    if (this.type === "auto") {
      new ResizeObserver(() => this.checkOverflow(element)).observe(element);
      this.checkOverflow(element);
    }
    if (!this.ref) return;
    if (typeof this.ref === "function") this.ref(element);
    else if (this.ref instanceof Ref) this.ref.node = element;
  }

  checkOverflow(element) {
    const width = element.clientWidth;
    let acc = 0;
    const len = this.itemRefs.length;
    for (let i = 0; i < len; i++) {
      const child = this.itemRefs[i] as HTMLElement;
      acc += child.clientWidth || 0;
      if (acc > width - (this.dropdownRef.node?.clientWidth || 0)) {
        this.visible = i - 1;
        return;
      }
    }
    this.visible = len;
  }

  getClassName() {
    const className = this.className?.split(" ") || [];
    if (this.type === "vertical") className.unshift("group:vertical");
    else if (this.type !== "dropdown") className.unshift("group");
    return className.join(" ");
  }

  render() {
    if (this.type === "dropdown")
      return (
        <ScopedFragment style={style}>
          <Button
            ref={this.ref as any}
            id={this.id}
            anchor={this.anchor}
            className={this.getClassName()}
            aria-label={this.name}
            variant={this.variant}
            onClick={() => (this.show = !this.show)}
            {...adjustDropdownProps(this.dropdown, this.anchorId)}
          />
          <Popover
            className={"dropdown group:vertical"}
            open={this.show}
            style={{ "position-anchor": this.anchorId }}
          >
            {this.items
              ?.slice(this.visible + 1)
              ?.map(({ className, items, ...props }) =>
                items ? (
                  <Menu
                    type="dropdown"
                    className={className}
                    variant={this.variant}
                    dropdown={props}
                    items={items}
                  />
                ) : (
                  <Button
                    className={className}
                    variant={this.variant}
                    {...props}
                  />
                )
              )}
          </Popover>
        </ScopedFragment>
      );
    return (
      <div
        ref={(e) => this.register(e)}
        id={this.id}
        anchor={this.anchor}
        className={this.getClassName()}
        style={this.style}
        aria-label={this.name}
        {...style}
      >
        {this.items?.map(({ className, items, ...props }, index) =>
          items ? (
            <Menu
              ref={(e) => this.itemRefs.push(e)}
              type="dropdown"
              className={
                (index > this.visible ? "hidden " : "") + (className || "")
              }
              variant={this.variant}
              dropdown={props}
              items={items}
            />
          ) : (
            <Button
              ref={(e) => this.itemRefs.push(e)}
              className={
                (index > this.visible ? "hidden " : "") + (className || "")
              }
              variant={this.variant}
              {...props}
            />
          )
        )}
        {this.visible != null && this.visible < this.items.length && (
          <Menu
            type="dropdown"
            ref={this.dropdownRef}
            variant={this.variant}
            dropdown={this.dropdown}
            items={this.items?.slice(this.visible + 1)}
          />
        )}
      </div>
    );
  }
}

export default Menu;

function adjustDropdownProps(
  { ...dropdown }: Omit<Button, "onClick" | "render" | "getClassName"> = {},
  anchorId: string
) {
  if (dropdown.icon === undefined)
    dropdown.icon = dropdown.label
      ? { code: "\ue313", position: "right" }
      : "\ue313";
  if (!dropdown.label) dropdown.action = true;
  dropdown.style = Object.assign(dropdown.style || {}, {
    "anchor-name": anchorId,
  });
  return dropdown;
}
