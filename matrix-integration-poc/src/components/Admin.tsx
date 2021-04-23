import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import MatrixCommunicationFacadeContext from "../contexts/matrix-client";
import { MatrixElevatedCommunicationsFacade } from "../server/elevated-communications-facade";
import {
  IMatrixUser,
  IOperationalMatrixUser,
} from "../server/matrix-configuration-provider";
import { Preset, Visibility } from "../server/matrix-room-entity-adapter";

type AdminPropTypes = { admin: IOperationalMatrixUser; users: IMatrixUser[] };

const Input = styled.input`
  padding: 0.5em;
  margin: 0.5em;
  color: "palevioletred";
  background: papayawhip;
  border: none;
  border-radius: 3px;
`;

export function Admin({ admin, users }: AdminPropTypes) {
  const [value, setValue] = useState<string>("");
  const communicator = useContext(
    MatrixCommunicationFacadeContext
  ) as MatrixElevatedCommunicationsFacade;
  const [communicatorReady, setCommunicatorReady] = useState(false);

  useEffect(() => {
    communicator.onReady(() => setCommunicatorReady(true));
  }, [communicator]);

  return (
    <div>
      <span>
        Communicator {communicatorReady ? "running" : "not running"} for admin -{" "}
        {admin.name}
      </span>
      <Input value={value} onChange={(e) => setValue(e.currentTarget.value)} />
      <button
        onClick={async () => {
          const groupId = await communicator.createGroup(
            {
              groupId: value.replaceAll(" ", "-").toLowerCase(),
              profile: { name: value },
            },
            users
          );
          await communicator.createRoom({
            communityId: groupId,
            createOpts: {
              name: `${value} main room`,
              room_alias_name: `${value}-main-room`
                .replaceAll(" ", "-")
                .toLowerCase(),
              invite: users.map((u) => u.username),
              visibility: Visibility.Private,
              preset: Preset.PublicChat,
            },
          });
        }}
      >
        Create group
      </button>
    </div>
  );
}
