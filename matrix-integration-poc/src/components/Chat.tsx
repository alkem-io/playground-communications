import React, { useCallback, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import MatrixCommunicationFacadeContext from "../contexts/matrix-client";
import useMatrixRoom from "../hooks/useMatrixRoom";
import { IMatrixUser } from "../server/matrix-configuration-provider";
import MessagesView, { MessagesViewProps } from "./Messages";
import ReplyView from "./Reply";
import RoomsView from "./Rooms";

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

interface ChatViewProps {
  users: IMatrixUser[];
}

export default function ChatView(props: ChatViewProps) {
  const communicator = useContext(MatrixCommunicationFacadeContext);
  const [communicatorReady, setCommunicatorReady] = useState(false);
  const [groups, setGroups] = useState<
    MessagesViewProps["entities"]["room"] | null
  >(null);
  const [rooms, setRooms] = useState<any[]>(null);
  const [room, setRoom] = useState<
    MessagesViewProps["entities"]["room"] | null
  >(null);

  useEffect(() => {
    communicator.onReady(() => setCommunicatorReady(true));
  }, [communicator]);

  useEffect(() => {
    async function bootstrapRooms() {
      if (communicator && communicatorReady) {
        const groups = await communicator.getCommunities();
        setGroups((x) => {
          if (x) {
            return x;
          }

          return groups;
        });
        const rooms = await communicator.getRooms();
        setRooms((x) => {
          if (x) {
            return x;
          }

          return rooms;
        });
      }
    }

    bootstrapRooms();
  }, [setGroups, setRooms, communicator, communicatorReady]);

  const onSend = useCallback(
    (reply) => {
      if (reply) {
        communicator.messageUser({
          text: reply,
          userId: props.users[0].username,
        });
      }
    },
    [communicator, props.users]
  );

  const { timeline } = useMatrixRoom({
    userId: communicatorReady && props.users[0].username,
  });
  // const { createRoom } = useMatrixRoomManagement();

  return (
    <ChatContainer>
      <RoomsContainer>
        {rooms && (
          <RoomsView
            entities={{ rooms }}
            actions={{
              onSelect: setRoom,
              onCreate: (room) => {
                console.log("TODO - rewire room creation", room);
                //createRoom(room, groups[1].groupId)
              },
            }}
          />
        )}
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
          <MessagesView entities={{ room: room, events: timeline }} />
        </AbsoluteMessagesContainer>
        <ReplyView actions={{ onReply: onSend }} />
      </ScaledMessagesContainer>
    </ChatContainer>
  );
}
