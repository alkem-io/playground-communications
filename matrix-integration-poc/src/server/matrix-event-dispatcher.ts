import { MatrixClient } from "matrix-js-sdk/src/client";
import { Disposable } from "./disposable";
import { IMatrixEventHandler } from "./matrix-event-handler";

export class MatrixEventDispatcher implements Disposable, IMatrixEventHandler {
  private _handlers: IMatrixEventHandler[] = [];
  private _disposables: (() => void)[] = [];

  constructor(private _client: MatrixClient) {
    this.init();
  }

  init() {
    const syncMonitor = this.syncMonitor.bind(this);
    this._client.on("sync", syncMonitor);
    this._disposables.push(() => this._client.off("sync", syncMonitor));
    const roomMonitor = this.roomMonitor.bind(this);
    this._client.on("Room", roomMonitor);
    this._disposables.push(() => this._client.off("Room", roomMonitor));
    const roomTimelineMonitor = this.roomTimelineMonitor.bind(this);
    this._client.on("Room.timeline", roomTimelineMonitor);
    this._disposables.push(() =>
      this._client.off("Room.timeline", roomTimelineMonitor)
    );
    // this._client.on("sync", this.roomMemberMonitor);
    // this._disposables.push(() => this._client.off("sync", this.roomMemberMonitor));
    const roomMemberMembershipMonitor = this.roomMemberMembershipMonitor.bind(
      this
    );
    this._client.on("RoomMember.membership", roomMemberMembershipMonitor);
    this._disposables.push(() =>
      this._client.off("RoomMember.membership", roomMemberMembershipMonitor)
    );
    const groupMyMembershipMonitor = this.groupMyMembershipMonitor.bind(this);
    this._client.on("Group.myMembership", groupMyMembershipMonitor);
    this._disposables.push(() =>
      this._client.off("Group.myMembership", groupMyMembershipMonitor)
    );
  }

  async syncMonitor(syncState, oldSyncState, data) {
    const syncHandlers = this._handlers.filter((h) => h?.syncMonitor);
    for (let handler of syncHandlers) {
      await handler.syncMonitor(syncState, oldSyncState, data);
    }
  }

  async roomMonitor(event) {
    for (let handler of this._handlers) {
      await (handler?.roomMonitor && handler?.roomMonitor(event));
    }
  }

  async roomTimelineMonitor(event) {
    const roomTimelineHandlers = this._handlers.filter(
      (h) => h?.roomTimelineMonitor
    );
    for (let handler of roomTimelineHandlers) {
      await handler.roomTimelineMonitor(event);
    }
  }

  async roomMemberMonitor(event) {
    for (let handler of this._handlers) {
      await (handler?.roomMemberMonitor && handler?.roomMemberMonitor(event));
    }
  }

  async roomMemberMembershipMonitor(event, member) {
    for (let handler of this._handlers) {
      await (handler?.roomMemberMembershipMonitor &&
        handler?.roomMemberMembershipMonitor(event, member));
    }
  }

  async groupMyMembershipMonitor(group) {
    for (let handler of this._handlers) {
      await (handler?.groupMyMembershipMonitor &&
        handler?.groupMyMembershipMonitor(group));
    }
  }

  attach(eventHandler: IMatrixEventHandler) {
    this.detach(eventHandler);

    this._handlers.push(eventHandler);
  }

  detach(eventHandler: IMatrixEventHandler) {
    const index = this._handlers.indexOf(eventHandler);
    if (index > -1) {
      this._handlers.splice(index, 1);
    } else if (eventHandler.id) {
      this._handlers = this._handlers.filter((h) => h.id !== eventHandler.id);
    }
  }

  dispose(): void {
    this._handlers.forEach((h) => this.detach(h));
    this._disposables.forEach((d) => d());
  }
}
