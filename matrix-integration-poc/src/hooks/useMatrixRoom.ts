import { useContext, useEffect, useMemo, useState } from "react";
import MatrixCommunicationFacadeContext from "../contexts/matrix-client";

export default function useMatrixRoom(props: {
  communityId?: string;
  userId?: string;
}) {
  const { communityId, userId } = props || { roomId: null };
  const client = useContext(MatrixCommunicationFacadeContext);
  const [roomId, setRoomId] = useState(null);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    async function bootstrapTimeline() {
      if (userId) {
        const { roomId, timeline } = await client.getUserMessages(userId);
        setTimeline(timeline);
        setRoomId(roomId);
      }
    }

    bootstrapTimeline();
  }, [client, userId, setRoomId, setTimeline]);

  useEffect(() => {
    async function bootstrapTimeline() {
      if (communityId) {
        const { roomId, timeline } = await client.getCommunityMessages(
          communityId
        );
        setTimeline(timeline);
        setRoomId(roomId);
      }
    }

    bootstrapTimeline();
  }, [client, communityId, setRoomId, setTimeline]);

  const handler = useMemo(
    () => ({
      id: "named-dispatcher-because-remouting",
      roomTimelineMonitor: async function (event) {
        if (roomId === event.getRoomId()) {
          setTimeline((x) => [...x.filter((e) => e !== event), event]);
        }
      },
    }),
    [setTimeline, roomId]
  );

  useEffect(() => {
    client.attach(handler);

    return () => {
      client.detach(handler);
    };
  }, [client, handler]);

  return {
    roomId,
    timeline,
  };
}
