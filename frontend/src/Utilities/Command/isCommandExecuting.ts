import Command from 'Commands/Command';

function isCommandExecuting(command?: Command | null) {
  if (!command) {
    return false;
  }

  return command.status === 'queued' || command.status === 'started';
}

export default isCommandExecuting;
