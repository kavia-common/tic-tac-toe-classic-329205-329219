import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

function getBoard() {
  return screen.getByRole('grid', { name: /tic tac toe board/i });
}

function getSquares() {
  // Each square is a button with role=gridcell and an aria-label "Square N[, X|O]"
  return within(getBoard()).getAllByRole('gridcell');
}

function expectStatusText(expected) {
  const status = screen.getByRole('status');
  expect(status).toHaveTextContent(expected);
}

async function clickSquare(user, index0Based) {
  const squares = getSquares();
  await user.click(squares[index0Based]);
}

describe('Tic-tac-toe gameplay', () => {
  test('starts with X turn and alternates turns on valid moves', async () => {
    const user = userEvent.setup();
    render(<App />);

    expectStatusText(/turn:\s*x/i);

    await clickSquare(user, 0);
    expectStatusText(/turn:\s*o/i);

    await clickSquare(user, 1);
    expectStatusText(/turn:\s*x/i);

    // Verify the squares got the expected marks via their accessible names
    expect(getSquares()[0]).toHaveAccessibleName(/square 1,\s*x/i);
    expect(getSquares()[1]).toHaveAccessibleName(/square 2,\s*o/i);
  });

  test('does not allow clicking an already-filled square (turn does not change)', async () => {
    const user = userEvent.setup();
    render(<App />);

    expectStatusText(/turn:\s*x/i);

    await clickSquare(user, 0);
    expectStatusText(/turn:\s*o/i);

    // Clicking the same square again should do nothing (it is disabled).
    // user-event will not click disabled elements, so assert disabled + status unchanged.
    const square1 = getSquares()[0];
    expect(square1).toBeDisabled();

    await user.click(square1).catch(() => {
      // Some versions of user-event throw on disabled click; either behavior is fine
      // as long as the UI state remains unchanged.
    });

    expectStatusText(/turn:\s*o/i);
    expect(getSquares()[0]).toHaveAccessibleName(/square 1,\s*x/i);
  });

  test('detects a win and prevents further moves after game over', async () => {
    const user = userEvent.setup();
    render(<App />);

    // X: 1, O: 4, X: 2, O: 5, X: 3 => X wins top row.
    await clickSquare(user, 0); // X
    await clickSquare(user, 3); // O
    await clickSquare(user, 1); // X
    await clickSquare(user, 4); // O
    await clickSquare(user, 2); // X wins

    expectStatusText(/winner:\s*x/i);

    // After win, all squares should be disabled (gameOver disables squares).
    for (const sq of getSquares()) {
      expect(sq).toBeDisabled();
    }

    // No further moves possible; board state remains the same.
    const before = getSquares().map((sq) => sq.getAttribute('aria-label'));
    await user.click(getSquares()[8]).catch(() => {});
    const after = getSquares().map((sq) => sq.getAttribute('aria-label'));
    expect(after).toEqual(before);
  });

  test('detects a draw when the board is full with no winner', async () => {
    const user = userEvent.setup();
    render(<App />);

    // A known draw sequence (no 3-in-a-row):
    // X:1 O:2 X:3 O:5 X:4 O:6 X:8 O:7 X:9
    const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
    for (const idx of moves) {
      await clickSquare(user, idx);
    }

    expectStatusText(/draw game/i);

    // Game over => squares disabled
    for (const sq of getSquares()) {
      expect(sq).toBeDisabled();
    }
  });

  test('Restart resets board and sets X to start', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Make a couple of moves to change state
    await clickSquare(user, 0); // X
    await clickSquare(user, 1); // O

    expect(getSquares()[0]).toHaveAccessibleName(/square 1,\s*x/i);
    expect(getSquares()[1]).toHaveAccessibleName(/square 2,\s*o/i);

    await user.click(screen.getByRole('button', { name: /restart/i }));

    // All squares empty and enabled
    const squares = getSquares();
    for (let i = 0; i < squares.length; i += 1) {
      expect(squares[i]).toHaveAccessibleName(new RegExp(`square\\s+${i + 1}$`, 'i'));
      expect(squares[i]).toBeEnabled();
    }

    // X always starts after restart
    expectStatusText(/turn:\s*x/i);
  });

  test('New game alternates who starts (clears board and toggles starting player)', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Initial starter is X
    expectStatusText(/turn:\s*x/i);

    // After "New game (alternate start)", starter becomes O
    await user.click(screen.getByRole('button', { name: /new game \(alternate start\)/i }));
    expectStatusText(/turn:\s*o/i);

    // Board cleared and enabled
    let squares = getSquares();
    for (let i = 0; i < squares.length; i += 1) {
      expect(squares[i]).toHaveAccessibleName(new RegExp(`square\\s+${i + 1}$`, 'i'));
      expect(squares[i]).toBeEnabled();
    }

    // Make a move as O, then alternate start back to X for the next game
    await clickSquare(user, 0); // O moves
    expect(getSquares()[0]).toHaveAccessibleName(/square 1,\s*o/i);

    await user.click(screen.getByRole('button', { name: /new game \(alternate start\)/i }));
    expectStatusText(/turn:\s*x/i);

    squares = getSquares();
    for (let i = 0; i < squares.length; i += 1) {
      expect(squares[i]).toHaveAccessibleName(new RegExp(`square\\s+${i + 1}$`, 'i'));
      expect(squares[i]).toBeEnabled();
    }
  });
});
