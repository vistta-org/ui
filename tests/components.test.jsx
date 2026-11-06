import { Component } from "@vistta/js";
import Accordion from "../accordion/index.jsx";
import Button from "../button/index.jsx";
import Calendar from "../calendar/index.jsx";
import Card from "../card/index.jsx";
import Carousel from "../carousel/index.jsx";
import Dropdown from "../dropdown/index.jsx";
import Icon from "../icon/index.jsx";
import Input from "../input/index.jsx";
import Menu from "../menu/index.jsx";
import Modal from "../modal/index.jsx";
import Popover from "../popover/index.jsx";
import Skeleton from "../skeleton/index.jsx";
import style from "../style/index.js";
import Table from "../table/index.jsx";
import Toast from "../toast/index.jsx";
import { CustomGlobalDialogs } from "../utility/index.jsx";

const STYLE_KEYS = ["properties", "functions", "vars", "fonts", "animations", "queries"];

/**
 * Wrap a JSX closure in an anonymous Component class so children reach the
 * mounted component (mount passes props only; children come from render()).
 * @param {() => JSX.Element} render
 */
function withChildren(render) {
  return class extends Component {
    render() {
      return render();
    }
  };
}

suite("Components", async () => {
  await test("style() returns a style configuration with generated token keys", () => {
    const config = style({ size: "5px", viewports: { small: "400px" }, colors: { dark: "#1a1a1a", light: "#f2f2f2" } });
    for (const key of STYLE_KEYS) expect(typeof config[key], "style()." + key).toEqual("object");
    expect(config.vars.size).toEqual("5px");
    expect(config.queries.sm).toEqual("(max-width: 400px)");
    expect(config.vars["dark-color"]).toEqual("#1a1a1a");
    expect(config.vars["primary-color"]).toEqual("#c68346");
  });

  await test("Button renders label, variant, and type", async () => {
    await document.mount(Button, { id: "btn", label: "Continue", type: "submit", style: { variant: "primary" } });
    const button = document.querySelector("#btn");
    expect(button.tagName).toEqual("BUTTON");
    expect(button.textContent).toEqual("Continue");
    expect(button.getAttribute("type")).toEqual("submit");
  });

  await test("Icon renders nothing without a code", async () => {
    await document.mount(Icon, { id: "icon" });
    expect(document.querySelector("#icon")).toEqual(null);
    await document.mount(Icon, { id: "icon", code: "e5ca" });
    expect(document.querySelector("#icon").tagName).toEqual("SPAN");
  });

  await test("Card renders children inside a styled div", async () => {
    await document.mount(withChildren(() => <Card id="card">Hello</Card>));
    const card = document.querySelector("#card");
    expect(card.tagName).toEqual("DIV");
    expect(card.textContent).toEqual("Hello");
  });

  await test("Accordion toggles content visibility", async () => {
    let clicked = 0;
    await document.mount(
      withChildren(() => (
        <Accordion id="acc" title="Details" onClick={() => clicked++}>
          Content here
        </Accordion>
      )),
    );
    const accordion = document.querySelector("#acc");
    expect(accordion.textContent).toInclude("Details");
    expect(accordion.textContent).toInclude("Content here");
    const header = accordion.querySelector("div");
    await header.click();
    expect(clicked).toEqual(1);
    await header.click();
    expect(clicked).toEqual(2);
  });

  await test("Accordion.Group renders items with content", async () => {
    await document.mount(Accordion.Group, {
      id: "group",
      open: 1,
      items: [
        { title: "First", content: "One" },
        { title: "Second", content: "Two" },
      ],
    });
    const group = document.querySelector("#group");
    expect(group.textContent).toInclude("First");
    expect(group.textContent).toInclude("Second");
    expect(group.textContent).toInclude("Two");
  });

  await test("Menu renders horizontal and vertical items", async () => {
    await document.mount(Menu, { id: "menu", type: "vertical", items: [{ label: "Home" }, { label: "Settings" }] });
    const menu = document.querySelector("#menu");
    const buttons = menu.querySelectorAll("button");
    expect(buttons.length).toEqual(2);
    expect(buttons[0].textContent).toEqual("Home");
  });

  await test("Skeleton renders loading placeholders", async () => {
    await document.mount(Skeleton, { id: "skel", style: { variant: "circle", width: "6rem", height: "6rem" } });
    expect(document.querySelector("#skel").tagName).toEqual("DIV");
    await document.mount(Skeleton, { id: "text", style: { variant: "text", height: "4rem" } });
    expect(document.querySelector("#text").children.length).toEqual(8);
  });

  await test("Table renders columns and rows", async () => {
    await document.mount(Table, {
      id: "tbl",
      columns: [
        { key: "name", label: "Name" },
        { key: "created", label: "Created", type: "date" },
        { key: "active", label: "Active", type: "boolean" },
      ],
      data: [{ name: "Draft", created: "2026-01-01", active: true }],
    });
    const table = document.querySelector("#tbl");
    expect(table.tagName).toEqual("TABLE");
    const headers = table.querySelectorAll("thead th");
    expect(headers.length).toEqual(3);
    expect(headers[0].textContent).toEqual("Name");
    const cells = table.querySelectorAll("tbody tr td");
    expect(cells[0].textContent).toEqual("Draft");
    expect(cells[2].textContent).toEqual("Yes");
  });

  await test("Modal renders title, children, and actions", async () => {
    await document.mount(
      withChildren(() => (
        <Modal
          id="modal"
          title="Delete item?"
          actions={[
            { id: "cancel", label: "Cancel" },
            { id: "ok", label: "OK" },
          ]}
        >
          This cannot be undone.
        </Modal>
      )),
    );
    const modal = document.querySelector("#modal");
    expect(modal.tagName).toEqual("DIALOG");
    expect(modal.textContent).toInclude("Delete item?");
    expect(modal.textContent).toInclude("This cannot be undone.");
    expect(modal.querySelectorAll("button").length).toEqual(2);
    expect(document.querySelector("#cancel").textContent).toEqual("Cancel");
    expect(document.querySelector("#ok").textContent).toEqual("OK");
  });

  await test("Popover renders content with manual mode", async () => {
    await document.mount(
      withChildren(() => (
        <Popover id="pop" manual open>
          Details
        </Popover>
      )),
    );
    const popover = document.querySelector("#pop");
    expect(popover.tagName).toEqual("DIALOG");
    expect(popover.textContent).toEqual("Details");
  });

  await test("Popover renders aside when inert", async () => {
    await document.mount(
      withChildren(() => (
        <Popover id="pop" manual open inert>
          Aside content
        </Popover>
      )),
    );
    const popover = document.querySelector("#pop");
    expect(popover.tagName).toEqual("ASIDE");
    expect(popover.textContent).toEqual("Aside content");
  });

  await test("Toast renders message with dismiss button", async () => {
    await document.mount(Toast, { id: "toast", message: "Saved successfully", onDismiss: () => {} });
    const toast = document.querySelector("#toast");
    expect(toast.tagName).toEqual("ASIDE");
    expect(toast.textContent).toInclude("Saved successfully");
    expect(toast.querySelector("button")).not.toEqual(null);
  });

  await test("Carousel renders items with controls", async () => {
    await document.mount(Carousel, {
      id: "carousel",
      items: [<div>First</div>, <div>Second</div>, <div>Third</div>],
      active: 0,
    });
    const carousel = document.querySelector("#carousel");
    expect(carousel).not.toEqual(null);
    expect(carousel.textContent).toInclude("First");
  });

  await test("Calendar renders month view with controls", async () => {
    await document.mount(Calendar, { id: "cal", type: "month", date: new Date(2026, 0, 14) });
    const calendar = document.querySelector("#cal");
    expect(calendar).not.toEqual(null);
    expect(calendar.textContent).toInclude("2026");
    expect(calendar.querySelectorAll("button").length).toBeGreaterThan(1);
  });

  await test("Dropdown renders trigger button only when closed", async () => {
    await document.mount(Dropdown, {
      id: "dd",
      label: "Actions",
      items: [
        { id: "edit", label: "Edit" },
        { divider: true },
        { id: "more", label: "More", items: [{ id: "arch", label: "Archive" }] },
      ],
    });
    const trigger = document.querySelector("#dd");
    expect(trigger.tagName).toEqual("BUTTON");
    expect(trigger.textContent).toEqual("Actions");
    await trigger.click();
    const popover = document.querySelector("dialog[popover]");
    expect(popover.textContent).toInclude("Edit");
    expect(popover.textContent).toInclude("Archive");
  });

  await test("Input renders standard text input", async () => {
    await document.mount(Input, { id: "fld", type: "email", label: "Email", value: "a@b.co" });
    const fieldset = document.querySelector("fieldset");
    expect(fieldset.querySelector("label").textContent).toEqual("Email");
    const input = fieldset.querySelector("input");
    expect(input.value).toEqual("a@b.co");
    expect(input.getAttribute("type")).toEqual("email");
    expect(input.id).toEqual("fld");
  });

  await test("Input renders textarea", async () => {
    await document.mount(Input, { id: "fld", type: "textarea", label: "Bio", value: "text" });
    expect(document.querySelector("textarea").value).toEqual("text");
  });

  await test("Input renders checkbox, radio, switch, toggle", async () => {
    await document.mount(Input, { id: "chk", type: "checkbox", label: "Send updates", value: true });
    const checkbox = document.querySelector("input[type=checkbox]");
    expect(checkbox.checked).toEqual(true);
    await document.mount(Input, { id: "radio", type: "radio", label: "Option", value: true });
    const radio = document.querySelector("input[type=radio]");
    expect(radio).not.toEqual(null);
    await document.mount(Input, { id: "sw", type: "switch", label: "Option", value: false });
    const sw = document.querySelector("input[role=switch]");
    expect(sw.getAttribute("type")).toEqual("checkbox");
    await document.mount(Input, { id: "tg", type: "toggle", label: "Option", value: false });
    expect(document.querySelector("input[role=toggle]")).not.toEqual(null);
  });

  await test("Input renders select with options", async () => {
    await document.mount(Input, {
      id: "sel",
      type: "select",
      label: "Status",
      value: "open",
      options: [{ label: "Open", value: "open" }, "closed"],
    });
    const select = document.querySelector("[role=select]");
    expect(select).not.toEqual(null);
    expect(select.textContent).toInclude("Open");
  });

  await test("Input renders color picker with presets", async () => {
    await document.mount(Input, { id: "clr", type: "color", value: "#ff0000", presets: ["#ff0000", "#008000"] });
    const color = document.querySelector("#clr");
    expect(color.getAttribute("role")).toEqual("select");
  });

  await test("Input renders rich text editor", async () => {
    await document.mount(Input, { id: "rich", type: "rich", format: true, value: "**bold** text" });
    const editor = document.querySelector("#rich");
    expect(editor.getAttribute("contenteditable")).toEqual("");
    expect(editor.textContent).toInclude("bold");
  });

  await test("CustomGlobalDialogs replaces window alert, confirm, prompt", async () => {
    await document.mount(CustomGlobalDialogs);
    const appWindow = /** @type {any} */ (window);
    expect(typeof appWindow.alert).toEqual("function");
    expect(typeof appWindow.confirm).toEqual("function");
    expect(typeof appWindow.prompt).toEqual("function");
    appWindow.alert({ success: "Saved" });
    await document.wait(150);
    expect(document.body.textContent).toInclude("Saved");
    appWindow.confirm("Delete?").then(() => {});
    await document.wait(150);
    expect(document.body.textContent).toInclude("Delete?");
  });
});
