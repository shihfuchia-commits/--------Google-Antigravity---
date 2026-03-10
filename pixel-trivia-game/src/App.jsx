import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import Game from './components/Game';
import Result from './components/Result';

// 定義畫面狀態
const SCREEN_HOME = 'HOME';
const SCREEN_GAME = 'GAME';
const SCREEN_RESULT = 'RESULT';
const SCREEN_LOADING = 'LOADING';
const SCREEN_ERROR = 'ERROR';

function App() {
  const [currentScreen, setCurrentScreen] = useState(SCREEN_HOME);
  const [playerId, setPlayerId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const scriptUrl = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;
  const questionCount = parseInt(import.meta.env.VITE_QUESTION_COUNT || '5');

  // 開始遊戲（從 GAS 撈取題目）
  const handleStartGame = async (id) => {
    setPlayerId(id);
    setCurrentScreen(SCREEN_LOADING);
    setAnswers([]);

    try {
      // 根據 GAS 的設計，用 GET 帶參數 count
      // 注意：GAS GET 有可能會回傳 CORS Redirect，直接 fetch 會遇到問題
      // 建議方法：Google Apps Script 的 GET 若沒有特殊 header 會回傳 JSON
      const url = `${scriptUrl}?count=${questionCount}`;
      const response = await fetch(url, { redirect: 'follow' });
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error("題庫沒有任何題目！");
      }

      setQuestions(data.questions);
      setCurrentScreen(SCREEN_GAME);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || '讀取題目失敗，請確認 API URL 與題庫資料。');
      setCurrentScreen(SCREEN_ERROR);
    }
  };

  const handleGameComplete = (playerAnswers) => {
    setAnswers(playerAnswers);
    setCurrentScreen(SCREEN_RESULT);
  };

  const handleRestart = () => {
    setCurrentScreen(SCREEN_HOME);
    setPlayerId('');
    setQuestions([]);
    setAnswers([]);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case SCREEN_HOME:
        return <Home onStart={handleStartGame} />;
      case SCREEN_LOADING:
        return (
          <div className="pixel-panel">
            <h2>SEARCHING DATABASE...</h2>
            <div className="loading" style={{ margin: '40px 0' }}>LOADING QUESTIONS...</div>
          </div>
        );
      case SCREEN_ERROR:
        return (
          <div className="pixel-panel">
            <h2 style={{ color: '#e74c3c' }}>ERROR</h2>
            <p>{errorMsg}</p>
            <button className="pixel-btn full-width mt-4" onClick={handleRestart}>
              RETURN TO TITLE
            </button>
          </div>
        );
      case SCREEN_GAME:
        return (
          <Game
            playerId={playerId}
            questions={questions}
            onComplete={handleGameComplete}
          />
        );
      case SCREEN_RESULT:
        return (
          <Result
            playerId={playerId}
            answers={answers}
            onRestart={handleRestart}
          />
        );
      default:
        return <Home onStart={handleStartGame} />;
    }
  };

  return (
    <>
      {renderScreen()}
    </>
  );
}

export default App;
