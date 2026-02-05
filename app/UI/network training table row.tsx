'use client';

interface rowProps {
    networkNumber: number,
    score: number
}

export default function ResultRow(props: rowProps) {
    return (
        <tr>
            <td>{props.networkNumber}</td>
            <td>{props.score}</td>
        </tr>
    );
}