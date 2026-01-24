'use client';

import { useState } from "react";
import Space from "./space";

export default function Board() {

    const [boardState, setBoardState] = useState([
    ['','',''],
    ['','',''],
    ['','','']
])
    return <div>
        <table>
            <tr>
                <td><Space symbol={boardState[0][0]} row={0} column={0} /></td>
                <td><Space symbol={boardState[0][1]} row={0} column={1} /></td>
                <td><Space symbol={boardState[0][2]} row={0} column={2} /></td>
            </tr>
            <tr>
                <td><Space symbol={boardState[1][0]} row={1} column={0} /></td>
                <td><Space symbol={boardState[1][1]} row={1} column={1} /></td>
                <td><Space symbol={boardState[1][2]} row={1} column={2} /></td>
            </tr>
            <tr>
                <td><Space symbol={boardState[2][0]} row={2} column={0} /></td>
                <td><Space symbol={boardState[2][1]} row={2} column={1} /></td>
                <td><Space symbol={boardState[2][2]} row={2} column={2} /></td>
            </tr>
        </table>
    </div>
}