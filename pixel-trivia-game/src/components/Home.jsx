import React, { useState } from 'react';

function Home({ onStart }) {
    const [playerId, setPlayerId] = useState('');

    const handleStart = () => {
        if (playerId.trim() === '') {
            alert('請輸入您的 ID 才能開始遊戲！');
            return;
        }
        onStart(playerId.trim());
    };

    return (
        <div className="pixel-panel">
            <h1>PIXEL TRIVIA</h1>
            <p style={{ textAlign: 'center', color: '#bdc3c7' }}>
                輸入你的 ID 挑戰關卡吧！
            </p>

            <div style={{ marginTop: '40px', marginBottom: '40px' }}>
                <input
                    type="text"
                    className="pixel-input"
                    placeholder="ENTER YOUR ID"
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                />
                <button className="pixel-btn full-width" onClick={handleStart}>
                    START GAME
                </button>
            </div>

            <p style={{ textAlign: 'center', fontSize: '10px', color: '#7f8c8d' }}>
                ※ 需連線至 Google Sheets 讀取題庫
            </p>
        </div>
    );
}

export default Home;
