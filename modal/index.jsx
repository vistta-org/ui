import { Component, Ref } from "@vistta/js";
import Button from "../button/index.jsx";
import { assignStyle } from "../utils.js";

/**
 * @typedef {import("../button/index.jsx").ButtonProps} ButtonProps
 * @typedef {object} ModalProps
 * @property {string} [id]
 * @property {Ref<HTMLDialogElement> | ((element: HTMLDialogElement) => void)} [ref]
 * @property {boolean} [open]
 * @property {boolean} [inert]
 * @property {string | undefined} [title]
 * @property {ButtonProps[]} [actions]
 * @property {JSX.Style} [style]
 * @property {() => void} [onClose]
 */

/**
 * @extends {Component<ModalProps>}
 */
class Modal extends Component {
  #node;

  register(element) {
    this.#node = element;
    if (this.open) requestAnimationFrame(() => this.#node.isConnected && this.#node.showModal());
    element.show = () => ((this.open = true), this.#node.showModal());
    const close = element.close?.bind?.(element);
    element.close = () => ((this.open = false), close());
    element.addEventListener("close", () => {
      if (this.onClose) this.onClose();
    });
  }

  onUpdate(prev) {
    if (prev.open === this.open) return;
    if (this.open) this.#node?.showModal();
    else this.#node?.close();
  }

  render() {
    return (
      <dialog
        ref={Ref.forward(this.ref, this.register.bind(this))}
        id={this.id}
        inert={this.inert}
        style={assignStyle(
          {
            container: "center",
            width: "fit-content",
            "max-width": "min(600px, calc(100vw - 8rem))",
            p: "4rem",
            gap: "4rem",
            animate: "fade",
          },
          this.style,
        )}
      >
        {this.title && <h5 style="col:full; mb:2rem; p:0 2rem 2rem; border:bottom">{this.title}</h5>}
        {this.children}
        {this.actions && this.actions.length > 0 && (
          <div style="col:full; container:end; gap:inherit;">
            {this.actions.map((action) => (
              <Button {...action} />
            ))}
          </div>
        )}
      </dialog>
    );
  }
}

export default Modal;
