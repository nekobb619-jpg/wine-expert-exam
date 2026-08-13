import { useMemo, useState } from 'react';
import { questionsData } from './data/questions';
import type { Question } from './types';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const LETTERS = ['A', 'B', 'C', 'D'];

function buildOptions(q: Question) {
  return shuffle([q.correctOption, ...q.wrongOptions]);
}

export default function App() {
  const [started, setStarted] = useState(false);
  const [order, setOrder] = useState<number[]>([]);
  const [pos, setPos] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [finished, setFinished] = useState(false);

  function handleStart() {
    setOrder(shuffle(questionsData.map((_, i) => i)));
    setPos(0);
    setSelected(null);
    setScore({ correct: 0, total: 0 });
    setFinished(false);
    setStarted(true);
  }

  const question = started ? questionsData[order[pos]] : null;
  const options = useMemo(() => (question ? buildOptions(question) : []), [question]);

  const isAnswered = selected !== null;
  const isCorrect = question !== null && selected === question.correctOption;

  function handleAnswer(option: string) {
    if (isAnswered || !question) return;
    setSelected(option);
    setScore((s) => ({
      correct: s.correct + (option === question.correctOption ? 1 : 0),
      total: s.total + 1
    }));
  }

  function handleNext() {
    if (pos + 1 >= order.length) {
      setFinished(true);
      return;
    }
    setPos((p) => p + 1);
    setSelected(null);
  }

  function handleRestart() {
    setStarted(false);
    setFinished(false);
  }

  if (!started) {
    return (
      <div className="app">
        <div className="card start-card">
          <h1>ワインエキスパート一次試験</h1>
          <p className="start-lead">直前対策 確かめ問題(4択・全{questionsData.length}問)</p>
          <p className="start-desc">
            幹(基礎)・枝(対比)・葉(数値・シノニム)の3レベルから出題します。回答するとその場で正誤判定と解説が表示され、続けて次の問題に進めます。
          </p>
          <button className="btn primary" onClick={handleStart}>
            開始する
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="app">
        <div className="card result-card">
          <h1>お疲れさまでした</h1>
          <p className="result-score">
            {score.correct} / {score.total} 問正解
          </p>
          <p className="result-rate">正答率 {Math.round((score.correct / score.total) * 100)}%</p>
          <button className="btn primary" onClick={handleRestart}>
            もう一度挑戦する
          </button>
        </div>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <div className="app">
      <header className="header">
        <span className="progress">
          第{pos + 1}問 / {order.length}問
        </span>
        <span className="score">
          正解 {score.correct} / {score.total}
        </span>
      </header>

      <div className="card">
        <div className="meta">
          <span className={`level-badge level-${question.level}`}>{question.level}</span>
          <span className="category">{question.category}</span>
        </div>

        <h2 className="question-text">{question.question}</h2>

        <div className="options">
          {options.map((opt, idx) => {
            const letter = LETTERS[idx];
            let cls = 'option';
            if (isAnswered) {
              if (opt === question.correctOption) cls += ' option-correct';
              else if (opt === selected) cls += ' option-wrong';
            }
            return (
              <button
                key={opt}
                className={cls}
                onClick={() => handleAnswer(opt)}
                disabled={isAnswered}
              >
                <span className="letter">{letter}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="explanation">
            <p className={`verdict ${isCorrect ? 'ok' : 'ng'}`}>
              {isCorrect ? '正解：〇' : '不正解：×'}
            </p>
            <p className="explanation-text">{question.explanation}</p>
            <button className="btn primary" onClick={handleNext}>
              {pos + 1 >= order.length ? '結果を見る' : '次の問題へ'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
