import React from 'react';
import ReactMarkdown from 'react-markdown';

type MarkdownRendererProps = React.PropsWithChildren<{
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
}>;

function MarkdownRenderer(props: MarkdownRendererProps) {
  const { className, children } = props;
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              className={['Link-to', props.className].filter(Boolean).join(' ')}
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
        }}
      >
        {children as string}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;
