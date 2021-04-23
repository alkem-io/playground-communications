import { MatrixClient } from "matrix-js-sdk/src/client";
import { group } from "node:console";
import { IMatrixUser } from "./matrix-configuration-provider";

enum Visibility {
  Public = "public",
  Private = "private",
}

export enum Preset {
  PrivateChat = "private_chat",
  TrustedPrivateChat = "trusted_private_chat",
  PublicChat = "public_chat",
}

interface IProfileOpts {
  name?: string;
}

export interface IOpts {
  groupId: string;
  profile: IProfileOpts;
}

export class MatrixGroupEntityAdapter {
  constructor(private _client: MatrixClient) {}

  public communityRooms(): Record<string, string[]> {
    const communities = this._client.getGroups();
    const communityRooms = this._client.getRooms();

    let roomMap = {};
    for (const community of communities) {
      roomMap[community.groupId] = roomMap[community.groupId] || [];

      for (const room of communityRooms) {
        if (room.groupId === community.groupId) {
          roomMap[community.groupId].push(room.roomId);
        }
      }
    }

    return roomMap;
  }

  public async createGroup(options: IOpts): Promise<string> {
    const { groupId, profile } = options;

    const group = await this._client.createGroup({
      localpart: groupId,
      profile: profile,
    });

    // await this._client.setGroupPublicity(
    //   group.group_id,
    //   true /* Make the group public so people can join it */
    // );

    await this._client.setGroupJoinPolicy(group.group_id, {
      type: "invite" /* Allow users with invites to join this group */,
    });

    return group.group_id;
  }

  public async inviteUsersToGroup(groupId: string, users: IMatrixUser[]) {
    for (const user of users) {
      await this._client.inviteUserToGroup(groupId, user.username);
    }
  }
}
