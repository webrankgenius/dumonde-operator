// src/hooks/useMessages.js
import { useCallback, useState } from "react";
import { OperatorAPI } from "../lib/api";
import { sortByCreatedAtAsc } from "../utils/format";

function msgListFromApi(data) {
  if (Array.isArray(data)) return data;
  if (data?.items && Array.isArray(data.items)) return data.items;
  if (data?.messages && Array.isArray(data.messages)) return data.messages;
  return [];
}

export function useMessages() {
  const [msgs, setMsgs] = useState([]);

  const loadMessages = useCallback(async (convId) => {
    const data = await OperatorAPI.getMessages(convId);
    const list = sortByCreatedAtAsc(msgListFromApi(data));
    setMsgs(list);
    return list;
  }, []);

  const sendMessage = useCallback(async (convId, content) => {
    await OperatorAPI.sendMessage(convId, content);
    // fallback fetch - keeps UI correct even if WS is slow
    return loadMessages(convId);
  }, [loadMessages]);

  return {
    msgs,
    setMsgs,
    loadMessages,
    sendMessage,
  };
}