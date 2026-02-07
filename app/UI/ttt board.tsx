'use client';

import { useState, useRef } from "react";
import Space from "./ttt space";
import networkValues from "@/app/network/NetworkValues.json";

interface boardProps {
    players: number;
    humanPlayer: string;
    winner: string;
    setWinner: Function;
    setIllegalMove: Function;
}

export default function TicTacToeBoard(props: boardProps) {
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
                let cpuMove = generateCPUMove(tempBoard);

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

    const generateCPUMove = (board: string[][]) => {
        let inputs = convertBoardstateToInputs(board);
        let networkOutputs = neuralNetwork.current.activateNetwork(inputs);
        let row = calculateRow(networkOutputs[0], networkOutputs[1]);
        let column = calculateColumn(networkOutputs[2], networkOutputs[3]);

        return {
            row: row,
            column: column
        };
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

    const neuralNetwork = useRef(new Network(networkValues[0]));

    const activePlayer = determineActivePlayer();

    if (props.players == 1 && props.humanPlayer == 'O' && countSymbol('X') == 0) {

        let tempBoard: string[][] = [];
        boardState.forEach((thisRow) => {
            tempBoard.push(thisRow)
        })

        let cpuMove = generateCPUMove(tempBoard);
        tempBoard[cpuMove.row][cpuMove.column] = activePlayer;
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