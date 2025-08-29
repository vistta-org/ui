import { Component, Ref } from "@vistta/js";
import { DateTime, formatDate } from "@vistta/utils";
import Button from "../button";
import style from "./style.scss";
import { DEFAULT_DATE, WEEKDAY_TO_INDEX } from "./utils";
import CalendarView from "./view";

/**
 * @typedef {"month"|"week"|"day"} CalendarType
 */

/**
 * @typedef {{ title: string, start: Date, end: Date, description?: string, location?: string, color?: string }} CalendarEvent
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
  type = "month";

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
   * Current date to display in the calendar
   * @type {Date}
   * @default new Date()
   */
  date = new DateTime();

  /**
   * Whether to show navigation buttons
   * @type {boolean}
   * @default false
   */
  navigation;

  /**
   * Callback function when a click happens on the calendar
   * @type {(event: MouseEvent) => void}
   */
  onClick;

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
    this.date =
      element.scrollLeft + element.clientWidth >= element.scrollWidth - 1
        ? next(this.date, this.type)
        : previous(this.date, this.type);
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
    this.date = new DateTime(day);
  }

  render() {
    return (
      <div ref={Ref.forward(this.ref, this.register.bind(this))} id={this.id} className={this.getClassName()} {...style}>
        <div className="header row:auto container">
          <div className="col:12 container gap:4">
            <h5 className={"col text:center" + (this.navigation ? " pt:2" : "")}>
              {formatDate(this.date, {
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
                  onClick={this.select.bind(this, new DateTime())}
                />
                <Button variant="raw" className="col:auto" action icon="\ue5cc" onClick={this.next.bind(this)} />
              </>
            )}
          </div>
          {this.type !== "day" && renderHeader(this.starting)}
        </div>
        <div
          ref={Ref.forward(this.#body, this.snapToCenter.bind(this))}
          className={`body ${this.type} row`}
          onScrollEnd={this.onScrollEnd.bind(this)}
        >
          <CalendarView
            className={`previous container`}
            type={this.type}
            date={previous(this.date, this.type)}
            events={this.events}
            starting={this.starting}
          />
          <CalendarView
            className={`current container`}
            type={this.type}
            date={this.date}
            events={this.events}
            starting={this.starting}
            onClick={this.onClick}
          />
          <CalendarView
            className={`next container`}
            type={this.type}
            date={next(this.date, this.type)}
            events={this.events}
            starting={this.starting}
          />
        </div>
      </div>
    );
  }
}

function renderHeader(starting) {
  const weekStartIndex = WEEKDAY_TO_INDEX[starting] ?? 1;
  const header = [];
  for (let i = 0; i < 7; i++) {
    const date = DEFAULT_DATE.clone();
    date.day += (i + weekStartIndex) % 7;
    header.push(<div className="col">{date.format({ weekday: "short" })}</div>);
  }
  return header;
}

function next(date, type) {
  date = new DateTime(date);
  if (type === "day") date.day += 1;
  else if (type === "week") date.day += 7;
  else if (type === "month") date.month += 1;
  return date;
}

function previous(date, type) {
  date = new DateTime(date);
  if (type === "day") date.day -= 1;
  else if (type === "week") date.day -= 7;
  else if (type === "month") date.month -= 1;
  return date;
}
