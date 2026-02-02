'use client';

import { useState } from "react";
import Space from "./ttt space";

interface boardProps {
    players: number;
    humanPlayer: string;
    winner: string;
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

    const playerMove = (row: number, column: number) => {
        if (props.winner == '') {

            let tempBoard: string[][] = [];
            boardState.forEach((thisRow) => {
                tempBoard.push(thisRow)
            })

            if (tempBoard[row][column] != '') {
                setIllegalMove(true);
                setWinner(getOtherPlayer(activePlayer));
                return;
            }

            tempBoard[row][column] = activePlayer;
            if (checkForWin(tempBoard)) {
                setBoardState(tempBoard);
                setWinner(activePlayer);
                return;
            }

            if (props.players == 1) {
                let cpuMove = generateCPUMove();

                if (tempBoard[cpuMove.row][cpuMove.column] != '') {
                    setIllegalMove(true);
                    setWinner(activePlayer);
                    return;
                }

                tempBoard[cpuMove.row][cpuMove.column] = getOtherPlayer(activePlayer);
                if (checkForWin(tempBoard)) {
                    setBoardState(tempBoard);
                    setWinner(getOtherPlayer(activePlayer));
                    return;
                }
            }
            setBoardState(tempBoard);
        }
    }

    const getOtherPlayer = (player: string) => {
        if (player == 'X') {
            return 'O';
        } else {
            return 'X';
        }
    }

    const checkForWin = (board: string[][]) => {
        let win = false;
        for (let i = 0; i < 3; i++) {
            win = checkRowForWin(board, i);
            if (win) {
                break;
            }
        }
        if (win) {
            return win;
        } else {
            for (let i = 0; i < 3; i++) {
                win = checkColumnForWin(board, i);
                if (win) {
                    break;
                }
            }
            if (win) {
                return win;
            } else {
                win = checkDiagonalsForWin(board);
            }
        }

        return win;
    }

    const checkRowForWin = (board: string[][], row: number) => {
        if (board[row][0] &&
            board[row][0] == board[row][1] &&
            board[row][0] == board[row][2]) {
            return true;
        }
        return false;
    }

    const checkColumnForWin = (board: string[][], column: number) => {
        if (board[0][column] &&
            board[0][column] == board[1][column] &&
            board[0][column] == board[2][column]) {
            return true;
        }
        return false;
    }

    const checkDiagonalsForWin = (board: string[][]) => {
        if (board[0][0] &&
            board[0][0] == board[1][1] &&
            board[0][0] == board[2][2]
        ) {
            return true;
        } else if (board[0][2] &&
            board[0][2] == board[1][1] &&
            board[0][2] == board[2][0]
        ) {
            return true;
        } else {
            return false;
        }
    }

    const takeCPUTurn = () => {
        let cpuMove = generateCPUMove();

        //toggleSpace(cpuMove.row, cpuMove.column);
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
                        <td><Space symbol={boardState[0][0]} playerMove={() => playerMove(0, 0)} /></td>
                        <td><Space symbol={boardState[0][1]} playerMove={() => playerMove(0, 1)} /></td>
                        <td><Space symbol={boardState[0][2]} playerMove={() => playerMove(0, 2)} /></td>
                    </tr>
                    <tr>
                        <td><Space symbol={boardState[1][0]} playerMove={() => playerMove(1, 0)} /></td>
                        <td><Space symbol={boardState[1][1]} playerMove={() => playerMove(1, 1)} /></td>
                        <td><Space symbol={boardState[1][2]} playerMove={() => playerMove(1, 2)} /></td>
                    </tr>
                    <tr>
                        <td><Space symbol={boardState[2][0]} playerMove={() => playerMove(2, 0)} /></td>
                        <td><Space symbol={boardState[2][1]} playerMove={() => playerMove(2, 1)} /></td>
                        <td><Space symbol={boardState[2][2]} playerMove={() => playerMove(2, 2)} /></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}