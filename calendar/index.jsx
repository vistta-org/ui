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
  class;

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
   * @type {"all" | "gesture" | "none"}
   * @default "all"
   */
  controls = "all";

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

  getClass() {
    return "calendar container" + (this.class ? ` ${this.class}` : "");
  }

  onScrollEnd(event) {
    const element = event.target;
    if (element.scrollLeft === element.clientWidth) return;
    this.date =
      element.scrollLeft + element.clientWidth >= element.scrollWidth - 1
        ? new DateTime(this.date).next(this.type)
        : new DateTime(this.date).previous(this.type);
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
      <div ref={Ref.forward(this.ref, this.register.bind(this))} id={this.id} class={this.getClass()} {...style}>
        <div class="header row:auto container">
          <div class="col:12 container gap:4">
            {this.controls === "all" && (
              <Button variant="raw" class="col:auto" action icon="\ue5cb" onClick={this.previous.bind(this)} />
            )}
            <h5 class={"col text:center" + (this.controls === "all" ? " pt:2" : "")}>
              {formatDate(this.date, {
                locales: "en-US",
                month: "long",
                year: "numeric",
              })}
            </h5>
            {this.controls === "all" && (
              <>
                <Button
                  variant="raw"
                  class="col:auto"
                  action
                  icon="\ue935"
                  onClick={this.select.bind(this, new DateTime())}
                />
                <Button variant="raw" class="col:auto" action icon="\ue5cc" onClick={this.next.bind(this)} />
              </>
            )}
          </div>
          {this.type !== "day" && renderHeader(this.starting)}
        </div>
        <div
          ref={Ref.forward(this.#body, this.snapToCenter.bind(this))}
          class={`body ${this.type} row`}
          onWheel={this.controls === "none" ? (e) => e.preventDefault() : undefined}
          onTouchMove={this.controls === "none" ? (e) => e.preventDefault() : undefined}
          onScrollEnd={this.controls !== "none" && this.onScrollEnd.bind(this)}
        >
          <CalendarView
            class={`previous container`}
            type={this.type}
            date={new DateTime(this.date).previous(this.type)}
            events={this.events}
            starting={this.starting}
          />
          <CalendarView
            class={`current container`}
            type={this.type}
            date={new DateTime(this.date)}
            events={this.events}
            starting={this.starting}
            onClick={this.onClick}
          />
          <CalendarView
            class={`next container`}
            type={this.type}
            date={new DateTime(this.date).next(this.type)}
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
    header.push(
      <div class="col">
        {date.format({
          locales: "en-US",
          weekday: "short",
        })}
      </div>,
    );
  }
  return header;
}
