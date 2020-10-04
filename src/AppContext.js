import React, { createContext, useContext, useReducer } from "react";
import { loadState, saveState } from "./local-storage";
import { format } from "date-fns";
import { remote } from "electron";

export const AppContext = createContext();
const Slack = require('slack-node'); 


export function getTimepercentage(nd) {
  let percentage = 1;
  let left = 0;
  let mins = 0
  switch (remote.getGlobal("notificationSettings").reminderNotification) {
    case "hour":
      mins = (nd.getMinutes() % 60);
      left = mins + nd.getSeconds() / 60;
      percentage = 1 - (nd.getMinutes() / 60);
      break;
    case "halfhour":
      mins = (nd.getMinutes() % 30);
      left = mins + nd.getSeconds() / 60;
      percentage = 1 - (left / 30);
      break;
    case "quarterhour":
      mins = (nd.getMinutes() % 15);
      left = mins + nd.getSeconds() / 60;
      percentage = 1 - (left / 15);
      break;
    default:
      break;
  }
  return percentage;
}

export function useAppState() {
  return useContext(AppContext)[0];
}

export function useAppReducer() {
  return useContext(AppContext)[1];
}

export function useItems() {
  const { items } = useAppState();

  const pending = items.filter((item) => item.status === "pending");
  const paused = items.filter((item) => item.status === "paused");
  const completed = items.filter((item) => item.status === "completed");
  const routine = items.filter((item) => item.status === "routine");
  const logging = items.filter((item) => item.status === "logging");
  const timePercentage = items.filter((item) => item.status === "timer");

  return { pending, paused, completed, routine, logging, timePercentage };
}


function sendMessage(message) {
let webhook_uri = remote.getGlobal("notificationSettings").webhook_uri;
let channel = remote.getGlobal("notificationSettings").channel;
let slack = new Slack();
slack.setWebhook(webhook_uri);
  slack.webhook({
    channel: channel,
    username: "webhookbot",
    text: message
  }, function(err, response) {
    console.log(response);
  });
}

const appStateReducer = (state, action) => {
  let nd = new Date();
  

  let currentDate = {
    day: format(nd, "dd"),
    dayDisplay: format(nd, "d"),
    month: format(nd, "MM"),
    monthDisplay: format(nd, "MMM"),
    year: format(nd, "y"),
    weekday: format(nd, "EEEE"),
  };

  switch (action.type) {
    case "ADD_ITEM": {
      const newState = { ...state, items: state.items.concat(action.item) };
      saveState(newState);
      sendMessage(`새로운 Todo ${action.item.text}가 생성 되었습니다.`)
      return newState;
    }
    case "UPDATE_ITEM": {
      const newItems = state.items.map((i) => {
        if (i.key === action.item.key) {
          sendMessage(`${i.text} 가 ${i.status} 상태에서 ${action.item.status} 상태로 업데이트 되었습니다.`)
          return Object.assign({}, i, {
            status: action.item.status,
          });
        }
        return i;
      });
      const newState = { ...state, items: newItems };
      saveState(newState);
      return newState;
    }
    case "DELETE_ITEM": {
      const newState = {
        ...state,
        items: state.items.filter((item) => item.key !== action.item.key),
      };
      sendMessage(`${action.item.text}가 삭제 되었습니다.`)
      saveState(newState);
      return newState;
    }
    case "RESET_ALL": {
      let updateItems = state.items.map((i) => {
        if (i.status === "completed") {
          return Object.assign({}, i, {
            status: "routine",
          });
        }
        return i;
      });

      state.items
        .filter((item) => item.status === "completed")
        .map((i) => {
          const newItem = {
            text: i.text,
            key: Date.now(),
            status: "logging",
          };
          updateItems = updateItems.concat(newItem);
          sendMessage(`Todo ${i.text}가 기록으로 남습니다.`)
        });
      const newState = { ...state, items: updateItems, date: currentDate };
      saveState(newState);
      return newState;
    }

    case "TIME_CHECK": {
      nd = new Date();
      let newTime = getTimepercentage(nd);
      const newItems = state.items.map((i) => {
        if (i.status === "timer") {
          return Object.assign({}, i, {
            timePercentage: newTime,
          });
        }
        return i;
      });
      const newState = { ...state, items: newItems };
      saveState(newState);
      return newState;
    }

    case "ADD_MEMO": {
      const newItems = state.items.map(i => {
        if (i.key === action.item.key) {
          return Object.assign({}, i, {
            status: action.item.status,
            memo: action.item.memo
          });
        }
        return i;
      });
      const newState = { ...state, items: newItems };
      saveState(newState);
      return newState;
    }

    default:
      return state;
  }
};

export function AppStateProvider({ children }) {
  let initialState = loadState();

  if (initialState === undefined) {
    let nd = new Date();
    let timer = {
      key: Date.now(),
      status: "timer",
      timePercentage: 1,
    };

    initialState = {
      items: [timer],
      date: {
        day: format(nd, "dd"),
        dayDisplay: format(nd, "d"),
        month: format(nd, "MM"),
        monthDisplay: format(nd, "MMM"),
        year: format(nd, "y"),
        weekday: format(nd, "EEEE"),
      },
    };
  }

  saveState(initialState);

  const value = useReducer(appStateReducer, initialState);
  return (
    <div className="App">
      <AppContext.Provider value={value}>{children}</AppContext.Provider>
    </div>
  );
}
