import { Component, Ref } from "@vistta/js";

// use context to manage modals

class Modal extends Component {
  id?: string;
  ref?: Ref<HTMLDialogElement> | ((element: HTMLDialogElement) => void) | null;
  className?: string;
  style?: Record<string, string>;
  onClose?: () => void;

  register(element) {
    if (this.ref) {
      if (typeof this.ref === "function") {
        this.ref(element);
      } else {
        this.ref.node = element;
      }
    }
    element.open = element.showModal;
    element.addEventListener("close", () => {
      if (this.onClose) this.onClose();
    });
  }

  getClassName() {
    const className = ["modal", ...(this.className?.split(" ") || [])];
    return className.join(" ");
  }

  render() {
    return (
      <dialog
        ref={this.register.bind(this)}
        id={this.id}
        className={this.getClassName()}
        style={this.style}
        popover="manual"
      >
        {this.children}
      </dialog>
    );
  }
}

export default Modal;
