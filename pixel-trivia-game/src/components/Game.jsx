import React, { useState, useEffect } from 'react';

function Game({ playerId, questions, onComplete }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [isRenderingNext, setIsRenderingNext] = useState(false);

    const currentQ = questions[currentIndex];

    // 為了讓每次題目有不同的關主，我們用題號當作 seed 產生圖片
    const bossImageUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${currentQ.id}`;

    const handleOptionClick = (optionKey) => {
        // 儲存答案
        const newAnswers = [...answers, { id: currentQ.id, answer: optionKey }];
        setAnswers(newAnswers);

        // 切換下一題
        if (currentIndex + 1 < questions.length) {
            setIsRenderingNext(true);
            setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
                setIsRenderingNext(false);
            }, 300); // 簡單的轉場延遲
        } else {
            // 完成所有題目
            onComplete(newAnswers);
        }
    };

    return (
        <div className="pixel-panel game-container">
            <div className="status-bar">
                <span>STAGE {currentIndex + 1}/{questions.length}</span>
                <span>ID: {playerId}</span>
            </div>

            <div className="boss-container">
                {!isRenderingNext && (
                    <img
                        src={bossImageUrl}
                        alt="Level Boss"
                        className="boss-image"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                )}
            </div>

            <div className="question-text">
                {currentQ.question}
            </div>

            <div className="options-grid">
                {['A', 'B', 'C', 'D'].map((key) => {
                    // 只顯示有內容的選項
                    if (!currentQ.options[key]) return null;
                    return (
                        <button
                            key={key}
                            className="pixel-btn"
                            onClick={() => handleOptionClick(key)}
                            disabled={isRenderingNext}
                        >
                            <span style={{ color: '#f1c40f', marginRight: '8px' }}>{key}.</span>
                            {currentQ.options[key]}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default Game;
