'use client';

import { useState } from "react";
import TicTacToeMenu from "./ttt menu";
import TrainingMenu from "./network training menu";

export default function MainMenu() {
    const [gameChoice, setGameChoice] = useState('');

    function chooseTicTacToe() {
        setGameChoice('TicTacToe');
    }

    function chooseTraining() {
        setGameChoice('Training');
    }

    return (
        <div>
            {
                gameChoice == '' ?
                    <button onClick={chooseTicTacToe} type="button">Play Tic Tac Toe?</button> :
                    null
            }
            {
                gameChoice == '' ?
                    <button onClick={chooseTraining} type="button">Train Networks</button> :
                    null
            }
            {gameChoice == 'TicTacToe' ? <TicTacToeMenu /> : null}
            {gameChoice == 'Training' ? <TrainingMenu /> : null}
        </div>
    );
}