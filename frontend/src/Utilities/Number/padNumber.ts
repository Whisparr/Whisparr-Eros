function padNumber(
  input: number | string | null | undefined,
  width: number,
  paddingCharacter: number | string = 0
) {
  if (input == null) {
    return '';
  }

  return `${input}`.padStart(width, `${paddingCharacter}`);
}

export default padNumber;
