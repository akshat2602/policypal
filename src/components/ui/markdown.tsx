const parseMarkdown = (markdown: string): string => {
    // Replace newlines with line breaks
    let html = markdown.replace(/\n/g, '<br>');

    // Code blocks
    html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Headers
    html = html.replace(/#{3}\s(.+)/g, '<h3>$1</h3>');
    html = html.replace(/#{2}\s(.+)/g, '<h2>$1</h2>');
    html = html.replace(/#{1}\s(.+)/g, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Lists
    html = html.replace(/^\s*-\s(.+)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 hover:underline">$1</a>');
    
    // Blockquotes
    html = html.replace(/>\s(.+)/g, '<blockquote class="border-l-4 border-gray-300 pl-4 my-2">$1</blockquote>');

    return html;
};

interface MarkdownProps {
    content: string;
}

const MarkdownContent: React.FC<MarkdownProps> = ({ content }) => {
    return (
        <div 
            className="markdown-content text-gray-800"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} 
        />
    );
};

export default MarkdownContent;