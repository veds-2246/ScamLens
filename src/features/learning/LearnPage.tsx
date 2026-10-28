"use client";

import { useState } from "react";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { quizQuestions } from "@/data/quizQuestions";

export default function LearnPage() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = quizQuestions[questionIndex];
  const hasAnswered = selectedOption !== null;
  const isCorrect = selectedOption === question.correctOption;

  function chooseOption(optionIndex: number) {
    if (hasAnswered) return;
    setSelectedOption(optionIndex);
    if (optionIndex === question.correctOption) setScore((current) => current + 1);
  }

  function continueQuiz() {
    if (!hasAnswered) return;
    if (questionIndex === quizQuestions.length - 1) {
      setFinished(true);
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelectedOption(null);
  }

  function restartQuiz() {
    setQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setFinished(false);
  }

  return (
    <div className="view-stack">
      <div className="page-intro">
        <div>
          <p className="eyebrow">Learning studio / 02</p>
          <h1>Build your scam-spotting instincts.</h1>
          <p className="intro-copy">
            Learn the patterns behind common scams, then test yourself with realistic scenarios.
          </p>
        </div>
        <span className="tech-label">LESSONS / INTERACTIVE</span>
      </div>

      <div className="dashboard-grid learning-grid">
        <Card className="lesson-card">
          <span className="lesson-number" aria-hidden="true">01</span>
          <p className="eyebrow">Core concept</p>
          <h2>Slow down the story.</h2>
          <p className="body-copy">
            Scams often combine a believable story with a reason you must act immediately.
            Pressure can make a risky request feel routine. Give yourself time to verify it.
          </p>
          <div className="lesson-points">
            <div><span className="lesson-point-icon" aria-hidden="true">01</span><p><strong>Pause</strong><span>Urgency is a reason to slow down, not rush.</span></p></div>
            <div><span className="lesson-point-icon" aria-hidden="true">02</span><p><strong>Verify</strong><span>Use a separate, trusted way to contact the organisation or person.</span></p></div>
            <div><span className="lesson-point-icon" aria-hidden="true">03</span><p><strong>Protect</strong><span>Never share passwords, OTPs, PINs or recovery codes.</span></p></div>
          </div>
          <div className="lesson-footer">
            <Badge tone="teal">Core habits</Badge>
            <span className="supporting-text">2 min read</span>
          </div>
        </Card>

        <Card className="quiz-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Knowledge check</p>
              <h2>Scam signal challenge</h2>
            </div>
            <Badge tone="neutral">{quizQuestions.length} questions</Badge>
          </div>

          {finished ? (
            <div className="quiz-complete" role="status" aria-live="polite">
              <span className="quiz-complete-icon" aria-hidden="true">{score === quizQuestions.length ? "✦" : "✓"}</span>
              <p className="eyebrow">Challenge complete</p>
              <h3>{score === quizQuestions.length ? "Perfect signal spotting!" : score >= 3 ? "Strong instincts. Keep them sharp." : "Good practice. Keep learning."}</h3>
              <p className="quiz-final-score"><strong>{score}</strong><span> / {quizQuestions.length} correct</span></p>
              <p className="supporting-text">
                {score === quizQuestions.length
                  ? "You caught every signal in this round. Keep verifying unexpected requests in real life."
                  : "Scam tactics get easier to recognise with practice. Review the explanations and try again."}
              </p>
              <Button type="button" onClick={restartQuiz}>Try again</Button>
            </div>
          ) : (
            <div className="quiz-content">
              <div className="quiz-progress-row">
                <span className="supporting-text">Question {questionIndex + 1} of {quizQuestions.length}</span>
                <span className="quiz-score">Score: {score}</span>
              </div>
              <progress
                className="quiz-progress"
                value={questionIndex + (hasAnswered ? 1 : 0)}
                max={quizQuestions.length}
                aria-label="Quiz progress"
              />
              <h3 className="quiz-question">{question.prompt}</h3>
              <div className="quiz-options" role="group" aria-label="Answer choices">
                {question.options.map((option, optionIndex) => {
                  const isSelected = selectedOption === optionIndex;
                  const isAnswer = optionIndex === question.correctOption;
                  const stateClass = hasAnswered && isAnswer
                    ? " is-correct"
                    : hasAnswered && isSelected && !isCorrect
                      ? " is-incorrect"
                      : "";
                  return (
                    <button
                      className={`quiz-option${stateClass}${isSelected ? " is-selected" : ""}`}
                      key={option}
                      type="button"
                      onClick={() => chooseOption(optionIndex)}
                      disabled={hasAnswered}
                      aria-pressed={isSelected}
                    >
                      <span className="quiz-option-letter">{String.fromCharCode(65 + optionIndex)}</span>
                      <span>{option}</span>
                      {hasAnswered && isAnswer ? <span className="quiz-option-mark" aria-hidden="true">✓</span> : null}
                    </button>
                  );
                })}
              </div>
              {hasAnswered ? (
                <div className={`quiz-feedback ${isCorrect ? "is-correct" : "is-incorrect"}`} role="status" aria-live="polite">
                  <strong>{isCorrect ? "Correct. Nice catch!" : "Not quite. Here's the signal."}</strong>
                  <p>{question.explanation}</p>
                  <p><strong>Safer move:</strong> {question.takeaway}</p>
                </div>
              ) : (
                <p className="quiz-hint">Choose the safest response. You’ll see an explanation after answering.</p>
              )}
              <div className="quiz-footer">
                <span className="supporting-text">No timer. Take your time.</span>
                <Button type="button" onClick={continueQuiz} disabled={!hasAnswered}>
                  {questionIndex === quizQuestions.length - 1 ? "See results" : "Next question"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
