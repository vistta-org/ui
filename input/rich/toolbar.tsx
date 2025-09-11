import { Component } from "@vistta/js";
import Menu, { type MenuItem } from "../../menu";

export enum FormatOptions {
  Size = "size",
  Color = "color",
  Mark = "mark",
  Align = "align",
  Bold = "bold",
  Italic = "italic",
  Underline = "underline",
  Strikethrough = "strikethrough",
  BulletList = "bulletList",
  NumberList = "numberList",
  CheckList = "checkList",
  Cite = "cite",
  Code = "code",
  Sup = "sup",
  Sub = "sub",
}

const ICONS = {
  color: "\ue23c",
  mark: "\ue6d1",
  bold: "\ue238",
  italic: "\ue23f",
  underline: "\ue249",
  strikethrough: "\ue246",
  bulletList: "\ue241",
  numberList: "\ue242",
  checkList: "\ue6b1",
  cite: "\ue244",
  code: "\ue86f",
  sup: "\uf112",
  sub: "\uf111",
};

export default class RichToolbar extends Component {
  options?: true | FormatOptions[];
  onSelect?: (option: FormatOptions, arg?: string) => void;

  render() {
    const items = [];
    const options = typeof this.options === "boolean" ? Object.values(FormatOptions) : this.options;
    for (let i = 0, len = options.length; i < len; i++) {
      switch (options[i]) {
        case FormatOptions.Size:
          items.push(
            {
              label: "increase size",
              icon: "\ueae2",
              onClick: () => this.onSelect?.(options[i], "increase"),
              action: true,
            },
            {
              label: "decrease size",
              icon: "\ueadd",
              onClick: () => this.onSelect?.(options[i], "decrease"),
              action: true,
            },
          );
          break;
        case FormatOptions.Align:
          items.push({
            icon: "\ue235",
            items: [
              {
                label: "left",
                icon: "\ue236",
                onClick: () => this.onSelect?.(options[i], "left"),
                action: true,
              },
              {
                label: "center",
                icon: "\ue234",
                onClick: () => this.onSelect?.(options[i], "center"),
                action: true,
              },
              {
                label: "right",
                icon: "\ue237",
                onClick: () => this.onSelect?.(options[i], "right"),
                action: true,
              },
              {
                label: "justify",
                icon: "\ue235",
                onClick: () => this.onSelect?.(options[i], "justify"),
                action: true,
              },
            ],
          });
          break;
        default:
          items.push({
            label: options[i],
            icon: ICONS[options[i]],
            onClick: () => this.onSelect?.(options[i]),
            action: true,
          });
          break;
      }
    }
    return <Menu variant="raw" class="toolbar" items={items as MenuItem[]} />;
  }
}
