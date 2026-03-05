import React, { useMemo, useState } from 'react';
import './App.css';

const BOARD_SIZE = 9;
const WIN_LINES = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

function getWinner(squares) {
  for (const [a, b, c] of WIN_LINES) {
    const v = squares[a];
    if (v && v === squares[b] && v === squares[c]) {
      return { winner: v, line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

function getIsDraw(squares, winner) {
  return !winner && squares.every(Boolean);
}

// PUBLIC_INTERFACE
function App() {
  /** Current board cells: 'X' | 'O' | null */
  const [squares, setSquares] = useState(() => Array(BOARD_SIZE).fill(null));
  /** True => X's turn, False => O's turn */
  const [xIsNext, setXIsNext] = useState(true);

  const { winner, line: winningLine } = useMemo(() => getWinner(squares), [squares]);
  const isDraw = useMemo(() => getIsDraw(squares, winner), [squares, winner]);

  const currentPlayer = xIsNext ? 'X' : 'O';
  const gameOver = Boolean(winner) || isDraw;

  const statusText = useMemo(() => {
    if (winner) return `Winner: ${winner}`;
    if (isDraw) return 'Draw game';
    return `Turn: ${currentPlayer}`;
  }, [winner, isDraw, currentPlayer]);

  // PUBLIC_INTERFACE
  function handleSquareClick(index) {
    /** Handle a user move on a given square. */
    if (gameOver) return;
    if (squares[index]) return;

    setSquares((prev) => {
      const next = prev.slice();
      next[index] = currentPlayer;
      return next;
    });
    setXIsNext((prev) => !prev);
  }

  // PUBLIC_INTERFACE
  function restartGame() {
    /** Start a new game; X always begins. */
    setSquares(Array(BOARD_SIZE).fill(null));
    setXIsNext(true);
  }

  return (
    <div className="App">
      <main className="page">
        <header className="header">
          <div className="brand">
            <div className="badge" aria-hidden="true">
              TTT
            </div>
            <div className="brandText">
              <h1 className="title">Tic‑Tac‑Toe</h1>
              <p className="subtitle">Classic 3×3 — local two‑player</p>
            </div>
          </div>
        </header>

        <section className="card" aria-label="Game">
          <div className="statusRow">
            <div className="status" role="status" aria-live="polite">
              <span className="statusLabel">Status</span>
              <span className={`statusValue ${winner ? 'statusValueWin' : isDraw ? 'statusValueDraw' : ''}`}>
                {statusText}
              </span>
            </div>

            <div className="turnPills" aria-label="Current player">
              <span className={`pill ${!gameOver && currentPlayer === 'X' ? 'pillActive' : ''}`}>X</span>
              <span className={`pill ${!gameOver && currentPlayer === 'O' ? 'pillActive' : ''}`}>O</span>
            </div>
          </div>

          <div className="boardWrap">
            <div className="board" role="grid" aria-label="Tic tac toe board">
              {squares.map((value, idx) => {
                const isWinningSquare = winningLine?.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`square ${isWinningSquare ? 'squareWin' : ''} ${
                      value === 'X' ? 'squareX' : value === 'O' ? 'squareO' : ''
                    }`}
                    onClick={() => handleSquareClick(idx)}
                    role="gridcell"
                    aria-label={`Square ${idx + 1}${value ? `, ${value}` : ''}`}
                    aria-disabled={gameOver || Boolean(value)}
                    disabled={gameOver || Boolean(value)}
                  >
                    <span className="squareValue" aria-hidden="true">
                      {value}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="controls" aria-label="Controls">
            <button type="button" className="btn btnPrimary" onClick={restartGame}>
              Restart
            </button>
            <button
              type="button"
              className="btn btnSecondary"
              onClick={() => {
                setSquares(Array(BOARD_SIZE).fill(null));
                setXIsNext((prev) => !prev);
              }}
              title="Clear the board and alternate who starts"
            >
              New game (alternate start)
            </button>
          </div>

          <p className="helper">
            Tip: You can use keyboard navigation (Tab) to focus squares and press Enter/Space to place a mark.
          </p>
        </section>

        <footer className="footer">
          <span className="footerText">Frontend‑only • No network required</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
