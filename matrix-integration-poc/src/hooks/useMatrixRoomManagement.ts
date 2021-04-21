import { IOpts } from "matrix-react-sdk/src/createRoom";
import { useCallback, useContext } from "react";
import MatrixClientContext from "../contexts/matrix-client";

enum Visibility {
  Public = "public",
  Private = "private",
}

/* for the full setup check matrix-react-sdk components
- GroupStore, GroupAddressPicker, GroupView, CommunityPrototypeStore, CreateRoomDialog
- createRoom
*/
export default function useMatrixRoomManagement() {
  const client = useContext(MatrixClientContext);

  const createRoom = useCallback(
    (room, groupId, dmId?: string) => {
      const options: IOpts = {
        associatedWithCommunity: groupId,
        dmUserId: dmId,
        createOpts: {
          // def not robust, just proving we can set alias
          room_alias_name: room.name.replaceAll(" ", "-"),
          name: room.name,
          visibility: Visibility.Private,
        },
      };

      // For direct messaging
      //   if (opts.dmUserId && createOpts.invite === undefined) {
      //     switch (getAddressType(opts.dmUserId)) {
      //         case 'mx-user-id':
      //             createOpts.invite = [opts.dmUserId];
      //             break;
      //         case 'email':
      //             createOpts.invite_3pid = [{
      //                 id_server: MatrixClientPeg.get().getIdentityServerUrl(true),
      //                 medium: 'email',
      //                 address: opts.dmUserId,
      //             }];
      //     }
      // }

      return client
        .createRoom(options.createOpts)
        .then(async (room_response) => {
          if (groupId) {
            await client.addRoomToGroup(groupId, room_response.room_id, false);
          }
        });
    },
    [client]
  );

  return {
    createRoom,
  };
}
