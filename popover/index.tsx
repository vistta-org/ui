import { Component, Ref } from "@vistta/js";

class Popover extends Component {
  id?: string;
  ref?: Ref<HTMLButtonElement> | ((element: HTMLButtonElement) => void) | null;
  anchor?: string;
  className?: string;
  open?: boolean;
  style?: Record<string, string>;
  private node: HTMLDialogElement;

  register(element) {
    if (this.ref) {
      if (typeof this.ref === "function") {
        this.ref(element);
      } else {
        this.ref.node = element;
      }
    }
    this.node = element as HTMLDialogElement;
    if (this.open) setTimeout(() => this.node.showPopover(), 0);
  }

  render() {
    if (!this.open) return null;
    return (
      <dialog
        ref={this.register.bind(this)}
        id={this.id}
        anchor={this.anchor}
        className={this.className}
        style={this.style}
        popover="manual"
      >
        {this.children}
      </dialog>
    );
  }
}

export default Popover;
