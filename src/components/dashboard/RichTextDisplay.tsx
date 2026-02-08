import DOMPurify from "dompurify";

interface RichTextDisplayProps {
    content: string;
    className?: string;
}

const RichTextDisplay = ({ content, className = "" }: RichTextDisplayProps) => {
    if (!content) return null;

    // Basic check if content is HTML (ReactQuill usually wraps in <p>)
    const isHtml = /<[a-z][\s\S]*>/i.test(content);

    if (isHtml) {
        return (
            <div
                className={`prose prose-invert max-w-none prose-p:my-1 prose-headings:my-2 ${className}`}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            />
        );
    }

    // Fallback for plain text (preserve newlines)
    return (
        <div className={`whitespace-pre-wrap ${className}`}>
            {content}
        </div>
    );
};

export default RichTextDisplay;
