import React, { useEffect, useState, useRef } from "react";
import { Calendar, formatDate } from "fullcalendar";
import "fullcalendar/dist/fullcalendar.css";
//import { toMoment } from "fullcalendar-moment";
//import "fullcalendar/plugins/moment-timezone"; // need this! or include <script> tag instead

const URL = "https://5aacb25f3f108d00143a567b.mockapi.io/stim/api/v1/events";

const useAPIData = () => {
  const [events, setEvents] = useState(null);

  useEffect(() => {
    console.log("FETCHING...");
    fetch(URL)
      .then(res => res.json())
      .then(setEvents)
      .catch(err => err);
  }, []);
  return [events]; // Need to be wrapped in an Array. UseState Strips when used in another function.
};

const useUpdateEvent = event => {
  const [eventEdit, setEventEdit] = useState(null);

  useEffect(
    () => {
      if (eventEdit) {
        fetch(`${URL}/${eventEdit.id}`, {
          method: "put",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify(eventEdit)
        })
          .then(res => res.json())
          .then(data => {
            console.log("API Returned ", data);
          })
          .catch(err => console.log(err));
      } else {
        console.log(`Could not save to database`);
      }
    },
    [eventEdit]
  );

  return [eventEdit, setEventEdit];
};

const CalendarApp = () => {
  const [events, setEvent] = useAPIData();
  const [editEvent, setEditEvent] = useUpdateEvent(null);
  const calRef = useRef();
  //const myRef = React.createRef();
  useEffect(
    () => {
      const calNode = calRef.current;
      const newNode = document.getElementById("calendar");
      const calendar = new Calendar(newNode, {
        handleWindowResize: true,
        editable: true,
        height: 800,
        header: {
          left: "prev, next today",
          center: "title",
          right: "month, agendaWeek, agendaDay",
          eventLimit: true
        },
        timeZone: "UTC",
        minTime: "07:00:00",
        maxTime: "21:00:00",
        slotDuration: "00:30:00",
        events,
        eventLimit: true, // for all non-agenda views
        views: {
          agenda: {
            eventLimit: 5 // adjust to 6 only for agendaWeek/agendaDay
          }
        },
        allDayMaintainDuration: false,
        forceEventDuration: true,
        defaultTimedEventDuration: "01:00",
        eventClick: current => {
          console.log(current.event.start.toUTCString());
          console.log(current.event.end.toUTCString());
          const id = current.event.id;
        },
        eventDragStart: current => {
          console.log("DragStart", current);
        },
        eventDragStop: current => {
          console.log("DragStop", current);
        },
        eventDrop: current => {
          const { id, start, end } = current.event;

          const eventUpdate = {
            id,
            start: start.toUTCString(),
            end: start.toUTCString()
          };

          console.log(current.event.end.toUTCString());
          setEditEvent(eventUpdate);
          console.log(eventUpdate);
        }
      });
      calendar.render();

      return () => {
        calendar.destroy(); //Cleanup calendar after code changes.
      };
      console.log("fired");
    },
    [events]
  );

  return <div id="calendar" ref={calRef} />;
};

export default CalendarApp;
