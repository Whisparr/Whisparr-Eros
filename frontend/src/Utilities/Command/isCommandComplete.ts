import Command from 'Commands/Command';

function isCommandComplete(command?: Command | null) {
  if (!command) {
    return false;
  }

  return command.status === 'complete';
}

export default isCommandComplete;
