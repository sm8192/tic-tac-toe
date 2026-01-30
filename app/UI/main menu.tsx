'use client';

import { useState } from "react";
import TicTacToeMenu from "./ttt menu";

export default function MainMenu() {
    const [gameChoice, setGameChoice] = useState('');

    function chooseTicTacToe() {
        setGameChoice('TicTacToe');
    }


    return (
        <div>
            {gameChoice == '' ?
                <button onClick={chooseTicTacToe} type="button">Play Tic Tac Toe?</button> :
                null}
            {gameChoice == 'TicTacToe' ? <TicTacToeMenu /> : null}
        </div>
    );
}