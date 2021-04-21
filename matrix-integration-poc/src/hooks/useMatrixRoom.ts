import { useContext, useEffect, useState } from "react";
import MatrixClientContext from "../contexts/matrix-client";

export default function useMatrixRoom(props: { roomId: string }) {
  const { roomId } = props || { roomId: null };
  const client = useContext(MatrixClientContext);
  const [room, setRoom] = useState(null);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    if (roomId) {
      setRoom(client.getRoom(roomId));
    }
  }, [client, roomId, setRoom]);

  useEffect(() => {
    if (room) {
      setTimeline([...room.timeline]);
    }
  }, [room]);

  useEffect(() => {
    const timelineMonitor = async function (event) {
      if (event.getRoomId() === roomId) {
        setTimeline((t) => [...t, event]);
      }
    };

    if (roomId && client) {
      client.on("Room.timeline", timelineMonitor);
    }

    return () => client?.off("Room.timeline", timelineMonitor);
  }, [roomId, client]);

  return {
    room,
    timeline,
  };
}
