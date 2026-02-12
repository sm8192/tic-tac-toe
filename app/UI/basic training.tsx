'use client';

import { useState, useRef } from "react";
import networkValues from "@/app/network/BasicNetworkValues.json";

interface networkScore {
    networkNumber: number,
    score: number
}

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

export default function BasicTrainingMenu() {

    const emptyNetworkArray: networkJSON[] = [];

    const [newNetworksGenerated, setNewNetworksGenerated] = useState(false);
    const [trainingInProcess, setTrainingInProcess] = useState(false);

    let newNetworkArray = useRef(emptyNetworkArray)

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
        newNetworkArray.current = newNetworkValues;
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
            let thisNetwork = new Network(networkValues[i]);
            for (let j = 0; j < 100; j++) {
                let gameWon = simulateGame(thisNetwork);

                if (gameWon) {
                    scoresArray[i].score++;
                }
            }
        }
        return scoresArray;
    }

    const simulateGame = (network: Network) => {
        let sequence = generateRandomSequence();
        let cpuSequence = generateCPUSequence(network, sequence);
        let cpuFailed = false;

        sequence.forEach((space, i) => {
            if (space != cpuSequence[i]) {
                cpuFailed = true;
            }
        });

        return !cpuFailed;
    }

    const generateCPUSequence = (network: Network, inputs: boolean[]) => {
        let networkOutputs = network.activateNetwork(inputs);

        return networkOutputs;
    }

    const generateRandomSequence = () => {
        let sequence = [];
        for (let i = 0; i < 5; i++) {
            sequence.push(randomBit());
        }

        return sequence;
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
                newNetworkJSONArray.push(generateNewNetworkJSON(5, 5, 3, 3));
            }
        }
        return newNetworkJSONArray;
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
            },
            layers: emptyLayers
            ,
            outputLayer: {
                neurons: emptyOutputNeurons,
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
            neurons: emptyNeurons
        }

        for (let i = 0; i < layerLength; i++) {
            newLayerJSON.neurons.push(generateNewNeuronJSON(numberOfInputs));
        }
        return newLayerJSON;
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
        navigator.clipboard.writeText(JSON.stringify(newNetworkArray.current));
    }

    return (
        <div>
            {
                !newNetworksGenerated ?
                    <button type="button" onClick={() => multiGenerationTraining(1000)} disabled={trainingInProcess}>Begin Training</button> :
                    null
            }
            {
                newNetworksGenerated ?
                    <button type="button" onClick={copyNetworksToClipboard}>Copy new networks to Clipboard</button> :
                    null
            }
        </div>
    )
}