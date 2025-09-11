import { Component, Ref } from "@vistta/js";

class Modal extends Component {
  id?: string;
  ref?: Ref<HTMLDialogElement> | ((element: HTMLDialogElement) => void) | null;
  class?: string;
  style?: Record<string, string>;
  open?: boolean;
  onClose?: () => void;

  register(element) {
    if (this.open) requestAnimationFrame(() => element.showModal());
    element.show = () => ((this.open = false), element.showModal());
    const close = element.close.bind(element);
    element.close = () => ((this.open = false), close());
    element.addEventListener("close", () => {
      if (this.onClose) this.onClose();
    });
  }

  render() {
    if (!this.open) return null;
    return (
      <dialog
        ref={Ref.forward(this.ref, this.register.bind(this))}
        id={this.id}
        class={["modal", ...(this.class?.split(" ") || [])].join(" ")}
        style={this.style}
      >
        {this.children}
      </dialog>
    );
  }
}

export default Modal;
