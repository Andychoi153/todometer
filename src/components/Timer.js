import React from "react";
import { useItems, useAppReducer } from "../AppContext";
import sandclock from "../img/sandclock.svg";

import styles from "./Timer.module.scss";
import { remote } from "electron";
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';

const Store = require("electron-store");

const store = new Store();

global.notificationSettings = {
  resetNotification: store.get("reset") || true,
  reminderNotification: store.get("reminder") || "hour"
};

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));
// Timer bar for reset todo items
function Timer() {
  const dispatch = useAppReducer();
  let { routine, completed, pending, paused, timePercentage } = useItems();
  const pausedAmount = paused.length;
  const pendingAmount = pending.length;
  const completedAmount = completed.length;
  const routineAmount = routine.length;
  const totalAmount = pendingAmount + completedAmount + routineAmount;
  const [time, setTime] = React.useState('');

  const classes = useStyles();

  let completedPercentage = completedAmount / totalAmount;
  let timePercent = 1;
  if (timePercentage.length > 0) {
    timePercent = timePercentage[0].timePercentage;
  } else {
    const newItem = {
      timePercentage: 1,
      key: 0,
      status: "timer",
    };
    dispatch({ type: "ADD_ITEM", item: newItem });
    timePercent = 1;
  }
  const handleChange = (event) => {
    setTime(event.target.value);
    remote.getGlobal("notificationSettings").reminderNotification = event.target.value;
    store.set("reminder", event.target.value);
  };


  return (
    <div tabIndex="0">
      <img src={sandclock} className={styles.sandclock} />
      <FormControl className={classes.formControl}>
      <InputLabel id="demo-simple-select-filled-label">Reset Term</InputLabel>
        <Select
          labelId="demo-simple-select-filled-label"
          id="demo-simple-select-filled"
          value={time}
          onChange={handleChange}
        >
          <MenuItem value={"quarterhour"}>Every 15 minuites</MenuItem>
          <MenuItem value={"halfhour"}>Every 30 minuites</MenuItem>
          <MenuItem value={"hour"}>Every 1 hours</MenuItem>
        </Select>
        </FormControl>
      <div className={styles.progress}>
      {timePercent < 0.5 ? (
        <div
          className={`${styles.progressbar} ${styles.paused}`}
          style={{ width: `${timePercent * 100}%` }}
        ></div>
      ) : (
        <div
          className={`${styles.progressbar} ${styles.completed}`}
          style={{ width: `${timePercent * 100}%` }}
        ></div>
      )}
      ;
    </div>
    </div>

  );
}

export default Timer;
