'use client';

import { useState } from "react";
import Space from "./space";

export default function Board() {

    const [boardState, setBoardState] = useState([
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ]);

    const [activePlayer, setActivePlayer] = useState('X');

    const toggleSpace = (row: number, column: number) => {

        if (boardState[row][column] == '') {

            let newState = [];
            newState.push(boardState[0]);
            newState.push(boardState[1]);
            newState.push(boardState[2]);
            newState[row][column] = activePlayer;
            setBoardState(newState);

            setActivePlayer(activePlayer == 'X' ? 'O' : 'X');
        }
    }

    return <div>
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
}