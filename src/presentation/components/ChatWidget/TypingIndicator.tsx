/**
 * Typing indicator with animated dots
 */
export const TypingIndicator: React.FC = () => {
    return (
        <div className="typing-indicator">
            <div className="typing-indicator-message">
                <div className="typing-indicator-dots">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                </div>
            </div>
        </div>
    );
};
