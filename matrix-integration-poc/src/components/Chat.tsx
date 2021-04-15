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

  useEffect(() => {
    if (client) {
      var rooms_response = client.getRooms();
      setRooms(rooms_response);
      setRoom(rooms_response[1]);
    }
  }, [setRooms, client]);

  return (
    <ChatContainer>
      <RoomsView entities={{ rooms }} actions={{ onSelect: setRoom }} />
      <ScaledMessagesContainer>
        <MessagesView entities={{ room }} />
      </ScaledMessagesContainer>
    </ChatContainer>
  );
}
