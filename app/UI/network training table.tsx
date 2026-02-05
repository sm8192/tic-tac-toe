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
        let length = scoresArray.length;
        if(length <= 1) {
            return scoresArray;
        }
         let pivot = scoresArray[0];
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
                                score={thisNetworkScore.score} key={thisNetworkScore.networkNumber}/>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}