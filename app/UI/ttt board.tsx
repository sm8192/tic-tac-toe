'use client';

import { useState } from "react";
import Space from "./ttt space";

interface boardProps {
    players: number;
    humanPlayer: string;
    setWinner: Function;
    setIllegalMove: Function;
}

export default function TicTacToeBoard(props: boardProps) {

    const setWinner = (winner: string) => {
        props.setWinner(winner);
    }

    const setIllegalMove = (illegalMoveMade: boolean) => {
        props.setIllegalMove(illegalMoveMade);
    }

    const [boardState, setBoardState] = useState([
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ]);

    const [gameOver, setGameOver] = useState(false);

    const [activePlayer, setActivePlayer] = useState('X');

    const toggleSpace = (row: number, column: number) => {
        if (!gameOver) {

            if (boardState[row][column] == '') {

                let newState = [];
                newState.push(boardState[0]);
                newState.push(boardState[1]);
                newState.push(boardState[2]);
                newState[row][column] = activePlayer;
                setBoardState(newState);

                setActivePlayer(getInactivePlayer());
            } else {
                setGameOver(true);
                setIllegalMove(true);
                setWinner(getInactivePlayer());
            }

            if (props.players == 1 && props.humanPlayer != activePlayer && !gameOver) {
                takeCPUTurn();
            }
        }
    }

    const getInactivePlayer = () => {
        return activePlayer == 'X' ? 'O' : 'X';
    }

    const takeCPUTurn = () => {
        let cpuMove = generateCPUMove();

        toggleSpace(cpuMove.row, cpuMove.column);
    }

    const generateCPUMove = () => {
        let row = calculateRow();
        let column = calculateColumn();

        return {
            row: row,
            column: column
        };
    }

    const calculateRow = () => {
        let rowFirstBit = getRandomBit();

        if (rowFirstBit) {
            let rowSecondBit = getRandomBit();
            if (rowSecondBit) {
                return 0;
            } else {
                return 1;
            }
        } else {
            return 2;
        }
    }

    const calculateColumn = () => {
        let columnFirstBit = getRandomBit();
        if (columnFirstBit) {
            let columnSecondBit = getRandomBit();
            if (columnSecondBit) {
                return 0;
            } else {
                return 1;
            }
        } else {
            return 2;
        }
    }

    const getRandomBit = () => {
        if (Math.floor(Math.random() * (2))) {
            return true;
        } else {
            return false;
        }
    }

    return (
        <div>
            <table>
                <tbody>
                    <tr>
                        <td><Space symbol={boardState[0][0]} toggleSpace={() => toggleSpace(0, 0)} /></td>
                        <td><Space symbol={boardState[0][1]} toggleSpace={() => toggleSpace(0, 1)} /></td>
                        <td><Space symbol={boardState[0][2]} toggleSpace={() => toggleSpace(0, 2)} /></td>
                    </tr>
                    <tr>
                        <td><Space symbol={boardState[1][0]} toggleSpace={() => toggleSpace(1, 0)} /></td>
                        <td><Space symbol={boardState[1][1]} toggleSpace={() => toggleSpace(1, 1)} /></td>
                        <td><Space symbol={boardState[1][2]} toggleSpace={() => toggleSpace(1, 2)} /></td>
                    </tr>
                    <tr>
                        <td><Space symbol={boardState[2][0]} toggleSpace={() => toggleSpace(2, 0)} /></td>
                        <td><Space symbol={boardState[2][1]} toggleSpace={() => toggleSpace(2, 1)} /></td>
                        <td><Space symbol={boardState[2][2]} toggleSpace={() => toggleSpace(2, 2)} /></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}