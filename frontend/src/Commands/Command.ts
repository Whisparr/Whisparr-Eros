import ModelBase from 'App/ModelBase';

export type CommandPriority = 'low' | 'normal' | 'high';

export interface CommandBody {
  sendUpdatesToClient: boolean;
  updateScheduledTask: boolean;
  completionMessage: string;
  requiresDiskAccess: boolean;
  isExclusive: boolean;
  isLongRunning: boolean;
  name: string;
  lastExecutionTime: string;
  lastStartTime: string;
  trigger: string;
  suppressMessages: boolean;
  movieId?: number;
  movieIds?: number[];
}

// Loose by design: every page builds its own command payload, and the server accepts
// whatever that command's handler declares.
export interface NewCommandBody {
  name: string;
  priority?: CommandPriority;
  [key: string]:
    string | number | boolean | number[] | string[] | object | undefined;
}

interface Command extends ModelBase {
  name: string;
  commandName: string;
  message: string;
  body: CommandBody;
  priority: CommandPriority;
  status: string;
  result: string;
  queued: string;
  started: string;
  ended: string;
  duration: string;
  trigger: string;
  stateChangeTime: string;
  sendUpdatesToClient: boolean;
  updateScheduledTask: boolean;
  lastExecutionTime: string;
}

export default Command;
