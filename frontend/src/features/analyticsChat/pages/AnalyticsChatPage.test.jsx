import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import AnalyticsChatPage from './AnalyticsChatPage.jsx';

vi.mock('../../../api/analyticsChat.js', () => ({
  askAnalyticsQuestion: vi.fn(),
}));

import { askAnalyticsQuestion } from '../../../api/analyticsChat.js';

describe('AnalyticsChatPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders an empty state before a question is asked', () => {
    render(<AnalyticsChatPage />);

    expect(screen.getByText(/Ask a question to see analytics/i)).toBeInTheDocument();
  });

  it('submits a question and renders the grounded answer', async () => {
    askAnalyticsQuestion.mockResolvedValue({
      answer: 'The average compensation is $95,000 USD.',
      sql: 'SELECT AVG(total) FROM employee_salaries LIMIT 10',
      explanation: 'Average total compensation',
      recordCount: 1,
    });

    const user = userEvent.setup();
    render(<AnalyticsChatPage />);

    await user.type(
      screen.getByPlaceholderText(/average compensation of engineers/i),
      'What is the average compensation of engineers in India?',
    );
    await user.click(screen.getByRole('button', { name: 'Ask' }));

    expect(await screen.findByText('The average compensation is $95,000 USD.')).toBeInTheDocument();
    expect(screen.getByText('What is the average compensation of engineers in India?')).toBeInTheDocument();
    expect(askAnalyticsQuestion).toHaveBeenCalledWith(
      'What is the average compensation of engineers in India?',
    );
  });

  it('shows an error when the analytics chat API fails', async () => {
    askAnalyticsQuestion.mockRejectedValue(new Error('Unable to load analytics answer.'));

    const user = userEvent.setup();
    render(<AnalyticsChatPage />);

    await user.type(screen.getByPlaceholderText(/average compensation of engineers/i), 'How many employees?');
    await user.click(screen.getByRole('button', { name: 'Ask' }));

    expect(await screen.findByText('Unable to load analytics answer.')).toBeInTheDocument();
  });

  it('reveals generated SQL behind the view query control', async () => {
    askAnalyticsQuestion.mockResolvedValue({
      answer: 'There are 2 employees.',
      sql: 'SELECT COUNT(*) FROM employees LIMIT 10',
      explanation: 'Count employees',
      recordCount: 1,
    });

    const user = userEvent.setup();
    render(<AnalyticsChatPage />);

    await user.type(screen.getByPlaceholderText(/average compensation of engineers/i), 'How many employees?');
    await user.click(screen.getByRole('button', { name: 'Ask' }));

    await screen.findByText('There are 2 employees.');
    await user.click(screen.getByRole('button', { name: 'View query' }));

    await waitFor(() => {
      expect(screen.getByText('SELECT COUNT(*) FROM employees LIMIT 10')).toBeInTheDocument();
    });
  });
});
