import React, { useState } from "react";
import styled from "styled-components";

const UserContainer = styled.div`
  display: flex;
  padding: 8px;
  flex-direction: column;
  flex-grow: 1;
  border: 1px solid darkslategrey;
`;

export interface UserViewProps {
  entities: { user: any };
}

export default function UserView({ entities }: UserViewProps) {
  const { user } = entities;

  const content = user.getContent();

  return (
    <UserContainer>
      <span>{content.name}</span>
      <span>{content.avatar_url}</span>
    </UserContainer>
  );
}
