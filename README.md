# Vistta UI

UI components for [Vistta JS](../js/README.md).

## **Getting Started**

### **Install**

```sh
npm install @vistta/ui @vistta/js
```

Use the Vistta JS JSX runtime and include the UI stylesheet in the application's style configuration:

```js
import { style } from "@vistta/ui";

const config = { styles: [style()] };
```

`style(config)` returns the Vistta JS style configuration, including properties, functions, variables, fonts, animations, and responsive queries. Configuration options include `size`, `duration`, `radius`, `blur`, `layout`, `font`, `colors`, `viewports`, `animation`, `icon`, `border`, and `shadow`. The generator is also the default export of `@vistta/ui/style`.

### **Usage**

```jsx
import { Button, Card, Input } from "@vistta/ui";

<Card>
  <Input name="title" label="Title" value={title} onInput={(event) => (title = event.target.value)} />
  <Button label="Save" style:variant="primary" onClick={save} />
</Card>;
```

Component `style` props accept Vistta JS style objects or shorthand strings where the component type permits them. `style:variant` is the namespaced JSX form of `style={{ variant: "..." }}`. Component state is supplied through props; callbacks such as `onChange` receive events.

## Components

All components below are named exports from `@vistta/ui`. Their `style` prop accepts Vistta JS style values unless a narrower type is specified. `ref` is available on components that expose an element ref.

### Button

```jsx
import { Button } from "@vistta/ui";

<Button label="Continue" style:variant="primary" onClick={continueFlow} />;
```

`Button` accepts `label`, `name`, `icon`, `loading`, `disabled`, `hidden`, `active`, `tooltip`, `type`, event handlers, and `style.variant`. Variants are `default`, `basic`, `raw`, or a color (`primary`, `secondary`, `tertiary`, `light`, `dark`, `info`, `success`, `warning`, `error`); color variants can also be combined with `raw`. The default HTML button type is `button`. `loading` disables the button and displays a loading icon.

### Icon

```jsx
import { Icon } from "@vistta/ui";

<Icon code="e5ca" tooltip="Done" />;
```

`Icon` accepts `code`, `outlined`, `tooltip`, and `style`. A missing `code` renders nothing.

### Card

```jsx
import { Card } from "@vistta/ui";

<Card style={{ padding: "4rem" }}>Content</Card>;
```

`Card` wraps children in a styled `div`; pass `style` and DOM event handlers.

### Input

`Input` wraps a standard input, textarea, or one of the built-in select, rich-text, and color controls. Common props are `name`, `label`, `value`, `placeholder`, `required`, `disabled`, `readonly`, `onInput`, `onChange`, and `style`.

```jsx
import { Input } from "@vistta/ui";

<Input type="email" name="email" label="Email" value={email} onInput={(event) => (email = event.target.value)} />
<Input type="checkbox" name="updates" label="Send updates" value={updates} onChange={(event) => (updates = event.target.checked)} />
<Input type="select" name="status" label="Status" value={status} options={[{ label: "Open", value: "open" }, "closed"]} onChange={handleStatusChange} />
<Input type="color" name="accent" value={accent} presets={["#ff0000", "#008000"]} onChange={handleAccentChange} />
<Input type="rich" name="body" value={body} format onInput={handleBodyInput} />
```

Types include standard HTML input types plus `textarea`, `checkbox`, `radio`, `switch`, `toggle`, `select`, `color`, `rich`, and `richtext`. Number inputs accept `min`, `max`, and `step`; checkbox/radio inputs accept `indeterminate`; select accepts `options` (strings or `{ label, value }`), `multiple`, and `filterable`; color accepts `presets` and `recent`; rich text accepts `format`. Switches and toggles use checkbox values.

### Dropdown

```jsx
import { Dropdown } from "@vistta/ui";

<Dropdown
  label="Actions"
  button={{ tooltip: "More actions", style: { variant: "basic" } }}
  style={{ align: "bottom", width: "40rem" }}
  items={[
    { label: "Edit", onClick: edit },
    { divider: true },
    { label: "More", items: [{ label: "Archive", onClick: archive }] },
  ]}
/>;
```

`Dropdown` requires `items`; entries are button props, nested `items` submenus, or `{ divider: true }`. `trigger` is `click` (default) or `hover`; `close` is `auto` (default) or an outside-click callback. `onOpen` and `onClose` report visibility changes. `label`, `icon`, `loading`, `disabled`, and `hidden` configure the trigger. Use `button` for additional trigger `Button` props and `button.style` for trigger styling. `style` styles the popover; its `variant` supplies the default item and trigger variant, while `align` controls placement. `button.style.variant` overrides the trigger variant.

### Menu

```jsx
import { Menu } from "@vistta/ui";

<Menu
  type="horizontal"
  items={[
    { label: "Home", onClick: openHome },
    { label: "Settings", onClick: openSettings },
  ]}
/>;
```

`Menu` accepts `items` with button props, nested `items`, `{ divider: true }`, and falsy entries. `type` is `horizontal` or `vertical`; overflowing entries are placed in a Dropdown. Menu items use Button props.

### Accordion

```jsx
import { Accordion } from "@vistta/ui";

<Accordion title="Details" open>
  Content
</Accordion>;
```

`Accordion` accepts `title`, `open`, `icon` (set to `false` to hide it), `style`, and `onClick`.

### Accordion.Group

```jsx
import { Accordion } from "@vistta/ui";

<Accordion.Group
  items={[
    { title: "First", content: <p>One</p> },
    { title: "Second", content: <p>Two</p> },
  ]}
  open={0}
/>;
```

`Accordion.Group` accepts `items` with `title` and `content`, initial `open` index (`-1` for none), `icon`, and `allowMultipleOpen` (default `false`).

### Modal

```jsx
import { Modal } from "@vistta/ui";

<Modal
  open={showDialog}
  title="Delete item?"
  onClose={() => (showDialog = false)}
  actions={[
    { label: "Cancel", onClick: () => (showDialog = false) },
    { label: "Delete", onClick: deleteItem },
  ]}
>
  This cannot be undone.
</Modal>;
```

`Modal` accepts `open`, `title`, `actions` (Button props), `inert`, `onClose`, and `style`.

### Popover

```jsx
import { Popover } from "@vistta/ui";

<Popover open={showDetails} onOutsideClick={() => (showDetails = false)}>
  Details
</Popover>;
```

`Popover` accepts `open`, `manual`, `inert`, `onOutsideClick`, and `style`; the default mode uses the browser popover API, while `manual` renders with an `open` attribute. With `inert`, Popover renders an `aside` instead of a `dialog`.

### Calendar

```jsx
import { Calendar } from "@vistta/ui";

<Calendar type="month" date={new Date()} controls="all" onChange={handleDateChange} />;
```

`Calendar` supports `month` (default), `week`, and `day` views; `date` is a `Date` or `DateTime`, `starting` sets the first weekday, and `items(date, enabled)` supplies content for a date. `controls` is `all` (default), `gesture`, or `none`. A cancelable `change` event on navigation or selection carries the new date in `event.date`; `preventDefault()` stops the change.

### Carousel

```jsx
import { Carousel } from "@vistta/ui";

<Carousel items={[<div>First</div>, <div>Second</div>]} active={0} onChange={handleSlideChange} />;
```

`Carousel` accepts an array of JSX elements or an `items(active, offset)` renderer, `active` (index for arrays), `direction` (`horizontal` or `vertical`), `renderOffset`, and the same `controls` options. Its cancelable `change` event includes `event.item` and `event.index`. A carousel ref exposes `next()`, `previous()`, and `scrollTo(index)` on the rendered element.

### Skeleton

```jsx
import { Skeleton } from "@vistta/ui";

<Skeleton style={{ variant: "text", width: "100%", height: "8rem" }} />;
```

`Skeleton` supports `text`, `circle`, and `rect` variants, `style.width`, `style.height`, and `animate` (default `true`).

### Table

```jsx
import { Table } from "@vistta/ui";

<Table
  columns={[
    { key: "name", label: "Name" },
    { key: "created", label: "Created", type: "date" },
  ]}
  data={[{ name: "Draft", created: "2026-01-01" }]}
/>;
```

`Table` requires `columns` and `data`; each column has a `key`, `label`, and optional `type` (`text`, `number`, `date`, `boolean`, or a formatting function).

### Toast

```jsx
import { Toast } from "@vistta/ui";

<Toast message="Saved" style={{ variant: "success", float: "top" }} onDismiss={dismissToast} />;
```

`Toast` accepts `message`, `style.variant` (`basic`, `success`, `error`, `info`, `warning`), `style.float` (`top` or `bottom`), `onDismiss`, and `onOutsideClick`.

### CustomGlobalDialogs

`CustomGlobalDialogs` is an optional component that installs `window.alert`, `window.confirm`, and `window.prompt` handlers while connected. Render it once near the application root. Alerts accept a string or `{ message, title, type, timeout }`; `confirm` returns a `Promise<boolean>` and `prompt` resolves to a value (or `null` on cancellation). `placement` controls the alert position (`top` or `bottom`). These handlers replace the browser's native dialog functions.

```jsx
import { CustomGlobalDialogs } from "@vistta/ui";

<CustomGlobalDialogs placement="top" />;
```

## Global Styles

UI components expose a static `style` setter backed by the shared `vistta.ui.style` context. Overrides are held in memory (`cache: "none"`), not persisted across reloads. Assign a style object to override a component's defaults for current renders:

```jsx
import { Card, Button, Modal } from "@vistta/ui";

Card.style = { padding: "1rem", radius: "small" };
Button.style = { radius: "circular" };
Modal.style = { "max-width": "min(800px, calc(100vw - 8rem))" };
```

Keys are `accordion`, `accordionGroup`, `button`, `calendar`, `card`, `carousel`, `dropdown`, `icon`, `input`, `menu`, `modal`, `popover`, `skeleton`, `table`, and `toast`. Most components merge the global override before the instance `style`, so instance styles win; `Icon` merges its global style after the instance style. `Dropdown.style` configures the popover, while `Dropdown.style.button` provides a global trigger style override. For a single Dropdown, use its `button.style` prop instead.

## **License**

Licensed under the GNU General Public License version 3 only (`GPL-3.0-only`). See [LICENSE](LICENSE) for the full terms.

## **Contributing**

Thank you for your interest in contributing to this project! Please ensure that any contributions respect the licensing terms specified. If you encounter any issues or have suggestions, feel free to report them. All issues will be well received and addressed to the best of our ability. We appreciate your support and contributions!

### **Authors**

- [Tiago Terenas Almeida](https://github.com/tiagomta)
