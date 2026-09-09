const regex = /\b\w+/g;

function titleCase(input?: string | null) {
  if (!input) {
    return '';
  }

  return input.replace(regex, (match) => {
    return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
  });
}

export default titleCase;
