import { Component, Ref } from "@vistta/js";

class Popover extends Component {
  id?: string;
  ref?: Ref<HTMLButtonElement> | ((element: HTMLButtonElement) => void) | null;
  anchor?: string;
  className?: string;
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
    this.onOutsideClick && document.addEventListener("mousedown", this.handler);
  }

  onDisconnect() {
    this.onOutsideClick && document.removeEventListener("mousedown", this.handler);
  }

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
      <dialog ref={this.register.bind(this)} id={this.id} anchor={this.anchor} className={this.className} style={this.style} popover="manual">
        {this.children}
      </dialog>
    );
  }
}

export default Popover;
