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
          /#\d{3,5}\b/g,
          (match) =>
            `[${match}](https://github.com/Whisparr/Whisparr/issues/${match.substring(
              1
            )})`
        );
        // Linkify @mentions
        transformed = transformed.replace(
          /(^|\s)@(\w+)/g,
          (_match, p1, username) =>
            `${p1}[@${username}](https://github.com/${username})`
        );
        // Transform GitHub PR URLs to PR#123 links
        transformed = transformed.replace(
          /https:\/\/github\.com\/([\w-]+)\/([\w-]+)\/pull\/(\d+)/g,
          (url, _owner, _repo, pr) => `[#${pr}](${url})`
        );
        // Linkify plain URLs not already inside markdown links
        transformed = transformed.replace(
          /(?<!\]\()https?:\/\/[^\s)]+/g,
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
