import { createClient } from "matrix-js-sdk/src";
import { MatrixClient } from "matrix-js-sdk/src/client";
import { Disposable } from "./disposable";
import {
  IMatrixConfigurationProvider,
  IOperationalMatrixUser,
} from "./matrix-configuration-provider";
import { MatrixEventDispatcher } from "./matrix-event-dispatcher";
import { IMatrixEventHandler } from "./matrix-event-handler";
import { MatrixRoomEntityAdapter } from "./matrix-room-entity-adapter";

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

export class MatrixCommunicationFacade
  implements ICommunicationFacade, IMatrixEventHandler, Disposable {
  //REVERT TO PRIVATE - demo only
  private _client: MatrixClient;
  private _eventDispatcher: MatrixEventDispatcher;
  private _roomEntityAdapter: MatrixRoomEntityAdapter;
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

    this._roomEntityAdapter = new MatrixRoomEntityAdapter(this._client);

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
    const username = userId;
    const dmRoom = this._roomEntityAdapter.dmRooms()[username];

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
    const communityRoomIds = this._roomEntityAdapter.communityRooms()[
      communityId
    ];
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
    // there needs to be caching for dmRooms and event to update them
    const dmRooms = this._roomEntityAdapter.dmRooms();
    const dmRoom = dmRooms[content.userId];
    let targetRoomId = null;

    if (!dmRoom || !Boolean(dmRoom[0])) {
      targetRoomId = await this._roomEntityAdapter.createRoom({
        dmUserId: content.userId,
      });

      await this._roomEntityAdapter.setDmRoom(targetRoomId, content.userId);
    } else {
      targetRoomId = dmRoom[0];
    }

    return this.message(targetRoomId, { text: content.text });
  }

  async messageCommunity(content: ICommunityMessageRequest): Promise<void> {
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
      await this._roomEntityAdapter.setDmRoom(roomId, senderId);
    }
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
