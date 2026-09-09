import { useState } from 'react';
import Loader from '../../../components/Loader.jsx';
import { useAnalyticsChat } from '../hooks/useAnalyticsChat.js';
import { ANALYTICS_CHAT_MESSAGES } from '../messages.js';
import './AnalyticsChatPage.css';

function AnswerMessage({ message }) {
  const [showQuery, setShowQuery] = useState(false);

  return (
    <article className="analytics-chat-message answer">
      <p className="analytics-chat-answer-text">{message.text}</p>
      <p className="analytics-chat-meta">{ANALYTICS_CHAT_MESSAGES.recordCount(message.recordCount)}</p>
      {message.sql ? (
        <div className="analytics-chat-query-controls">
          <button
            type="button"
            className="secondary analytics-chat-query-toggle"
            onClick={() => setShowQuery((open) => !open)}
          >
            {showQuery ? ANALYTICS_CHAT_MESSAGES.hideQuery : ANALYTICS_CHAT_MESSAGES.viewQuery}
          </button>
          {showQuery ? (
            <div className="analytics-chat-query-panel">
              {message.explanation ? <p className="analytics-chat-query-explanation">{message.explanation}</p> : null}
              <pre className="analytics-chat-sql">{message.sql}</pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default function AnalyticsChatPage() {
  const { messages, loading, error, askQuestion, clearConversation } = useAnalyticsChat();
  const [question, setQuestion] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const currentQuestion = question;
    setQuestion('');
    await askQuestion(currentQuestion);
  }

  return (
    <section className="analytics-chat-page">
      <header className="page-header page-hero">
        <div>
          <h1>{ANALYTICS_CHAT_MESSAGES.title}</h1>
          <p>{ANALYTICS_CHAT_MESSAGES.subtitle}</p>
        </div>
        {messages.length > 0 ? (
          <button type="button" className="secondary" onClick={clearConversation}>
            {ANALYTICS_CHAT_MESSAGES.clear}
          </button>
        ) : null}
      </header>

      <div className="analytics-chat-panel">
        <div className="analytics-chat-conversation" aria-live="polite">
          {messages.length === 0 && !loading && !error ? (
            <p className="analytics-chat-empty">{ANALYTICS_CHAT_MESSAGES.emptyState}</p>
          ) : null}

          {messages.map((message, index) =>
            message.type === 'question' ? (
              <article key={`${message.type}-${index}`} className="analytics-chat-message question">
                <p>{message.text}</p>
              </article>
            ) : (
              <AnswerMessage key={`${message.type}-${index}`} message={message} />
            ),
          )}

          {loading ? <Loader message={ANALYTICS_CHAT_MESSAGES.asking} /> : null}
          {!loading && error ? <p className="status-message error">{error}</p> : null}
        </div>

        <form className="analytics-chat-form" onSubmit={handleSubmit}>
          <label htmlFor="analytics-chat-question">Your question</label>
          <textarea
            id="analytics-chat-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={ANALYTICS_CHAT_MESSAGES.placeholder}
            rows={3}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !question.trim()}>
            {loading ? ANALYTICS_CHAT_MESSAGES.asking : ANALYTICS_CHAT_MESSAGES.ask}
          </button>
        </form>
      </div>
    </section>
  );
}
