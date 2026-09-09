function split(input?: string | null, separator = ',') {
  if (!input) {
    return [];
  }

  return input.split(separator).filter((s) => !!s);
}

export default split;
