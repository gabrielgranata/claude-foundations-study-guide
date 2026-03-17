import { useState, useEffect, useRef } from 'react';
import { DOMAINS, CONCEPTS } from '../data/knowledge.js';
import { getPracticeQuestionPrompt } from '../lib/prompts.js';
import { callClaude } from '../lib/api.js';

const PRESET_LENGTHS = [
  { count: 10, label: '10 questions', sublabel: '~15 min' },
  { count: 20, label: '20 questions', sublabel: '~30 min' },
  { count: 40, label: '40 questions', sublabel: '~60 min' },
];

// ── Config screen ─────────────────────────────────────────
function ExamConfig({ onStart }) {
  const [count, setCount] = useState(20);
  const [domainFilter, setDomainFilter] = useState([]);

  function toggleDomain(id) {
    setDomainFilter(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  }

  return (
    <div className="view" style={{ padding: 0 }}>
      <div className="view-header">
        <span className="view-title"><span>PRACTICE</span> EXAM</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
          Scenario-based · Claude-generated
        </span>
      </div>

      <div style={{ padding: '24px', maxWidth: '560px' }}>
        {/* What this is */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 18px', marginBottom: '24px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Questions are generated on-the-fly by Claude. Each question presents a real architectural scenario with four choices. After submitting, you'll see explanations for why each answer is right or wrong.
          <br /><br />
          <span style={{ color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
            ⚠ Questions vary each session — this is not a fixed question bank.
          </span>
        </div>

        {/* Question count */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Number of questions
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {PRESET_LENGTHS.map(p => (
              <div
                key={p.count}
                onClick={() => setCount(p.count)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: count === p.count ? 'var(--accent-gold-dim)' : 'var(--bg-panel)',
                  border: `1px solid ${count === p.count ? 'var(--accent-gold)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600, color: count === p.count ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                  {p.count}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>{p.sublabel}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Domain filter */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Focus domains <span style={{ color: 'var(--text-muted)', fontWeight: 400, letterSpacing: 0, textTransform: 'none' }}>(leave empty for all)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {DOMAINS.map(d => (
              <div
                key={d.id}
                onClick={() => toggleDomain(d.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  background: domainFilter.includes(d.id) ? 'var(--accent-blue-dim)' : 'var(--bg-panel)',
                  border: `1px solid ${domainFilter.includes(d.id) ? 'var(--accent-blue)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: '14px', height: '14px', border: `1px solid ${domainFilter.includes(d.id) ? 'var(--accent-blue)' : 'var(--border)'}`, borderRadius: '2px', background: domainFilter.includes(d.id) ? 'var(--accent-blue)' : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {domainFilter.includes(d.id) && <span style={{ color: '#fff', fontSize: '10px', lineHeight: 1 }}>✓</span>}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-gold)', width: '20px' }}>D{d.id}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', flex: 1 }}>{d.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>{d.weight}%</span>
              </div>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', height: '40px', fontSize: '12px' }}
          onClick={() => onStart({ count, domainFilter })}
        >
          Begin Practice Exam →
        </button>
      </div>
    </div>
  );
}

// ── Individual question ───────────────────────────────────
function QuestionCard({ question, index, total, onAnswer, answered, selectedChoice }) {
  const choices = ['A', 'B', 'C', 'D'];
  const isCorrect = answered && selectedChoice === question.correct;
  const isWrong = answered && selectedChoice !== question.correct;

  return (
    <div>
      {/* Question */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Q{index + 1} of {total}
          {question.concept && (
            <span style={{ color: 'var(--accent-gold)', marginLeft: '8px' }}>· {question.concept}</span>
          )}
          {question.domain && (
            <span style={{ color: 'var(--accent-blue)', marginLeft: '8px' }}>· D{question.domain}</span>
          )}
        </div>
        <div style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
          {question.question}
        </div>
      </div>

      {/* Choices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {choices.map(letter => {
          const text = question.choices[letter];
          if (!text) return null;
          const isSelected = selectedChoice === letter;
          const isRight = answered && letter === question.correct;
          const isWrongSelected = answered && isSelected && letter !== question.correct;

          let bg = 'var(--bg-panel)';
          let border = 'var(--border)';
          let color = 'var(--text-secondary)';

          if (isRight) { bg = 'var(--accent-teal-dim)'; border = 'var(--accent-teal)'; color = 'var(--accent-teal)'; }
          else if (isWrongSelected) { bg = 'var(--accent-orange-dim)'; border = 'var(--accent-orange)'; color = 'var(--accent-orange)'; }
          else if (isSelected && !answered) { bg = 'var(--accent-gold-dim)'; border = 'var(--accent-gold)'; color = 'var(--accent-gold)'; }

          return (
            <div
              key={letter}
              onClick={() => !answered && onAnswer(letter)}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '12px 14px',
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 'var(--radius-md)',
                cursor: answered ? 'default' : 'pointer',
                transition: 'all var(--transition)',
              }}
              onMouseEnter={e => { if (!answered) e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onMouseLeave={e => { if (!answered && !isSelected) e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color, flexShrink: 0, width: '20px' }}>
                {letter}.
                {answered && isRight && ' ✓'}
                {answered && isWrongSelected && ' ✗'}
              </span>
              <span style={{ fontSize: '14px', color: answered ? color : 'var(--text-primary)', lineHeight: '1.5' }}>
                {text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Explanation (shown after answering) */}
      {answered && (
        <div style={{ background: isCorrect ? 'var(--accent-teal-dim)' : 'var(--accent-orange-dim)', border: `1px solid ${isCorrect ? 'var(--accent-teal)' : 'var(--accent-orange)'}`, borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: isCorrect ? 'var(--accent-teal)' : 'var(--accent-orange)', marginBottom: '6px', letterSpacing: '0.08em' }}>
            {isCorrect ? 'CORRECT' : `INCORRECT — Correct answer: ${question.correct}`}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6', marginBottom: question.distractors ? '10px' : 0 }}>
            {question.explanation}
          </div>
          {question.distractors && selectedChoice !== question.correct && (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${isCorrect ? 'rgba(106,172,184,0.2)' : 'rgba(217,119,86,0.2)'}` }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                WHY {selectedChoice} IS WRONG
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {question.distractors[selectedChoice]}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Results screen ────────────────────────────────────────
function ExamResults({ questions, answers, onRestart, onHome, elapsedSeconds }) {
  const correct = questions.filter((q, i) => answers[i] === q.correct).length;
  const total = questions.length;
  const pct = Math.round((correct / total) * 100);
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;

  const byDomain = {};
  questions.forEach((q, i) => {
    const d = q.domain || 0;
    if (!byDomain[d]) byDomain[d] = { correct: 0, total: 0 };
    byDomain[d].total++;
    if (answers[i] === q.correct) byDomain[d].correct++;
  });

  return (
    <div className="view" style={{ padding: '24px', overflowY: 'auto' }}>
      <div style={{ maxWidth: '600px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
          Exam Complete
        </div>

        {/* Score */}
        <div className="stats-row" style={{ marginBottom: '20px' }}>
          <div className="stat-cell">
            <div className="stat-value" style={{ color: pct >= 80 ? 'var(--accent-green)' : pct >= 65 ? 'var(--accent-gold)' : 'var(--accent-orange)', fontSize: '32px' }}>
              {pct}%
            </div>
            <div className="stat-label">Score</div>
          </div>
          <div className="stat-cell">
            <div className="stat-value green">{correct}</div>
            <div className="stat-label">Correct</div>
          </div>
          <div className="stat-cell">
            <div className="stat-value orange">{total - correct}</div>
            <div className="stat-label">Incorrect</div>
          </div>
          <div className="stat-cell">
            <div className="stat-value" style={{ color: 'var(--text-primary)' }}>{mins}:{String(secs).padStart(2, '0')}</div>
            <div className="stat-label">Time</div>
          </div>
        </div>

        {/* By domain */}
        {Object.keys(byDomain).length > 1 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
              By domain
            </div>
            {Object.entries(byDomain).sort().map(([d, stats]) => {
              const domain = DOMAINS.find(dom => dom.id === parseInt(d));
              const dpct = Math.round((stats.correct / stats.total) * 100);
              return (
                <div key={d} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-gold)', width: '24px' }}>D{d}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1 }}>{domain?.name || 'Unknown'}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: dpct >= 80 ? 'var(--accent-green)' : dpct >= 65 ? 'var(--accent-gold)' : 'var(--accent-orange)' }}>
                    {stats.correct}/{stats.total} ({dpct}%)
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Question review */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Question review
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {questions.map((q, i) => {
              const isRight = answers[i] === q.correct;
              return (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-panel)', border: `1px solid ${isRight ? 'var(--border)' : 'var(--accent-orange)'}`, borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: isRight ? 'var(--accent-teal)' : 'var(--accent-orange)', flexShrink: 0, marginTop: '2px' }}>
                      {isRight ? '✓' : '✗'} Q{i + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '4px' }}>
                        {q.question.length > 120 ? q.question.slice(0, 120) + '...' : q.question}
                      </div>
                      {!isRight && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                          You: {answers[i]} · Correct: {q.correct}
                        </div>
                      )}
                    </div>
                    {q.concept && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent-gold)', flexShrink: 0 }}>{q.concept}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={onHome}>Dashboard</button>
          <button className="btn btn-primary" onClick={onRestart}>New exam →</button>
        </div>
      </div>
    </div>
  );
}

// ── Main PracticeExam view ────────────────────────────────
export function PracticeExam({ state, dispatch, navigate }) {
  const [phase, setPhase] = useState('config'); // config | exam | results
  const [config, setConfig] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const askedTexts = useRef([]);

  useEffect(() => {
    if (phase === 'exam') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  async function generateQuestion(cfg) {
    const systemPrompt = getPracticeQuestionPrompt(
      cfg.domainFilter,
      [],
      askedTexts.current
    );
    try {
      const raw = await callClaude({
        systemPrompt,
        messages: [{ role: 'user', content: 'Generate the question.' }],
        maxTokens: 600,
      });

      // Extract JSON — handle markdown code blocks
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || raw.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : raw;
      const parsed = JSON.parse(jsonStr.trim());
      askedTexts.current.push(parsed.question || '');
      return parsed;
    } catch (e) {
      throw new Error(`Failed to parse question: ${e.message}`);
    }
  }

  async function handleStart(cfg) {
    setConfig(cfg);
    setPhase('exam');
    setStartTime(Date.now());
    setLoadingQuestion(true);
    setError('');
    askedTexts.current = [];

    try {
      const q = await generateQuestion(cfg);
      if (q) {
        setQuestions([q]);
        setCurrentIdx(0);
      }
    } catch (e) {
      setError(e.message);
      setPhase('config');
    } finally {
      setLoadingQuestion(false);
    }
  }

  async function handleAnswer(choice) {
    setSelectedChoice(choice);
  }

  async function handleNext() {
    if (selectedChoice === null) return;

    const newAnswers = { ...answers, [currentIdx]: selectedChoice };
    setAnswers(newAnswers);

    const nextIdx = currentIdx + 1;

    if (nextIdx >= config.count) {
      // Exam complete
      clearInterval(timerRef.current);
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
      dispatch({
        type: 'ADD_EXAM_RESULT',
        result: {
          questions,
          answers: newAnswers,
          score: questions.filter((q, i) => newAnswers[i] === q.correct).length / questions.length,
          completedAt: new Date().toISOString(),
          domainFilter: config.domainFilter,
        },
      });
      setPhase('results');
      return;
    }

    // Load next question
    setCurrentIdx(nextIdx);
    setSelectedChoice(null);

    if (nextIdx >= questions.length) {
      setLoadingQuestion(true);
      setError('');
      try {
        const q = await generateQuestion(config);
        if (q) setQuestions(prev => [...prev, q]);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoadingQuestion(false);
      }
    }
  }

  if (phase === 'config') {
    return <ExamConfig onStart={handleStart} />;
  }

  if (phase === 'results') {
    return (
      <ExamResults
        questions={questions}
        answers={answers}
        elapsedSeconds={elapsed}
        onRestart={() => { setPhase('config'); setQuestions([]); setAnswers({}); setCurrentIdx(0); setSelectedChoice(null); }}
        onHome={() => navigate('dashboard')}
      />
    );
  }

  // Exam phase
  const currentQuestion = questions[currentIdx];
  const hasAnswered = answers[currentIdx] !== undefined;
  const previewAnswered = selectedChoice !== null;
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Exam header */}
      <div className="session-header">
        <div className="session-header-left">
          <span className="session-header-type" style={{ color: 'var(--accent-blue)', background: 'var(--accent-blue-dim)' }}>
            PRACTICE EXAM
          </span>
          <span className="session-header-title">
            Q{currentIdx + 1} / {config?.count}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Correct/wrong so far */}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-teal)' }}>
            {Object.values(answers).filter((a, i) => a === questions[i]?.correct).length} ✓
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-orange)' }}>
            {Object.values(answers).filter((a, i) => a !== questions[i]?.correct).length} ✗
          </span>
          {/* Timer */}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
            {mins}:{String(secs).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '3px', background: 'var(--bg-panel)', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${((currentIdx) / (config?.count || 1)) * 100}%`, background: 'var(--accent-blue)', transition: 'width 0.3s ease' }} />
      </div>

      {/* Question content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '680px' }}>
          {loadingQuestion && !currentQuestion && (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ height: '2px', background: 'linear-gradient(to right, var(--accent-blue), transparent)', borderRadius: '1px', animation: 'pulse 1.4s ease-in-out infinite', width: '100px', margin: '0 auto' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px' }}>
                Generating question...
              </div>
            </div>
          )}

          {error && <div className="error-bar" style={{ marginBottom: '16px' }}>{error}</div>}

          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              index={currentIdx}
              total={config?.count}
              onAnswer={setSelectedChoice}
              answered={hasAnswered}
              selectedChoice={hasAnswered ? answers[currentIdx] : selectedChoice}
            />
          )}
        </div>
      </div>

      {/* Footer actions */}
      {currentQuestion && (
        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-panel)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {!hasAnswered ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                if (selectedChoice) {
                  setAnswers(prev => ({ ...prev, [currentIdx]: selectedChoice }));
                }
              }}
              disabled={!selectedChoice}
            >
              Submit answer
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={loadingQuestion}
            >
              {loadingQuestion ? '···' : currentIdx + 1 >= config?.count ? 'Finish exam' : 'Next question →'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
