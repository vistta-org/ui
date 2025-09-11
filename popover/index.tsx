import { Component, Ref } from "@vistta/js";

class Popover extends Component {
  id?: string;
  ref?: Ref<HTMLButtonElement> | ((element: HTMLButtonElement) => void) | null;
  anchor?: any;
  class?: string;
  open?: boolean;
  style?: Record<string, string>;
  onOutsideClick?: (event: MouseEvent) => void;
  private node: HTMLDialogElement;
  private handler: any;

  onConnect() {
    this.handler = (event) => {
      if (!this.node || !this.open || this.node.contains(event.target)) return;
      this.onOutsideClick?.(event);
    };
    this.onOutsideClick && document.addEventListener("click", this.handler);
  }

  onDisconnect() {
    this.onOutsideClick && document.removeEventListener("click", this.handler);
  }

  register(element) {
    this.node = element as HTMLDialogElement;
    if (this.open) requestAnimationFrame(() => this.node.showPopover());
  }

  render() {
    if (!this.open) return null;
    return (
      <dialog
        ref={Ref.forward(this.ref, this.register.bind(this))}
        id={this.id}
        anchor={this.anchor}
        class={this.class}
        style={this.style}
        popover="manual"
      >
        {this.children}
      </dialog>
    );
  }
}

export default Popover;
