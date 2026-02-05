'use client';

import ResultRow from "./network training table row";

interface tableProps {
    scoresArray: networkScore[]
}

interface networkScore {
    networkNumber: number,
    score: number
}

export default function ResultsTable(props: tableProps) {

    const quickSortByScore = (scoresArray: networkScore[]) => {
        let pivot = scoresArray[0];
        let length = scoresArray.length;
        let leftArray = [];
        let rightArray = [];

        for (let i = 1; i < length; i++) {
            if (scoresArray[i].score > pivot.score) {
                leftArray.push(scoresArray[i]);
            } else {
                rightArray.push(scoresArray[i]);
            }
        }

        let sortedArray: networkScore[] = quickSortByScore(leftArray)
            .concat(pivot)
            .concat(quickSortByScore(rightArray));

        return sortedArray;
    }

    const sortedArray = quickSortByScore(props.scoresArray);

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Network Number</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedArray.map((thisNetworkScore) => {
                        return (
                            <ResultRow
                                networkNumber={thisNetworkScore.networkNumber}
                                score={thisNetworkScore.score} />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}