
export interface IMatrixEventHandler {
  id?: string;
  syncMonitor?: (syncState, oldSyncState, data) => Promise<void>;
  roomMonitor?: (event) => Promise<void>;
  roomTimelineMonitor?: (event) => Promise<void>;
  roomMemberMonitor?: (event) => Promise<void>;
  roomMemberMembershipMonitor?: (event, member) => Promise<void>;
  groupMyMembershipMonitor?: (group) => Promise<void>;
}