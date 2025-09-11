import { Component, Ref } from "@vistta/js";
import { DateTime, insertSorted } from "@vistta/utils";
import { WEEKDAY_TO_INDEX } from "./utils";

export default class CalendarView extends Component {
  container = new Ref();
  class;
  type;
  date;
  events;
  starting;
  onClick;
  #eventIndex = {};

  clickHandler(e) {
    if (!this.onClick) return;
    let current = e.target;
    const data = {};
    while (current && current !== this.container?.node) {
      if (current.data) Object.assign(data, current.data);
      current = current.parentElement;
    }
    data.date = new Date(data.date);
    if (data.hour) data.date.setHours(data.hour, 0, 0, 0);
    e.data = { date: data.date?.toString(), event: this.events?.[data.event] };
    this.onClick(e);
  }

  render() {
    const body = [];
    const weekStartIndex = WEEKDAY_TO_INDEX[this.starting] ?? 1;
    if (this.type === "day")
      body.push(
        <div ref={insertOnElement({ date: this.date.date })} class="day">
          {this.renderDay(this.date)}
        </div>,
      );
    else if (this.type === "week") {
      const delta = weekStartIndex - this.date.weekday;
      for (let i = 0; i < 7; i++) {
        const day = this.date.clone();
        day.day += delta + i;
        body.push(
          <div ref={insertOnElement({ date: day.date })} class="day">
            {this.renderDay(day)}
          </div>,
        );
      }
    } else {
      const lastDayFromPreviousMonth = new DateTime([this.date.year, this.date.month, 0]).day;
      for (let i = 0, len = new DateTime([this.date.year, this.date.month, 1]).weekday - weekStartIndex; i < len; i++) {
        const day = new DateTime([this.date.year, this.date.month - 1, lastDayFromPreviousMonth - len + 1 + i]);
        body.push(
          <div ref={insertOnElement({ date: day.date })} class="day disabled">
            {this.renderDay(day)}
          </div>,
        );
      }
      for (let i = 1; i <= new DateTime([this.date.year, this.date.month + 1, 0]).day; i++) {
        const day = new DateTime([this.date.year, this.date.month, i]);
        body.push(
          <div ref={insertOnElement({ date: day.date })} class="day">
            {this.renderDay(day)}
          </div>,
        );
      }
      for (let i = 1, len = 42 - body.length; i <= len; i++) {
        const day = new DateTime([this.date.year, this.date.month + 1, i]);
        body.push(
          <div ref={insertOnElement({ date: day.date })} class="day disabled">
            {this.renderDay(day)}
          </div>,
        );
      }
    }
    return (
      <div ref={this.container} class={this.class} onClick={this.clickHandler}>
        {body}
      </div>
    );
  }

  renderDay(date) {
    const day = [
      <div class="mb:2">
        {this.type === "day" ? date.format({ weekday: "long", day: "numeric", locales: "en-US" }) : date.day}
      </div>,
    ];
    const dayEvents = [];
    const startOfDay = new DateTime([date.year, date.month, date.day]).time;
    const endOfDay = startOfDay + 24 * 3600 * 1000;
    for (let i = 0, len = this.events.length; i < len; i++) {
      const { ...event } = this.events[i];
      event.id = i;
      event.start = new DateTime(event.start);
      event.end = new DateTime(event.end);
      if (event.start.time > endOfDay || event.end.time < startOfDay) continue;
      if (this.type === "month") {
        if (!this.#eventIndex[i]) {
          const index = insertSorted(dayEvents, event, (a, b) => a.start.time - b?.start?.time || 0);
          if (event.start.equals(date, { year: true, month: true, day: true })) this.#eventIndex[i] = index;
        } else dayEvents[this.#eventIndex[i]] = event;
      } else insertSorted(dayEvents, event, (a, b) => a.start.time - b.start.time);
    }
    for (let i = 0, len = dayEvents.length; i < len; i++) {
      const event = dayEvents[i];
      if (event)
        day.push(
          <div
            ref={insertOnElement({ event: event.id })}
            class="event"
            title={event.title || ""}
            style={calculateStyle(this.type, date, event, dayEvents, this.starting)}
          >
            {this.type !== "month" && <div class="time">{event.start.format({ timeStyle: "short" })}</div>}
            <div class="title">{event.title}</div>
            {this.type !== "month" && <div class="location">{event.location}</div>}
            {this.type !== "month" && <div class="description">{event.description}</div>}
          </div>,
        );
    }
    if (this.type === "month") return day;
    for (let i = 0; i < 24; i++) day.push(<div ref={insertOnElement({ hour: i })} class="hour" data-time={i} />);
    return day;
  }
}

function calculateStyle(type, date, event, allEvents, starting) {
  if (type === "month") {
    let style = null;
    if (
      !event.start.equals(date, { year: true, month: true, day: true }) &&
      date.weekday !== (WEEKDAY_TO_INDEX[starting] ?? 1)
    )
      style = { opacity: 0, "pointer-events": "none" };
    else
      style = {
        "--duration": Math.min(
          7 - date.weekday + (WEEKDAY_TO_INDEX[starting] ?? 1),
          Math.abs(date.diff(event.end, "days", false)),
        ),
        "--color": event.color,
      };
    // events can still be placed under another event
    return style;
  }
  const start = date.equals(event.start, { year: true, month: true, day: true })
    ? event.start.hours + event.start.minutes / 60
    : 0;
  return {
    "--start": start,
    "--duration":
      (date.equals(event.end, { year: true, month: true, day: true }) ? event.end.hours + event.end.minutes / 60 : 24) -
      start,
    "--overlapping": getOverlappingEvents(allEvents, event),
    "--color": event.color,
  };
}

function getOverlappingEvents(allEvents, event) {
  let count = 0;
  for (let i = 0, len = allEvents.length; i < len; i++) {
    const cur = allEvents[i],
      prev = allEvents[i - 1];
    if (prev === event) return count;
    if (
      prev &&
      getTimeWithoutSeconds(prev.start) < getTimeWithoutSeconds(cur.end) &&
      getTimeWithoutSeconds(prev.end) > getTimeWithoutSeconds(cur.start)
    )
      count++;
  }
  return count;
}

function getTimeWithoutSeconds(date) {
  return date.time - (date.seconds * 1000 + date.milliseconds);
}

function insertOnElement(data) {
  return (e) => (e.data = Object.assign(e.data || {}, data));
}
