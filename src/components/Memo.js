import React, { useRef } from "react";
import { useAppReducer } from "../AppContext";
import styles from "./AddItemForm.module.scss";
// import SimpleMDE from "simplemde";

// import s from "../js/renderer.js";
// Form to populate todo items
function Memo({ item }) {
  const dispatch = useAppReducer();

  let inputRef = useRef();

  function livetime(value) {
    const newItem = {
      text: item.text,
      key: item.key,
      status: item.status,
      memo: value,
    };
    dispatch({ type: "ADD_MEMO", item: newItem });
  }

  return (
    // <TextInput className={styles.form}
    // onChange={ e => addItem(e.currentTarget.value)}
    // placeholder="Start typing..." >  </TextInput>
    <textarea
      class={styles.textarea}
      onChange={(e) => livetime(e.currentTarget.value)}
      id="text-area"
      ref={inputRef}
      placeholder="Add here"
      value={item.memo}
    />
  );
}

export default Memo;
