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

    const countSymbol = (symbol: string) => {
        let symbolCount = 0;

        boardState.forEach((thisRow) => {
            thisRow.forEach((thisSpace) => {
                if (thisSpace == symbol) {
                    symbolCount++;
                }
            })
        })

        return symbolCount;
    }

    const determineActivePlayer = () => {
        let numberOfX = countSymbol('X');
        let numberOfO = countSymbol('O');

        if (numberOfX > numberOfO) {
            return 'O';
        } else {
            return 'X';
        }
    }

    const activePlayer = determineActivePlayer();

    const toggleSpace = (row: number, column: number) => {
        if (!gameOver) {
            let illegalMoveFound = false;
            if (boardState[row][column] == '') {

                let newState = [];
                newState.push(boardState[0]);
                newState.push(boardState[1]);
                newState.push(boardState[2]);
                newState[row][column] = activePlayer;
                setBoardState(newState);

            } else {
                illegalMoveFound = true;
                setGameOver(true);
                setIllegalMove(true);
                setWinner(getOtherPlayer(activePlayer));
            }
            if (!illegalMoveFound && checkForWin()) {
                setGameOver(true);
                setWinner(activePlayer);
            }
        }
    }

    const getOtherPlayer = (player: string) => {
        if (player == 'X') {
            return 'O';
        } else {
            return 'X';
        }
    }

    const checkForWin = () => {
        let win = false;
        for (let i = 0; i < 3; i++) {
            win = checkRowForWin(i);
            if (win) {
                break;
            }
        }
        if (win) {
            return win;
        } else {
            for (let i = 0; i < 3; i++) {
                win = checkColumnForWin(i);
                if (win) {
                    break;
                }
            }
            if (win) {
                return win;
            } else {
                win = checkDiagonalsForWin();
            }
        }

        return win;
    }

    const checkRowForWin = (row: number) => {
        if (boardState[row][0] &&
            boardState[row][0] == boardState[row][1] &&
            boardState[row][0] == boardState[row][2]) {
            return true;
        }
        return false;
    }

    const checkColumnForWin = (column: number) => {
        if (boardState[0][column] &&
            boardState[0][column] == boardState[1][column] &&
            boardState[0][column] == boardState[2][column]) {
            return true;
        }
        return false;
    }

    const checkDiagonalsForWin = () => {
        if (boardState[0][0] &&
            boardState[0][0] == boardState[1][1] &&
            boardState[0][0] == boardState[2][2]
        ) {
            return true;
        } else if (boardState[0][2] &&
            boardState[0][2] == boardState[1][1] &&
            boardState[0][2] == boardState[2][0]
        ) {
            return true;
        } else {
            return false;
        }
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

    if (props.players == 0 || (props.players == 1 && activePlayer != props.humanPlayer)) {
        takeCPUTurn();
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