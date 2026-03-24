import { Component, Ref } from "@vistta/js";

/**
 * @typedef {import("../button/index.jsx").ButtonProps} ButtonProps
 *
 * @typedef {object} TableColumn
 * @property {string} key
 * @property {string} label
 * @property {"text" | "number" | "date" | "boolean" | ((value: any) => string)} [type] default: "text"
 *
 * @typedef {object} TableProps
 * @property {string} [id]
 * @property {Ref<HTMLTableElement> | ((element: HTMLTableElement) => void)} [ref]
 * @property {string | undefined} [title]
 * @property {TableColumn[]} columns
 * @property {object[]} data
 * @property {JSX.Style} [style]
 */

/**
 * @extends {Component<TableProps>}
 */
class Table extends Component {
  // sort
  // resize
  // scroll
  // select
  // stick
  // paginate
  // filter
  // search

  render() {
    return (
      <table ref={this.ref} id={this.id} style={this.style}>
        <thead>
          <tr>
            {this.columns.map((column) => (
              <th style={{ cursor: "pointer", border: "right" }}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {this.data.map((row) => (
            <tr>
              {this.columns.map((column) => (
                <td>{columnToString(column.type, row[column.key], row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default Table;

function columnToString(type, value, row) {
  if (typeof type === "function") return type(value, row);
  switch (type) {
    case "date":
      return new Date(value).toLocaleDateString();
    case "boolean":
      return value ? "Yes" : "No";
    default:
      return value.toString();
  }
}
