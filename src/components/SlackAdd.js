import React, { useRef } from "react";
import { useAppReducer } from "../AppContext";
import slack from "../img/slack.svg";
import styles from "./AddItemForm.module.scss";
import { remote } from "electron";
import istyles from "./SlackAdd.module.scss";

import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from "@reach/accordion";

const Store = require("electron-store");
const store = new Store();

// Individual todo item
function SlackAdd() {
    let inputRef = useRef();

    global.notificationSettings = {
        webhook_uri: store.get("webhook_uri") || ""
      };
      var webhook_uri = store.get("webhook_uri")

    function addItem(value) {
        remote.getGlobal("notificationSettings").webhook_uri = value;
        store.set("webhook_uri", value);
      }

  return (
      <Accordion collapsible multiple>
        <AccordionItem>
          <div className={styles.flex} tabIndex="0">
            <AccordionButton className={istyles.slack_toggle}>
              <img src={slack} alt="Logging Toggle" />
            </AccordionButton>
            <AccordionPanel className={styles.panel}>
              {["test"].map((i) => {
                return <form className={styles.form}>
                <input onChange={(e) => addItem(e.currentTarget.value)} 
                value={webhook_uri} 
                ref={inputRef}
                placeholder="Slack web hook uri" />
              </form>;
              })}
            </AccordionPanel>
          </div>
        </AccordionItem>
      </Accordion>
  );
}

export default SlackAdd;
