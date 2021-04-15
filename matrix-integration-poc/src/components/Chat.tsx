import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import MatrixClientContext from "../contexts/matrix-client";
import MessagesView, { MessagesViewProps } from "./Messages";
import RoomsView, { RoomsViewProps } from "./Rooms";

const ChatContainer = styled.div`
  display: flex;
  background: grey;
  flex-grow: 1;
`;

const ScaledMessagesContainer = styled.div`
  flex-grow: 4;
  display: flex;
`;

interface ChatViewProps {}

export default function ChatView(props: ChatViewProps) {
  const client = useContext(MatrixClientContext);
  const [rooms, setRooms] = useState<RoomsViewProps["entities"]["rooms"]>([]);
  const [room, setRoom] = useState<
    MessagesViewProps["entities"]["room"] | null
  >(null);
  const [events, setEvents] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (client) {
      var rooms_response = client.getRooms();
      setRooms(rooms_response);
      setRoom(rooms_response[0]);
      setEvents(
        rooms_response.reduce(
          (aggr, r) => ({
            ...aggr,
            [r.roomId]: r.timeline,
          }),
          {}
        )
      );
    }
  }, [setRooms, setEvents, client]);

  useEffect(() => {
    async function timelineMonitor(event) {
      const roomId = event.getRoomId();

      setEvents((x) => ({
        ...x,
        [roomId]: [...x[roomId], event],
      }));
    }

    client?.on("Room.timeline", timelineMonitor);

    return () => client?.off("Room.timeline", timelineMonitor);
  }, [client, setEvents]);

  return (
    <ChatContainer>
      <RoomsView entities={{ rooms }} actions={{ onSelect: setRoom }} />
      <ScaledMessagesContainer>
        <MessagesView entities={{ room, events: events[room?.roomId] || [] }} />
      </ScaledMessagesContainer>
    </ChatContainer>
  );
}
