'use client';

import { useState } from "react";
import ResultsTable from "./network training table";
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

    const [trainingFinished, setTrainingFinished] = useState(false);
    const [scoresArray, setScoresArray] = useState([]);

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

    const beginTraining = () => {
        let length = networkValues.length;
        let scoreArray = [];

        for (let i = 0; i < length; i++) {
            let thisScoreObject = {
                networkNumber: i,
                score: 0
            }

            scoreArray.push(thisScoreObject);
        }

        for (let i = 0; i < length - 1; i++) {
            for (let j = i + 1; j < length; j++) {
                for (let k = 0; k < 10; k++) {
                    let networkOne = new Network(networkValues[i]);
                    let networkTwo = new Network(networkValues[j]);
                    let gameOneWinner = simulateGame(networkOne, networkTwo);
                    let gameTwoWinner = simulateGame(networkTwo, networkOne);

                    if (gameOneWinner == 'X') {
                        scoreArray[i].score += 2;
                    } else if (gameOneWinner == 'O') {
                        scoreArray[j].score += 2;
                    } else {
                        scoreArray[i].score += 1;
                        scoreArray[j].score += 1;
                    }

                    if (gameTwoWinner == 'X') {
                        scoreArray[j].score += 2;
                    } else if (gameTwoWinner == 'O') {
                        scoreArray[i].score += 2;
                    } else {
                        scoreArray[i].score += 1;
                        scoreArray[j].score += 1;
                    }
                }
            }
        }
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

    const generateNewNetworkValues = () => {

    }



    return (
        <div>
            {
                !trainingFinished ?
                    <button type="button" onClick={beginTraining} >Begin Training</button> :
                    null
            }
            {
                trainingFinished ?
                    <ResultsTable scoresArray={scoresArray} /> :
                    null
            }
            {
                trainingFinished ?
                    <button type="button" onClick={generateNewNetworkValues} >Generate New Values?</button> :
                    null
            }
        </div>
    );
}