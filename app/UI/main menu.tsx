'use client';

import { useState } from "react";
import TicTacToeMenu from "./ttt menu";
import TrainingMenu from "./network training menu";
import BasicBoard from "./basic board";
import BasicTrainingMenu from "./basic training";

export default function MainMenu() {
    const [gameChoice, setGameChoice] = useState('');

    function chooseTicTacToe() {
        setGameChoice('TicTacToe');
    }

    function chooseTraining() {
        setGameChoice('Training');
    }

    function chooseBasicPlay() {
        setGameChoice('PlayBasic');
    }

    function chooseBasicTraining() {
        setGameChoice('TrainBasic');
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
            {
                gameChoice == '' ?
                    <button onClick={chooseBasicPlay} type="button">Play basic game</button> :
                    null
            }
            {
                gameChoice == '' ?
                    <button onClick={chooseBasicTraining} type="button">Train basic game</button> :
                    null
            }
            {gameChoice == 'TicTacToe' ? <TicTacToeMenu /> : null}
            {gameChoice == 'Training' ? <TrainingMenu /> : null}
            {gameChoice == 'PlayBasic' ? <BasicBoard /> : null}
            {gameChoice == 'TrainBasic' ? <BasicTrainingMenu /> : null}
        </div>
    );
}