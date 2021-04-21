import React, { useCallback, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import MatrixClientContext from "../contexts/matrix-client";
import useMatrixRoom from "../hooks/useMatrixRoom";
import useMatrixRoomManagement from "../hooks/useMatrixRoomManagement";
import MessagesView, { MessagesViewProps } from "./Messages";
import ReplyView from "./Reply";
import RoomsView, { RoomsViewProps } from "./Rooms";

const ChatContainer = styled.div`
  display: flex;
  background: grey;
  flex-grow: 1;
`;

const ScaledMessagesContainer = styled.div`
  flex-grow: 4;
  display: flex;
  position: relative;
`;

const AbsoluteMessagesContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 56px;
  display: flex;
  overflow: auto;
  padding: 8px;
`;

const RoomsContainer = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  width: 240px;
`;

interface ChatViewProps {}

export default function ChatView(props: ChatViewProps) {
  const client = useContext(MatrixClientContext);
  const [groups, setGroups] = useState<
    MessagesViewProps["entities"]["room"] | null
  >(null);
  const [rooms, setRooms] = useState<RoomsViewProps["entities"]["rooms"]>([]);
  const [room, setRoom] = useState<
    MessagesViewProps["entities"]["room"] | null
  >(null);

  useEffect(() => {
    if (client) {
      var rooms_response = client.getRooms();
      var groups_response = client.getGroups();
      setGroups(groups_response);
      setRooms(rooms_response);
      setRoom(rooms_response[rooms_response.length - 1]);
    }
  }, [setRooms, client]);

  useEffect(() => {
    const roomMonitor = async function () {
      var rooms_response = client.getRooms();
      setRooms(rooms_response);
      setRoom(rooms_response[rooms_response.length - 1]);
    };

    if (client) {
      client.on("Room", roomMonitor);
    }

    return () => client?.off("Room", roomMonitor);
  }, [client]);

  const onSend = useCallback(
    (reply) => {
      if (reply) {
        client?.sendEvent(
          room.roomId,
          "m.room.message",
          {
            body: reply,
            msgtype: "m.text",
          },
          ""
        );
      }
    },
    [room, client]
  );

  const { room: target, timeline } = useMatrixRoom(room);
  const { createRoom } = useMatrixRoomManagement();

  return (
    <ChatContainer>
      <RoomsContainer>
        <RoomsView
          entities={{ rooms }}
          actions={{
            onSelect: setRoom,
            onCreate: (room) => createRoom(room, groups[1].groupId),
          }}
        />
        {groups && (
          <div>
            {groups.map((g) => (
              <span key={g.groupId}>{g.groupId}</span>
            ))}
          </div>
        )}
      </RoomsContainer>
      <ScaledMessagesContainer>
        <AbsoluteMessagesContainer>
          <MessagesView entities={{ room: target, events: timeline }} />
        </AbsoluteMessagesContainer>
        <ReplyView actions={{ onReply: onSend }} />
      </ScaledMessagesContainer>
    </ChatContainer>
  );
}
