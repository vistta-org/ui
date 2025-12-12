import { Component, Ref } from "@vistta/js";

/**
 * @extends {Component<{
 *   id?: string,
 *   ref?: Ref<HTMLButtonElement> | ((element: HTMLButtonElement) => void),
 *   anchor?: any,
 *   open?: boolean,
 *   inert?: boolean,
 *   style?: JSX.Style;
 *   onClose?: () => void;
 * }>}
 */
class Modal extends Component {
  register(element) {
    if (this.open) requestAnimationFrame(() => element.showModal());
    element.show = () => ((this.open = false), element.showModal());
    const close = element.close?.bind?.(element);
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
        anchor={this.anchor}
        inert={this.inert}
        style={this.style}
      >
        {this.children}
      </dialog>
    );
  }
}

export default Modal;
