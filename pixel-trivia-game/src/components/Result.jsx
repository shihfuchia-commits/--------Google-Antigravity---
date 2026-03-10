import React, { useState, useEffect, useRef } from 'react';

function Result({ playerId, answers, onRestart }) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReview, setShowReview] = useState(false);
    const hasSubmitted = useRef(false);

    const scriptUrl = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;
    const passThreshold = parseInt(import.meta.env.VITE_PASS_THRESHOLD || '3');

    useEffect(() => {
        if (hasSubmitted.current) return;
        hasSubmitted.current = true;

        const submitResult = async () => {
            try {
                const params = new URLSearchParams({
                    action: 'submit',
                    id: playerId,
                    answers: JSON.stringify(answers),
                    passThreshold: passThreshold
                });

                const url = `${scriptUrl}?${params.toString()}`;

                const response = await fetch(url, {
                    method: 'GET'
                });

                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error);
                }

                setResult(data);
            } catch (err) {
                console.error('Submit error:', err);
                setError(`無法結算成績: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        submitResult();
    }, [playerId, answers, scriptUrl]);

    if (loading) {
        return (
            <div className="pixel-panel">
                <h2>CALCULATING...</h2>
                <div className="loading" style={{ margin: '40px 0' }}>LOADING DATA...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pixel-panel">
                <h2 style={{ color: '#e74c3c' }}>ERROR</h2>
                <p>{error}</p>
                <button className="pixel-btn full-width mt-4" onClick={onRestart}>
                    RETURN TO TITLE
                </button>
            </div>
        );
    }

    const isPassed = result.score >= passThreshold;

    const statusText = isPassed ? 'MISSION COMPLETE' : 'MISSION FAILED';
    const statusColor = isPassed ? 'var(--success-color)' : 'var(--secondary-color)';

    return (
        <div className="pixel-panel">
            <h2 style={{ color: statusColor, fontSize: '24px', marginBottom: '30px' }}>
                {statusText}
            </h2>

            <div className="result-score" style={{ fontSize: '20px', marginBottom: '10px', color: '#fff', textShadow: 'none' }}>
                SCORE: {result.score}
            </div>

            <div style={{ textAlign: 'center', fontSize: '16px', marginBottom: '40px', color: '#bdc3c7' }}>
                CORRECT: {result.score} / {result.total}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    className="pixel-btn full-width secondary"
                    onClick={() => setShowReview(!showReview)}
                >
                    {showReview ? 'HIDE ERRORS' : 'REVIEW ERRORS'}
                </button>
                <button className="pixel-btn full-width" onClick={onRestart}>
                    TRY AGAIN
                </button>
            </div>

            {showReview && result.evaluations && (
                <div style={{ marginTop: '30px', textAlign: 'left' }}>
                    <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>檢討錯題</h3>
                    {result.evaluations.length === 0 ? (
                        <p style={{ color: 'var(--success-color)', textAlign: 'center', marginTop: '20px' }}>
                            太神啦！你全答對了！
                        </p>
                    ) : (
                        result.evaluations.map((item, idx) => (
                            <div key={idx} style={{
                                backgroundColor: '#1A1A1A',
                                padding: '16px',
                                borderRadius: '8px',
                                marginTop: '16px',
                                border: '1px solid var(--border-color)'
                            }}>
                                <div style={{ fontSize: '14px', color: '#8E8E93', marginBottom: '8px' }}>ID: {item.id}</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#F0F0F0' }}>
                                    {item.question}
                                </div>
                                <div style={{ color: 'var(--secondary-color)', fontSize: '14px', marginBottom: '4px' }}>
                                    ❌ 你的答案：{item.userAnswer}
                                </div>
                                <div style={{ color: 'var(--success-color)', fontSize: '14px' }}>
                                    ✅ 正確答案：{item.correctAnswer} {item.correctOptionText ? `(${item.correctOptionText})` : ''}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default Result;
