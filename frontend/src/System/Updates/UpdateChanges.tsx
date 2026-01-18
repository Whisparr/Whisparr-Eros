import React from 'react';
import MarkdownRenderer from 'Components/Markdown/MarkdownRenderer';

interface UpdateChangesProps {
  title: string;
  changes: string[];
}

function UpdateChanges(props: UpdateChangesProps) {
  const { changes } = props;

  if (!changes || changes.length === 0) {
    return null;
  }

  const uniqueChanges = [...new Set(changes)];

  return (
    <div>
      {uniqueChanges.map((change, index) => {
        // Linkify issue numbers
        let transformed = change.replace(
          /#\d{2,5}\b/g,
          (match) =>
            `[${match}](https://github.com/Whisparr/Whisparr-Eros/issues/${match.substring(
              1
            )})`
        );
        // Linkify @mentions
        transformed = transformed.replace(
          /(^|\s)@(\w+)/g,
          (_match, p1, username) =>
            `${p1}[@${username}](https://github.com/${username})`
        );
        // Linkify commit short hashes in parentheses (e.g., (abc1234))
        transformed = transformed.replace(
          /\(([a-f0-9]{7,40})\)/gi,
          (_match, hash) =>
            `([${hash}](https://github.com/Whisparr/Whisparr-Eros/commit/${hash}))`
        );
        // Linkify plain URLs not already inside markdown links
        transformed = transformed.replace(
          /(?<!\]\()https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+/g,
          (url) => `[${url}](${url})`
        );
        return (
          <div key={index}>
            <MarkdownRenderer>{transformed}</MarkdownRenderer>
          </div>
        );
      })}
    </div>
  );
}

export default UpdateChanges;
