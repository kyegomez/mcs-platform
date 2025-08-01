import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownContentProps {
  content: string
  className?: string
}

export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  return (
    <div className={`prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-muted-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-blockquote:text-muted-foreground prose-code:text-primary prose-pre:bg-background/50 prose-pre:border prose-pre:border-border/50 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold text-foreground mb-3">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold text-foreground mb-2 mt-4">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-medium text-foreground mb-2 mt-3">{children}</h3>,
          h4: ({ children }) => <h4 className="text-sm font-medium text-foreground mb-1 mt-2">{children}</h4>,
          p: ({ children }) => <p className="text-foreground mb-2 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside text-foreground mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside text-foreground mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-foreground">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 py-2 my-3 bg-primary/5 rounded-r-lg">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className
            if (isInline) {
              return <code className="bg-background/50 px-1 py-0.5 rounded text-primary text-sm font-mono">{children}</code>
            }
            return (
              <pre className="bg-background/50 border border-border/50 rounded-lg p-3 overflow-x-auto">
                <code className="text-sm font-mono text-foreground">{children}</code>
              </pre>
            )
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-border/50 rounded-lg">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-sm font-medium text-foreground bg-accent/50 border-b border-border/50">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-sm text-foreground border-b border-border/50">
              {children}
            </td>
          ),
          hr: () => <hr className="border-border/50 my-4" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
} 