'use client';

import { useState } from "react";
import networkValues from "@/app/network/NetworkValues.json";

export default function TrainingMenu() {

    interface networkJSON {
        inputLayer: {
            neurons: neuronJSON[]
            ,
            length: number
        },
        layers: layerJSON[]
        ,
        outputLayer: {
            neurons: neuronJSON[]
            ,
            length: number
        }
    }

    interface layerJSON {
        neurons: neuronJSON[]
        ,
        length: number
    }

    interface neuronJSON {
        weights: number[],
        bias: number
    }

    interface networkScore {
        networkNumber: number,
        score: number
    }
    const emptyNetworkArray: networkJSON[] = [];

    const [trainingInProcess, setTrainingInProcess] = useState(false);
    const [newNetworksGenerated, setNewNetworksGenerated] = useState(false);
    const [newNetworkArray, setNewNetworkArray] = useState(emptyNetworkArray);

    class Neuron {
        weights: number[];
        bias: number;

        constructor(neuronJSON: neuronJSON) {
            this.weights = neuronJSON.weights;
            this.bias = neuronJSON.bias;
        }

        activateNeuron(input: boolean[]) {
            const weightedSum = this.weights.reduce((sum, weight, i) => {
                let inputNumber = input[i] ? 1 : 0;
                return ((inputNumber * weight) + sum);
            }, 0);
            return weightedSum + this.bias > 0 ? true : false;
        }
    }

    class Layer {
        neurons: Neuron[];
        length: number;

        constructor(layerJSON: layerJSON) {
            this.neurons = [];
            for (let i = 0; i < layerJSON.length; i++) {
                let thisNeuron = new Neuron(layerJSON.neurons[i]);
                this.neurons.push(thisNeuron);
            }
            this.length = layerJSON.length;
        }

        activateLayer(inputArray: boolean[]) {
            let outputArray: boolean[] = [];

            for (let i = 0; i < this.length; i++) {
                outputArray.push(this.neurons[i].activateNeuron(inputArray));
            }
            return outputArray;
        }
    }

    class Network {
        inputLayer: Layer;
        layers: Layer[];
        outputLayer: Layer;

        constructor(networkJSON: networkJSON) {
            this.layers = [];

            this.inputLayer = new Layer(networkJSON.inputLayer);

            for (let i = 0; i < networkJSON.layers.length; i++) {
                if (i == 0) {
                    this.layers.push(new Layer(networkJSON.layers[i]))
                } else {
                    this.layers.push(new Layer(networkJSON.layers[i]));
                }
            }
            this.outputLayer = new Layer(networkJSON.outputLayer);
        }

        activateNetwork(inputArray: boolean[]) {
            let firstLayerOutputs = this.inputLayer.activateLayer(inputArray);

            let hiddenLayerOutputs = this.layers.reduce((previousOutputs, thisLayer) => {
                return thisLayer.activateLayer(previousOutputs)
            }, firstLayerOutputs);

            return this.outputLayer.activateLayer(hiddenLayerOutputs);
        }
    }

    const multiGenerationTraining = (numberOfGenerations: number) => {
        if (trainingInProcess) {
            return;
        }
        setTrainingInProcess(true);

        let scoresArray = runTournament(networkValues);
        let sortedScores = quickSortByScore(scoresArray);
        let newNetworkValues = createNewGeneration(networkValues, sortedScores);
        for (let i = 1; i < numberOfGenerations; i++) {
            let scoresArray = runTournament(newNetworkValues);
            let sortedScores = quickSortByScore(scoresArray);
            newNetworkValues = createNewGeneration(newNetworkValues, sortedScores);
        }
        setNewNetworkArray(newNetworkValues);
        setNewNetworksGenerated(true);
        setTrainingInProcess(false);
    }

    let runTournament = (networkValues: networkJSON[]) => {
        let length = networkValues.length;
        let scoresArray = [];

        for (let i = 0; i < length; i++) {
            let thisScoreObject = {
                networkNumber: i,
                score: 0
            }

            scoresArray.push(thisScoreObject);
        }

        for (let i = 0; i < length - 1; i++) {
            for (let j = i + 1; j < length; j++) {
                let networkOne = new Network(networkValues[i]);
                let networkTwo = new Network(networkValues[j]);

                let gameOneWinner = simulateGame(networkOne, networkTwo);
                let gameTwoWinner = simulateGame(networkTwo, networkOne);

                if (gameOneWinner == 'X') {
                    scoresArray[i].score += 2;
                } else if (gameOneWinner == 'O') {
                    scoresArray[j].score += 2;
                } else {
                    scoresArray[i].score += 1;
                    scoresArray[j].score += 1;
                }

                if (gameTwoWinner == 'X') {
                    scoresArray[j].score += 2;
                } else if (gameTwoWinner == 'O') {
                    scoresArray[i].score += 2;
                } else {
                    scoresArray[i].score += 1;
                    scoresArray[j].score += 1;
                }
            }
        }
        return scoresArray;
    }

    const createNewGeneration = (networkValues: networkJSON[], scoresArray: networkScore[]) => {

        let newNetworkJSONArray = [];
        {
            for (let i = 0; i < 5; i++) {
                let chosenNetworkJSON = networkValues[scoresArray[i].networkNumber];

                newNetworkJSONArray.push(chosenNetworkJSON);
            }

            for (let i = 0; i < 5; i++) {
                let chosenNetworkJSON = networkValues[scoresArray[i].networkNumber];

                let mutatedNetworkJSON = smallMutate(chosenNetworkJSON);

                newNetworkJSONArray.push(mutatedNetworkJSON);
            }

            for (let i = 0; i < 5; i++) {
                let chosenNetworkJSON = networkValues[scoresArray[i].networkNumber];

                let firstMutatedNetworkJSON = largeMutate(chosenNetworkJSON);
                let secondMutatedNetworkJSON = largeMutate(chosenNetworkJSON);

                newNetworkJSONArray.push(firstMutatedNetworkJSON);
                newNetworkJSONArray.push(secondMutatedNetworkJSON);
            }
            for (let i = 0; i < 10; i++) {
                newNetworkJSONArray.push(generateNewNetworkJSON(18, 4, 10, 10));
            }
        }
        return newNetworkJSONArray;
    }

    const convertBoardstateToInputs = (board: string[][]) => {
        let networkInputs: boolean[] = [];

        board.forEach((thisRow) => {
            thisRow.forEach((thisSpace) => {
                if (thisSpace != '') {
                    networkInputs.push(true);
                    if (thisSpace == 'X') {
                        networkInputs.push(true);
                    } else {
                        networkInputs.push(false);
                    }
                } else {
                    networkInputs.push(false);
                    networkInputs.push(false);
                }
            });
        });
        return networkInputs;
    }

    const calculateRow = (rowFirstBit: boolean, rowSecondBit: boolean) => {

        if (rowFirstBit) {
            if (rowSecondBit) {
                return 0;
            } else {
                return 1;
            }
        } else {
            return 2;
        }
    }

    const calculateColumn = (columnFirstBit: boolean, columnSecondBit: boolean) => {
        if (columnFirstBit) {
            if (columnSecondBit) {
                return 0;
            } else {
                return 1;
            }
        } else {
            return 2;
        }
    }

    const simulateGame = (playerOne: Network, playerTwo: Network) => {
        let tempBoard = [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
        ];

        let activePlayer = 'X';
        let winner = '';

        do {
            let inputs = convertBoardstateToInputs(tempBoard);
            let outputs = activePlayer == 'X' ?
                playerOne.activateNetwork(inputs) :
                playerTwo.activateNetwork(inputs);
            let row = calculateRow(outputs[0], outputs[1]);
            let column = calculateColumn(outputs[2], outputs[3]);

            let legalMove = tempBoard[row][column] == '';
            if (!legalMove) {
                winner = getOtherPlayer(activePlayer);
            } else {
                tempBoard[row][column] = activePlayer;
            }

            if (winner == '' && checkForWin(tempBoard)) {
                winner = activePlayer;
            }

            activePlayer = getOtherPlayer(activePlayer);

        } while (winner == '')
        if (winner == 'X') {
            return 'X';
        } else if (winner == 'O') {
            return 'O';
        } else {
            return 'C';
        }
    }

    const getOtherPlayer = (player: string) => {
        return player == 'X' ? 'O' : 'X';
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

    const smallMutate = (networkJSON: networkJSON) => {
        let newNetworkJSON = structuredClone(networkJSON)
        newNetworkJSON.inputLayer.neurons.forEach((thisNeuron) => {
            smallMutateNeuron(thisNeuron);
        });

        newNetworkJSON.layers.forEach((thisLayer) => {
            thisLayer.neurons.forEach((thisNeuron) => {
                smallMutateNeuron(thisNeuron);
            })
        });

        newNetworkJSON.outputLayer.neurons.forEach((thisNeuron) => {
            smallMutateNeuron(thisNeuron);
        });

        return newNetworkJSON;
    }

    const smallMutateNeuron = (neuron: neuronJSON) => {
        neuron.weights.forEach((thisWeight) => {
            if (randomBit()) {
                thisWeight += (randomValue() * .1);
            }
        });
        if (randomBit()) {
            neuron.bias += (randomValue() * .1);
        }
    }

    const largeMutate = (networkJSON: networkJSON) => {
        let newNetworkJSON = structuredClone(networkJSON);
        newNetworkJSON.inputLayer.neurons.forEach((thisNeuron) => {
            largeMutateNeuron(thisNeuron);
        });

        newNetworkJSON.layers.forEach((thisLayer) => {
            thisLayer.neurons.forEach((thisNeuron) => {
                largeMutateNeuron(thisNeuron);
            });
        });

        newNetworkJSON.outputLayer.neurons.forEach((thisNeuron) => {
            largeMutateNeuron(thisNeuron);
        });

        return newNetworkJSON;
    }

    const largeMutateNeuron = (neuron: neuronJSON) => {
        neuron.weights.forEach((thisWeight) => {
            thisWeight += (randomValue());
        });
        neuron.bias += (randomValue());
    }

    const generateNewNetworkJSON = (inputs: number, outputs: number, hiddenLayers: number, layerLength: number) => {
        let emptyInputNeurons: neuronJSON[] = [];
        let emptyLayers: layerJSON[] = [];
        let emptyOutputNeurons: neuronJSON[] = [];
        let newNetworkJSON = {
            inputLayer: {
                neurons: emptyInputNeurons,
                length: layerLength
            },
            layers: emptyLayers
            ,
            outputLayer: {
                neurons: emptyOutputNeurons,
                length: outputs
            }
        }
        for (let i = 0; i < layerLength; i++) {
            newNetworkJSON.inputLayer.neurons.push(generateNewNeuronJSON(inputs));
        }

        for (let i = 0; i < hiddenLayers; i++) {
            newNetworkJSON.layers.push(generateNewLayerJSON(layerLength, layerLength));
        }

        for (let i = 0; i < outputs; i++) {
            newNetworkJSON.outputLayer.neurons.push(generateNewNeuronJSON(layerLength));
        }

        return newNetworkJSON;
    }

    const generateNewNeuronJSON = (numberOfInputs: number) => {
        let emptyWeights: number[] = [];
        let newNeuron = {
            weights: emptyWeights,
            bias: randomValue()
        }

        for (let i = 0; i < numberOfInputs; i++) {
            newNeuron.weights.push(randomValue());
        }
        return newNeuron;
    }

    const generateNewLayerJSON = (numberOfInputs: number, layerLength: number) => {
        let emptyNeurons: neuronJSON[] = [];
        let newLayerJSON = {
            neurons: emptyNeurons,
            length: layerLength
        }

        for (let i = 0; i < layerLength; i++) {
            newLayerJSON.neurons.push(generateNewNeuronJSON(numberOfInputs));
        }
        return newLayerJSON;
    }

    const randomValue = () => {
        return ((Math.random() * 2) - 1);
    }

    const randomBit = () => {
        if (randomValue() > 0) {
            return true;
        } else {
            return false;
        }
    }

    const quickSortByScore = (scoresArray: networkScore[]) => {
        let length = scoresArray.length;
        if (length <= 1) {
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

    const copyNetworksToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(newNetworkArray));
    }

    return (
        <div>
            {
                !newNetworksGenerated ?
                    <button type="button" onClick={() => multiGenerationTraining(5000)} disabled={trainingInProcess}>Begin Training</button> :
                    null
            }
            {
                newNetworksGenerated ?
                    <button type="button" onClick={copyNetworksToClipboard}>Copy new networks to Clipboard</button> :
                    null
            }

        </div>
    );
}