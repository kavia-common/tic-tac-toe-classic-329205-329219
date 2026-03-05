import { render, screen } from '@testing-library/react';
import App from './App';

test('renders tic-tac-toe title and restart control', () => {
  render(<App />);

  // The UI intentionally uses a non-breaking hyphen (U+2011) in "Tic‑Tac‑Toe".
  // Avoid ambiguous getByText() matching by targeting the unique H1 heading element.
  const titleHeading = screen.getByRole('heading', { level: 1 });

  const normalizedTitle = (titleHeading.textContent || '').replace(/[‐‑‒–−-]/g, '-');
  expect(normalizedTitle).toMatch(/tic-tac-toe/i);

  expect(screen.getByRole('button', { name: /restart/i })).toBeInTheDocument();
});
