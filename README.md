# **VISTTA JS Component Library**

[Project Name] description

## **Getting Started**

### **Install**

```sh
npm install @vistta/components
```

### **Usage**

```jsx
<Button label="label" />
```

### **Global styles**

Every exported component exposes a static `style` setter backed by a shared, persisted `Context` (`vistta.ui.style`, `cache: "local"`). Assigning a style object overrides that component's default style globally — the override is read on subsequent renders and persisted across reloads:

```jsx
import { Card, Button, Modal } from "@vistta/ui";

Card.style = { padding: "1rem", radius: "small" };
Button.style = { radius: "circular" };
Modal.style = { "max-width": "min(800px, calc(100vw - 8rem))" };
```

Each component registers a key in the shared context (`card`, `button`, `modal`, `popover`, `calendar`, `carousel`, `accordion` / `accordionGroup`, `input`, `menu`, `dropdown`, `icon`, `skeleton`, `table`, `toast`). The per-component default style is merged with the override (`override || {}`) before the instance `style` prop, so instance props still take precedence. Overrides are written through a single `update(key, value)` action on the shared context.

## **License**

Apache 2.0 with Commons Clause

## **Contributing**

Thank you for your interest in contributing to this project! Please ensure that any contributions respect the licensing terms specified. If you encounter any issues or have suggestions, feel free to report them. All issues will be well received and addressed to the best of our ability. We appreciate your support and contributions!

### **Authors**

- [Tiago Terenas Almeida](https://github.com/tiagomta)
