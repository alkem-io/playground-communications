import { MatrixClient } from "matrix-js-sdk/src/client";

export enum Visibility {
  Public = "public",
  Private = "private",
}

export enum Preset {
  PrivateChat = "private_chat",
  TrustedPrivateChat = "trusted_private_chat",
  PublicChat = "public_chat",
}

interface ICreateOpts {
  visibility?: Visibility;
  room_alias_name?: string;
  name?: string;
  topic?: string;
  invite?: string[];
  room_version?: string;
  creation_content?: object;
  is_direct?: boolean;
  power_level_content_override?: object;
  preset?: Preset;
}

export interface IOpts {
  dmUserId?: string;
  createOpts?: ICreateOpts;
  spinner?: boolean;
  guestAccess?: boolean;
  encryption?: boolean;
  inlineErrors?: boolean;
  andView?: boolean;
  communityId?: string;
}

export class MatrixRoomEntityAdapter {
  constructor(private _client: MatrixClient) {}

  public async setDmRoom(roomId, userId) {
    // NOT OPTIMIZED - needs caching
    const dmRooms = this.dmRooms();

    dmRooms[userId] = [roomId];
    await this._client.setAccountData("m.direct", dmRooms);
  }

  // there could be more than one dm room per user
  public dmRooms(): Record<string, string[]> {
    let mDirectEvent = this._client.getAccountData("m.direct");
    mDirectEvent = mDirectEvent ? mDirectEvent.getContent() : {};

    const userId = this._client.getUserId();

    // there is a bug in the sdk
    const selfDMs = mDirectEvent[userId];
    if (selfDMs && selfDMs.length) {
      // need to fix it here
    }

    return mDirectEvent;
  }

  public async createRoom(options: IOpts): Promise<string> {
    const { dmUserId, communityId } = options;
    // adjust options
    const createOpts = options.createOpts || {};

    const defaultPreset = Preset.PrivateChat;
    createOpts.preset = createOpts.preset || defaultPreset;
    createOpts.visibility = createOpts.visibility || Visibility.Private;

    if (dmUserId && createOpts.invite === undefined) {
      createOpts.invite = [dmUserId];
    }
    if (dmUserId && createOpts.is_direct === undefined) {
      createOpts.is_direct = true;
    }

    const room = await this._client.createRoom(createOpts);
    if (communityId) {
      await this._client.addRoomToGroup(communityId, room.room_id, false);
    }

    return room.room_id;
  }
}
