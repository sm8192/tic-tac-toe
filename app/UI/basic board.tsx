'use client';

import { useState, useRef } from "react";
import BasicSpace from "./basic space";
import networkValues from "@/app/network/BasicNetworkValues.json";
import { network } from "../lib/definitions";

export default function BasicBoard() {
    interface networkJSON {
        inputLayer: {
            neurons: neuronJSON[]
        },
        layers: layerJSON[],
        outputLayer: {
            neurons: neuronJSON[],
        }
    }

    interface layerJSON {
        neurons: neuronJSON[],
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

    const [boardState, setBoardState] = useState([false, false, false, false, false])
    const [gameOver, setGameOver] = useState(false);
    const [cpuWins, setCpuWins] = useState(false);

    const toggleSpace = (space: number) => {

        let tempBoard: boolean[] = [];
        boardState.forEach((thisSpace) => {
            tempBoard.push(thisSpace);
        });

        tempBoard[space] = !tempBoard[space];

        setBoardState(tempBoard);
    }

    const generateCPUSequence = (board: boolean[]) => {
        let inputs = convertBoardstateToInputs(board);
        let networkOutputs = neuralNetwork.current.activateNetwork(inputs);

        return networkOutputs;
    }

    const convertBoardstateToInputs = (board: boolean[]) => {
        let networkInputs: boolean[] = [];

        board.forEach((space) => {
            networkInputs.push(space);
        });

        return networkInputs;
    }

    const submitSequence = () => {
        let cpuSequence = generateCPUSequence(boardState);
        let cpuFailed = false;

        boardState.forEach((space, i) => {
            if (space != cpuSequence[i]) {
                cpuFailed = true;
            }
        });

        setGameOver(true);
        setCpuWins(!cpuFailed);
    }

    let  neuralNetwork = useRef(new Network(networkValues[0]));

    return (
        <div>
            <div>
                <BasicSpace chosen={boardState[0]} playerMove={() => toggleSpace(0)} />
                <BasicSpace chosen={boardState[1]} playerMove={() => toggleSpace(1)} />
                <BasicSpace chosen={boardState[2]} playerMove={() => toggleSpace(2)} />
                <BasicSpace chosen={boardState[3]} playerMove={() => toggleSpace(3)} />
                <BasicSpace chosen={boardState[4]} playerMove={() => toggleSpace(4)} />
                <button type="button" onClick={submitSequence}>Submit Sequence</button>
            </div>
            <div>
                {
                    gameOver && cpuWins ?
                        <p>CPU Wins!</p> :
                        null
                }
                {
                    gameOver && !cpuWins ?
                        <p>CPU Loses</p> :
                        null
                }
            </div>
        </div>
    )
}