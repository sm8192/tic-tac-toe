'use client';

import { useState } from "react";
import TicTacToeBoard from "./ttt board";

export default function TicTacToeMenu() {
    const [playerNumber, setPlayerNumber] = useState(0);

    function chooseOnePlayer () {
        setPlayerNumber(1);
    }

    function chooseTwoPlayer () {
        setPlayerNumber(2);
    }

    return (
        <div>
            {
                playerNumber == 0 ?
                    <button type="button" onClick={chooseOnePlayer}>One Player</button> :
                    null
            }
            {
                playerNumber == 0 ?
                    <button type="button" onClick={chooseTwoPlayer}>Two Player</button> :
                    null
            }
            {
                playerNumber != 0 ?
                <TicTacToeBoard players={playerNumber}/> : 
                null
            }
        </div>
    );
}