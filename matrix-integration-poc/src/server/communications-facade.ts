import { MatrixClient } from "matrix-js-sdk/src/client";
import { createClient } from "matrix-js-sdk/src";

import {
  IMatrixConfigurationProvider,
  IOperationalMatrixUser,
} from "./matrix-configuration-provider";
import { Disposable } from "./disposable";
import { MatrixEventDispatcher } from "./matrix-event-dispatcher";
import { IMatrixEventHandler } from "./matrix-event-handler";

export interface ICommunityMessageRequest {
  communityId: string;
  text: string;
}

export interface IDirectMessageRequest {
  userId: string;
  text: string;
}

export interface IResponseMessage {
  originServerTimestamp: number;
  body: string;
}

export interface ICommunicationFacade {
  getCommunities(): Promise<any[]>;
  getRooms(): Promise<any[]>;
  getMessages(
    roomId: string
  ): Promise<{ roomId: string; name: string; timeline: IResponseMessage[] }>;
  getUserMessages(
    userId: string
  ): Promise<{ roomId: string; name: string; timeline: IResponseMessage[] }>;
  getCommunityMessages(
    communityId: string
  ): Promise<{ roomId: string; name: string; timeline: IResponseMessage[] }>;
  messageUser(content: IDirectMessageRequest): Promise<void>;
  messageCommunity(content: ICommunityMessageRequest): Promise<void>;

  attach(eventHandler: IMatrixEventHandler): void;
  detach(eventHandler: IMatrixEventHandler): void;

  onReady(callback: () => void);
}

enum Visibility {
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

export class MatrixCommunicationFacade
  implements ICommunicationFacade, IMatrixEventHandler, Disposable {
  //REVERT TO PRIVATE - demo only
  private _client: MatrixClient;
  private _eventDispatcher: MatrixEventDispatcher;
  private _onReady: () => void;

  constructor(
    operator: IOperationalMatrixUser,
    configurationProvider: IMatrixConfigurationProvider
  ) {
    const serverConfig = configurationProvider.getClientConfiguration();

    this._client = createClient({
      baseUrl: serverConfig.baseUrl,
      idBaseUrl: serverConfig.idBaseUrl,
      userId: operator.username,
      accessToken: operator.accessToken,
    });

    this._eventDispatcher = new MatrixEventDispatcher(this._client);
    this._eventDispatcher.attach(this);

    this._client.startClient();
  }

  async getCommunities(): Promise<any[]> {
    return this._client.getGroups() || [];
  }

  async getRooms(): Promise<any[]> {
    return this._client.getRooms() || [];
  }

  async getMessages(
    roomId: string
  ): Promise<{ roomId: string; name: string; timeline: IResponseMessage[] }> {
    const room = await this._client.getRoom(roomId);
    return {
      roomId: room.roomId,
      name: room.name,
      timeline: room.timeline,
    };
  }

  async getUserMessages(
    userId: string
  ): Promise<{ roomId: string; name: string; timeline: IResponseMessage[] }> {
    // TODO map room for DM
    const username = userId;
    const dmRoom = this.dmRooms[username];

    // Check DMRoomMap in react-sdk
    if (!dmRoom || !Boolean(dmRoom[0])) {
      return {
        roomId: null,
        name: null,
        timeline: [],
      };
    }

    let targetRoomId = dmRoom[0];

    return await this.getMessages(targetRoomId);
  }

  async getCommunityMessages(
    communityId: string
  ): Promise<{ roomId: string; name: string; timeline: IResponseMessage[] }> {
    // TODO map message communityId to room
    const communityRoomIds = this.communityRooms[communityId];
    if (!communityRoomIds) {
      return {
        roomId: null,
        name: null,
        timeline: [],
      };
    }
    let communityRoomId = communityRoomIds[0];

    const community = this._client.getGroup(communityRoomId);

    return await this.getMessages(community.roomId);
  }

  async messageUser(content: IDirectMessageRequest): Promise<void> {
    const dmRooms = this.dmRooms;
    const dmRoom = dmRooms[content.userId];
    let targetRoomId = null;
    // Check DMRoomMap in react-sdk
    if (!dmRoom || !Boolean(dmRoom[0])) {
      targetRoomId = await this.createRoom({
        dmUserId: content.userId,
      });

      await this.setDmRoom(targetRoomId, content.userId);
    } else {
      targetRoomId = dmRoom[0];
    }

    return this.message(targetRoomId, { text: content.text });
  }

  async messageCommunity(content: ICommunityMessageRequest): Promise<void> {
    // TODO map message communityId to room
    return this.message(content.communityId, { text: content.text });
  }

  private async message(roomId: string, content: { text: string }) {
    return await this._client.sendEvent(
      roomId,
      "m.room.message",
      { body: content.text, msgtype: "m.text" },
      ""
    );
  }

  onReady(callback: () => void) {
    this._onReady = callback;
  }

  async syncMonitor(syncState, oldSyncState, data) {
    if (syncState === "SYNCING" && oldSyncState !== "SYNCING") {
      this._onReady();
    }
  }

  async roomMonitor(event) {
    if (event.getRoomId) {
      const roomId = event.getRoomId();
      console.log(
        `${this._client.credentials.userId} roomMonitor ${roomId}`,
        event
      );
    }
  }

  async roomMemberMembershipMonitor(event, member) {
    const content = event.getContent();
    if (
      content.membership === "invite" &&
      member.userId === this._client.credentials.userId
    ) {
      const roomId = event.getRoomId();
      const senderId = event.getSender();
      console.log(
        `${this._client.credentials.userId} roomMemberMembershipMonitor ${roomId}`,
        event
      );

      await this._client.joinRoom(roomId);
      await this.setDmRoom(roomId, senderId);
    }
  }

  private async setDmRoom(roomId, userId) {
    const dmRooms = this.dmRooms;

    dmRooms[userId] = [roomId];
    await this._client.setAccountData("m.direct", dmRooms);
  }

  // there could be more than one dm room per user
  private get dmRooms(): Record<string, string[]> {
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

  private get communityRooms(): Record<string, string[]> {
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

  private async createRoom(options: IOpts) {
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

  attach(eh) {
    this._eventDispatcher.attach(eh);
  }
  detach(eh) {
    this._eventDispatcher.detach(eh);
  }

  dispose() {
    this._eventDispatcher.dispose();
  }
}
