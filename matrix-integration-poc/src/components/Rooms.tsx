import React from "react";
import styled from "styled-components";

const RoomsContainer = styled.div`
  display: flex;
  background: #353535;
  padding: 8px 16px;
  flex-direction: column;
  flex-grow: 1;
`;

const RoomContainer = styled.div`
  display: flex;
  background: dimgrey;
  padding: 16px;
  flex-direction: column;
  cursor: pointer;
  border-radius: 5px;
  margin-bottom: 8px;
  opacity: 0.9;

  &:hover {
    opacity: 1;
  }
`;

const RoomNameContainer = styled.div`
  color: whitesmoke;
  font-size: 16px;
`;

const RoomDetailsContainer = styled.div`
  color: whitesmoke;
  opacity: 0.6;
  font-size: 12px;
`;

export interface RoomsViewProps {
  entities: {
    rooms: RoomViewProps["entities"]["room"][];
  };
  actions: {
    onSelect: (room: any) => void;
  };
}

export default function RoomsView({ entities, actions }: RoomsViewProps) {
  return (
    <RoomsContainer>
      {entities.rooms.map((r) => (
        <RoomView entities={{ room: r }} actions={actions} key={r.roomId} />
      ))}
    </RoomsContainer>
  );
}

interface RoomViewProps {
  entities: {
    room: Record<string, any>;
  };
  actions: {
    onSelect: (room: any) => void;
  };
}

function RoomView({ entities, actions }: RoomViewProps) {
  const { room } = entities;

  return (
    <RoomContainer onClick={() => actions.onSelect(room)}>
      <RoomNameContainer>{room.name}</RoomNameContainer>
      <RoomDetailsContainer>{room.roomId}</RoomDetailsContainer>
    </RoomContainer>
  );
}
