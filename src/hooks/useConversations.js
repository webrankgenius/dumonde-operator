// src/hooks/useConversations.js
import { useCallback, useMemo, useState } from "react";
import { OperatorAPI } from "../lib/api";

function convListFromApi(data) {
  if (Array.isArray(data)) return data;
  if (data?.items && Array.isArray(data.items)) return data.items;
  if (data?.conversations && Array.isArray(data.conversations)) return data.conversations;
  return [];
}

export function useConversations() {
  const [convs, setConvs] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const refreshConvs = useCallback(async () => {
    const data = await OperatorAPI.listConversations();
    setConvs(convListFromApi(data));
  }, []);

  const active = useMemo(() => {
    return (convs || []).find((c) => c.id === activeId) || null;
  }, [convs, activeId]);

  return {
    convs,
    setConvs,
    activeId,
    setActiveId,
    active,
    refreshConvs,
  };
}