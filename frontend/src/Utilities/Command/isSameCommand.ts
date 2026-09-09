import { difference } from 'lodash';
import { CommandBody, NewCommandBody } from 'Commands/Command';

// Both sides are read as bare records: a command body is whatever its handler
// declares, so the keys being compared are only known at runtime.
function isSameCommand(
  commandA: CommandBody | NewCommandBody,
  commandB: NewCommandBody
) {
  if (commandA.name.toLocaleLowerCase() !== commandB.name.toLocaleLowerCase()) {
    return false;
  }

  const body = commandA as Record<string, unknown>;

  for (const key in commandB) {
    if (key !== 'name') {
      const value = commandB[key];

      if (Array.isArray(value)) {
        if (difference(value, body[key] as unknown[]).length > 0) {
          return false;
        }
      } else if (value !== body[key]) {
        return false;
      }
    }
  }

  return true;
}

export default isSameCommand;
