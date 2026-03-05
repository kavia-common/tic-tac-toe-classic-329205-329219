import { render, screen } from '@testing-library/react';
import App from './App';

test('renders tic-tac-toe title and restart control', () => {
  render(<App />);

  // The UI intentionally uses a non-breaking hyphen (U+2011) in "Tic‑Tac‑Toe".
  // Make the test resilient to hyphen variants without changing UI behavior.
  const titleMatcher = (_content, node) => {
    const text = node?.textContent || '';
    const normalized = text.replace(/[‐‑‒–−-]/g, '-');
    return /tic-tac-toe/i.test(normalized);
  };

  expect(screen.getByText(titleMatcher)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /restart/i })).toBeInTheDocument();
});
