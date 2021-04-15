import React from "react";
import styled from "styled-components";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";

const MessagesContainer = styled.div`
  display: flex;
  padding: 8px 16px;
  flex-direction: column;
  flex-grow: 1;
`;

const MessageContainerHeader = styled.div`
  font-size: 24px;
  padding: 16px 0;
`;

const MessageContainer = styled.div`
  display: flex;
  background: dimgrey;
  border-radius: 5px;
  padding: 8px;
  flex-direction: column;
  margin-bottom: 6px;
`;

const MessageNameContainer = styled.div`
  color: white;
  font-size: 16px;
  overflow-wrap: anywhere;
`;

const MessageDetailsContainer = styled.div`
  color: white;
  opacity: 0.6;
  font-size: 14px;
`;

export interface MessagesViewProps {
  entities: {
    room?: any;
  };
}

export default function MessagesView({ entities }: MessagesViewProps) {
  return (
    <MessagesContainer>
      <MessageContainerHeader>{entities.room?.name}</MessageContainerHeader>
      {entities.room?.timeline.map((r, i) => (
        <MessageView entities={{ message: r }} key={r.messageId || i} />
      ))}
    </MessagesContainer>
  );
}

interface MessageViewProps {
  entities: {
    message: MatrixEvent;
  };
}

function MessageView({ entities }: MessageViewProps) {
  const { message } = entities;
  const { event, sender } = message;

  return (
    <MessageContainer>
      <MessageNameContainer>{event.content?.ciphertext}</MessageNameContainer>
      <MessageDetailsContainer>
        {message.messageId} - {sender.name}
      </MessageDetailsContainer>
    </MessageContainer>
  );
}
