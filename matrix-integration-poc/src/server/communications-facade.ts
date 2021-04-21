import { MatrixClient } from "matrix-js-sdk/src/client";
import { createClient } from "matrix-js-sdk/src";

import {
  IMatrixConfigurationProvider,
  IOperationalMatrixUser,
} from "./matrix-configuration-provider";

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
  getUserMessages(userId: string): Promise<IResponseMessage[]>;
  getCommunityMessages(communityId: string): Promise<IResponseMessage[]>;
  messageUser(content: IDirectMessageRequest): Promise<void>;
  messageCommunity(content: ICommunityMessageRequest): Promise<void>;
  onMessage(listener: () => void): void;
}

// need an equivalent of
export interface Disposable {
  dispose(): void;
}

export class MatrixCommunicationFacade
  implements ICommunicationFacade, Disposable {
  private _client: MatrixClient;
  private _onMessageListeners: (() => void)[];
  private _disposables: (() => void)[];

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
    this._client.startClient();
    this.initTimelineMonitor();
    this._onMessageListeners = [];

    this._disposables.push(this.initRoomMonitor());
    this._disposables.push(this.initTimelineMonitor());
  }

  async getUserMessages(userId: string): Promise<IResponseMessage[]> {
    // TODO map room for DM
    return [];
  }

  async getCommunityMessages(communityId: string): Promise<IResponseMessage[]> {
    // TODO map message communityId to room
    return [];
  }

  async messageUser(content: IDirectMessageRequest): Promise<void> {
    // TODO create room for DM
    return this.message(content.userId, { text: content.text });
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

  private initRoomMonitor() {
    const monitor = async function (event) {
      // TODO map room events
    };

    this._client.on("Room.timeline", monitor);

    return () => this._client.off("Room", monitor);
  }

  private initTimelineMonitor() {
    const monitor = async function (event) {
      // TODO map events
      this._onMessageListeners.forEach((l) => l());
    };

    this._client.on("Room.timeline", monitor);

    return () => this._client.off("Room.timeline", monitor);
  }

  onMessage(listener: () => void) {
    this._onMessageListeners.push(listener);
  }

  dispose() {
    this._disposables.forEach((d) => d());
  }
}
