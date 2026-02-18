'use client';

import { useState, useRef } from "react";
import networkValues from "@/app/network/NetworkValues.json";

interface networkJSON {
    inputLayer: {
        neurons: neuronJSON[]
    },
    layers: layerJSON[],
    outputLayer: {
        neurons: neuronJSON[]
    }
}

interface layerJSON {
    neurons: neuronJSON[]
}

interface neuronJSON {
    weights: number[],
    bias: number
}

interface networkScore {
    networkNumber: number,
    score: number
}

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

    constructor(layerJSON: layerJSON) {
        this.neurons = [];
        for (let i = 0; i < layerJSON.neurons.length; i++) {
            let thisNeuron = new Neuron(layerJSON.neurons[i]);
            this.neurons.push(thisNeuron);
        }
    }

    activateLayer(inputArray: boolean[]) {
        let outputArray: boolean[] = [];

        for (let i = 0; i < this.neurons.length; i++) {
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
            this.layers.push(new Layer(networkJSON.layers[i]));
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

export default function TrainingMenu() {

    const emptyNetworkArray: networkJSON[] = [];

    const [trainingInProcess, setTrainingInProcess] = useState(false);
    const [newNetworksGenerated, setNewNetworksGenerated] = useState(false);
    const [loadingIcon, setLoadingIcon] = useState(false);

    let newNetworkArray = useRef(emptyNetworkArray);

    const multiGenerationTraining = (numberOfGenerations: number) => {
        if (trainingInProcess) {
            return;
        }
        setTrainingInProcess(true);

        let newGeneration = createNewGeneration(networkValues);
        let scoresArray = runTournament(newGeneration);
        let top30 = selectTop30(newGeneration, scoresArray);
        for (let i = 1; i < numberOfGenerations; i++) {
            let newGeneration = createNewGeneration(top30)
            let scoresArray = runTournament(newGeneration);
            top30 = selectTop30(newGeneration, scoresArray);
            if ((i % 100) == 0) {
                setLoadingIcon(!loadingIcon);
            }
        }

        newNetworkArray.current = top30;

        setNewNetworksGenerated(true);
        setTrainingInProcess(false);
    }

    const createNewGeneration = (networkValues: networkJSON[]) => {

        let newNetworkJSONArray: networkJSON[] = [];

        for (let i = 0; i < networkValues.length; i++) {
            newNetworkJSONArray.push(networkValues[i]);
        }

        for (let i = 0; i < 10; i++) {
            let mutatedNetworkJSON = smallMutate(networkValues[i]);
            newNetworkJSONArray.push(mutatedNetworkJSON);
        }

        for (let i = 0; i < 10; i++) {
            let mutatedNetworkJSON = largeMutate(networkValues[i]);
            newNetworkJSONArray.push(mutatedNetworkJSON);
        }

        for (let i = 0; i < 10; i++) {
            newNetworkJSONArray.push(generateNewNetworkJSON(18, 4, 10, 10));
        }

        return newNetworkJSONArray;
    }

    const runTournament = (networkValues: networkJSON[]) => {
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

    const selectTop30 = (networkJsonArray: networkJSON[], scoresArray: networkScore[]) => {
        let sortedScoresArray = quickSortByScore(scoresArray);
        let newNetworkJsonArray: networkJSON[] = [];

        for (let i = 0; i < 30; i++) {
            newNetworkJsonArray.push(networkJsonArray[sortedScoresArray[i].networkNumber]);
        }
        return newNetworkJsonArray;
    }

    const smallMutate = (networkJSON: networkJSON) => {
        let newNetworkJSON = structuredClone(networkJSON)

        for (let i = 0; i < newNetworkJSON.inputLayer.neurons.length; i++) {
            smallMutateNeuron(newNetworkJSON.inputLayer.neurons[i]);
        }

        for (let i = 0; i < newNetworkJSON.layers.length; i++) {
            for (let j = 0; j < newNetworkJSON.layers[i].neurons.length; j++) {
                smallMutateNeuron(newNetworkJSON.layers[i].neurons[j]);
            }
        }

        for (let i = 0; i < newNetworkJSON.outputLayer.neurons.length; i++) {
            smallMutateNeuron(newNetworkJSON.outputLayer.neurons[i]);
        }

        return newNetworkJSON;
    }

    const largeMutate = (networkJSON: networkJSON) => {
        let newNetworkJSON = structuredClone(networkJSON);

        for (let i = 0; i < newNetworkJSON.inputLayer.neurons.length; i++) {
            largeMutateNeuron(newNetworkJSON.inputLayer.neurons[i]);
        }

        for (let i = 0; i < newNetworkJSON.layers.length; i++) {
            for (let j = 0; j < newNetworkJSON.layers[i].neurons.length; j++) {
                largeMutateNeuron(newNetworkJSON.layers[i].neurons[j]);
            }
        }

        for (let i = 0; i < newNetworkJSON.outputLayer.neurons.length; i++) {
            largeMutateNeuron(newNetworkJSON.outputLayer.neurons[i]);
        }

        return newNetworkJSON;
    }

    const generateNewNetworkJSON = (inputs: number, outputs: number, hiddenLayers: number, layerLength: number) => {
        let emptyNeurons: neuronJSON[] = [];
        let emptyLayers: layerJSON[] = [];
        let newNetworkJSON = {
            inputLayer: {
                neurons: emptyNeurons,
            },
            layers: emptyLayers,
            outputLayer: {
                neurons: emptyNeurons,
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

            if (winner == '' && checkForTie(tempBoard)) {
                winner = 'C';
            }

            activePlayer = getOtherPlayer(activePlayer);

        } while (winner == '')
        return winner;
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

    const smallMutateNeuron = (neuron: neuronJSON) => {
        for (let i = 0; i < neuron.weights.length; i++) {
            if (randomBit() && randomBit() && randomBit()) {
                neuron.weights[i] += (randomValue() * 0.1);
            }
        }

        if (randomBit() && randomBit() && randomBit()) {
            neuron.bias += (randomValue() * 0.1);
        }
    }

    const largeMutateNeuron = (neuron: neuronJSON) => {
        for (let i = 0; i < neuron.weights.length; i++) {
            if (randomBit()) {
                neuron.weights[i] += (randomValue() * 0.5);
            }
        }

        if (randomBit()) {
            neuron.bias += (randomValue() * 0.5);
        }
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
            neurons: emptyNeurons
        }

        for (let i = 0; i < layerLength; i++) {
            newLayerJSON.neurons.push(generateNewNeuronJSON(numberOfInputs));
        }
        return newLayerJSON;
    }

    const convertBoardstateToInputs = (board: string[][]) => {
        let networkInputs: boolean[] = [];

        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] != '') {
                    networkInputs.push(true);
                    if (board[i][j] == 'X') {
                        networkInputs.push(true);
                    } else {
                        networkInputs.push(false);
                    }
                } else {
                    networkInputs.push(false);
                    networkInputs.push(false);
                }
            }
        }
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

    const checkForTie = (board: string[][]) => {
        let tie = true;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] == '') {
                    tie = false;
                    break;
                }
            }
            if (!tie) {
                break;
            }
        }
        return tie;
    }

    const randomBit = () => {
        if (randomValue() > 0) {
            return true;
        } else {
            return false;
        }
    }

    const randomValue = () => {
        return ((Math.random() * 2) - 1);
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
        }
        return false;
    }

    const copyNetworksToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(newNetworkArray.current));
    }

    return (
        <div>
            {
                !newNetworksGenerated ?
                    <button type="button" onClick={() => multiGenerationTraining(50000)} disabled={trainingInProcess}>Begin Training</button> :
                    null
            }
            {(!loadingIcon && trainingInProcess) ?
                <p>X</p> :
                null
            }
            {(loadingIcon && trainingInProcess) ?
                <p>O</p> :
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