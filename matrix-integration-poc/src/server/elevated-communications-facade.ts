import { MatrixCommunicationFacade } from "./communications-facade";
import { IMatrixUser } from "./matrix-configuration-provider";
import {
  IOpts as GroupOpts,
  MatrixGroupEntityAdapter,
} from "./matrix-group-entity-adapter";
import {
  IOpts as RoomOpts,
  MatrixRoomEntityAdapter,
} from "./matrix-room-entity-adapter";

interface IElevatedCommunicationsFacade {
  createRoom: MatrixRoomEntityAdapter["createRoom"];
  createGroup: MatrixGroupEntityAdapter["createGroup"];
}

export class MatrixElevatedCommunicationsFacade
  extends MatrixCommunicationFacade
  implements IElevatedCommunicationsFacade {
  async createRoom(options: RoomOpts) {
    return await this._roomEntityAdapter.createRoom(options);
  }
  async createGroup(options: GroupOpts, users?: IMatrixUser[]) {
    const groupId = await this._groupEntityAdapter.createGroup(options);
    await this._groupEntityAdapter.inviteUsersToGroup(groupId, users || []);

    return groupId;
  }
}
