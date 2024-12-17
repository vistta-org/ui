import { Component, Ref } from "@vistta/js";
import style from "./style.scss";

class Input extends Component {
  ref = new Ref();

  render({ className, type, icon, label, wrap, onKeyUp, ...props }) {
    className = className?.split(" ") || [];
    className.unshift("input");
    if (type === "search") icon = "\ue8b6";
    const useTextArea =
      (wrap && (type === "text" || type === "search")) || type === "textarea";
    return (
      <div className={className.join(" ")} data-icon={icon} {...style}>
        {label && <label>{label}</label>}
        {useTextArea ? (
          <textarea {...props} />
        ) : (
          <input type={type} {...props} />
        )}
      </div>
    );
  }
}

export default Input;
