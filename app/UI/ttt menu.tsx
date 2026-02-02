'use client';

import { useState } from "react";
import TicTacToeBoard from "./ttt board";

export default function TicTacToeMenu() {
    const [playerNumber, setPlayerNumber] = useState(0);
    const [humanPlayer, setHumanPlayer] = useState('');
    const [winner, setWinner] = useState('');
    const [illegalMove, setIllegalMove] = useState(false);

    function chooseOnePlayer() {
        setPlayerNumber(1);
    }

    function chooseTwoPlayer() {
        setPlayerNumber(2);
    }

    function chooseX() {
        setHumanPlayer('X');
    }
    function chooseO() {
        setHumanPlayer('O');
    }

    console.log("winner is " + winner);

    return (
        <div>
            <div>
                {
                    playerNumber == 0 ?
                        <button type="button" onClick={chooseOnePlayer}>One Player</button> :
                        null
                }
            </div>
            <div>
                {
                    playerNumber == 0 ?
                        <button type="button" onClick={chooseTwoPlayer}>Two Player</button> :
                        null
                }
            </div>
            <div>
                {
                    playerNumber == 1 && humanPlayer == '' ?
                        <button type="button" onClick={chooseX}>Play X</button> :
                        null
                }
            </div>
            <div>
                {
                    playerNumber == 1 && humanPlayer == '' ?
                        <button type="button" onClick={chooseO}>Play O</button> :
                        null
                }
            </div>
            <div>
                {
                    illegalMove == true ?
                        <p>{winner == 'X' ? 'O' : 'X'} made an illegal move</p> :
                        null
                }
            </div>
            <div>
                {
                    winner != '' ?
                        <p>{winner} Wins</p> :
                        null
                }
            </div>
            <div>
                {
                    playerNumber == 2 || (playerNumber == 1 && humanPlayer != '') ?
                        <TicTacToeBoard players={playerNumber} humanPlayer={humanPlayer}
                            setWinner={(symbol:string) => setWinner(symbol)} setIllegalMove={(trueFalse: boolean) => setIllegalMove(trueFalse)} /> :
                        null
                }
            </div>
        </div>
    );
}