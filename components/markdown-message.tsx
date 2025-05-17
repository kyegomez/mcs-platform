"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"
import rehypeHighlight from "rehype-highlight"
import { cn } from "@/lib/utils"

interface MarkdownMessageProps {
  content: string
  className?: string
}

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  return (
    <ReactMarkdown
      className={cn("prose prose-invert max-w-none break-words", className)}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSanitize, rehypeHighlight]}
      components={{
        h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-6 mb-4" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-5 mb-3" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-md font-bold mt-4 mb-2" {...props} />,
        p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        a: ({ node, ...props }) => (
          <a className="text-mcs-blue hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-mcs-gray pl-4 italic my-4" {...props} />
        ),
        code: ({ node, inline, className, children, ...props }) => {
          if (inline) {
            return (
              <code className="bg-mcs-gray/30 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            )
          }
          return (
            <div className="bg-mcs-gray/30 rounded-md p-4 my-4 overflow-auto">
              <code className="text-sm font-mono" {...props}>
                {children}
              </code>
            </div>
          )
        },
        pre: ({ node, ...props }) => <pre className="bg-transparent p-0 overflow-auto" {...props} />,
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse" {...props} />
          </div>
        ),
        th: ({ node, ...props }) => (
          <th className="border border-mcs-gray bg-mcs-gray/30 px-4 py-2 text-left" {...props} />
        ),
        td: ({ node, ...props }) => <td className="border border-mcs-gray px-4 py-2" {...props} />,
        hr: ({ node, ...props }) => <hr className="my-6 border-mcs-gray" {...props} />,
        img: ({ node, ...props }) => (
          <img className="max-w-full h-auto rounded-md my-4" {...props} alt={props.alt || "Image"} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
