import { findLast } from 'lodash';
import Command, { NewCommandBody } from 'Commands/Command';
import isSameCommand from './isSameCommand';

function findCommand(commands: readonly Command[], options: NewCommandBody) {
  return findLast(commands, (command) => {
    return isSameCommand(command.body, options);
  });
}

export default findCommand;
