import { Component, Ref } from "@vistta/js";
import Button from "../button";
import style from "./style.scss";

/**
 * @typedef {"month"|"week"|"day"} CalendarType
 */

/**
 * @typedef {{ title: string, start: Date, end: Date, description?: string }} CalendarEvent
 */

export default class Calendar extends Component {
  #body = new Ref();
  /**
   * Unique identifier for the calendar component
   * @type {string}
   */
  id;

  /**
   * Reference to the calendar element
   * @type {Ref<HTMLElement> | ((element: HTMLElement) => void) | null}
   */
  ref;

  /**
   * Custom classes for the calendar component
   * @type {string}
   */
  className;

  /**
   * Calendar view type
   * @type {CalendarType}
   */
  type = "day";

  /**
   * Starting day of the week
   * @type {"mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun"}
   */
  starting = "mon";

  /**
   * List of events for the calendar
   * @type {Array<CalendarEvent>}
   */
  events = [];

  /**
   * Current day to display in the calendar
   * @type {Date}
   * @default new Date()
   */
  day = new Date();

  /**
   * Whether to show navigation buttons
   * @type {boolean}
   * @default false
   */
  navigation;

  register(element) {
    element.next = this.next.bind(this);
    element.previous = this.previous.bind(this);
    element.select = this.select.bind(this);
  }

  getClassName() {
    return "calendar container" + (this.className ? ` ${this.className}` : "");
  }

  onScrollEnd(event) {
    const element = event.target;
    if (element.scrollLeft === element.clientWidth) return;
    this.day =
      element.scrollLeft + element.clientWidth >= element.scrollWidth - 1
        ? next(this.day, this.type)
        : previous(this.day, this.type);
    this.snapToCenter(element, false);
  }

  snapToCenter(element, initial = true) {
    if (initial && element.clientWidth === element.scrollWidth) return setTimeout(() => this.snapToCenter(element), 10);
    element.scrollLeft = element.offsetWidth;
  }

  next() {
    const body = this.#body.node;
    if (!body) return;
    body.scrollBy({ left: body.offsetWidth, behavior: "smooth" });
  }

  previous() {
    const body = this.#body.node;
    if (!body) return;
    body.scrollBy({ left: -body.offsetWidth, behavior: "smooth" });
  }

  select(day) {
    this.day = new Date(day);
  }

  render() {
    return (
      <div ref={Ref.forward(this.ref, this.register.bind(this))} id={this.id} className={this.getClassName()} {...style}>
        <div className="header row:auto container">
          <div className="col:12 container gap:4">
            <h5 className={"col text:center" + (this.navigation ? " pt:2" : "")}>
              {this.day?.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h5>
            {this.navigation && (
              <>
                <Button variant="raw" className="col:auto" action icon="\ue5cb" onClick={this.previous.bind(this)} />
                <Button
                  variant="raw"
                  className="col:auto"
                  action
                  icon="\ue935"
                  onClick={this.select.bind(this, new Date())}
                />
                <Button variant="raw" className="col:auto" action icon="\ue5cc" onClick={this.next.bind(this)} />
              </>
            )}
          </div>
          {renderHeader(this.type, this.starting)}
        </div>
        <div
          ref={Ref.forward(this.#body, this.snapToCenter.bind(this))}
          className={`body ${this.type} row`}
          onScrollEnd={this.onScrollEnd.bind(this)}
        >
          <div className={`previous container`}>
            {renderBody(this.type, previous(this.day, this.type), this.events, this.starting, -1)}
          </div>
          <div className={`current container`}>{renderBody(this.type, this.day, this.events, this.starting)}</div>
          <div className={`next container`}>
            {renderBody(this.type, next(this.day, this.type), this.events, this.starting, 1)}
          </div>
        </div>
      </div>
    );
  }
}

function renderHeader(type, starting) {
  if (type === "day") return null;
  const weekStartIndex = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0 }[starting] ?? 1;
  const baseDate = new Date(Date.UTC(1996, 0, 14));
  const header = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + ((i + weekStartIndex) % 7));
    header.push(<div className="col">{date.toLocaleDateString("en-US", { weekday: "short" })}</div>);
  }
  return header;
}

function renderBody(type, day, events, starting) {
  if (type === "day")
    return [<div className="day">{day.toLocaleDateString("en-US", { weekday: "long", day: "numeric" })}</div>];
  const body = [];
  const weekStartIndex = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0 }[starting] ?? 1;
  if (type === "week") {
    const delta = weekStartIndex - day.getDay();
    for (let i = 0; i < 7; i++) {
      const date = new Date(day);
      date.setDate(day.getDate() + i + delta);
      body.push(<div className="day">{date.getDate()}</div>);
    }
    return body;
  }
  const firstDayOfMonth = new Date(day.getFullYear(), day.getMonth(), 1);
  const lastDayOfMonth = new Date(day.getFullYear(), day.getMonth() + 1, 0);

  for (let i = 0, len = firstDayOfMonth.getDay() - weekStartIndex; i < len; i++)
    body.push(<div className="day disabled">{new Date(day.getFullYear(), day.getMonth(), 0).getDate() - len + 1 + i}</div>);
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) body.push(<div className="day">{i}</div>);
  for (let i = 1, len = 42 - body.length; i <= len; i++) body.push(<div className="day disabled">{i}</div>);
  return body;
}

function renderDay(day, events) {}

function next(date, type) {
  date = new Date(date);
  if (type === "day") date.setDate(date.getDate() + 1);
  else if (type === "week") date.setDate(date.getDate() + 7);
  else if (type === "month") date.setMonth(date.getMonth() + 1);
  return date;
}

function previous(date, type) {
  date = new Date(date);
  if (type === "day") date.setDate(date.getDate() - 1);
  else if (type === "week") date.setDate(date.getDate() - 7);
  else if (type === "month") date.setMonth(date.getMonth() - 1);
  return date;
}
