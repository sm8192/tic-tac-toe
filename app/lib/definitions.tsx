export type network = {
    inputLayer: layer
    hiddenLayers: layer[]
    outputLayer: layer
}

export type layer = {
    neurons: neuron[],
    length: number
}

export type neuron = {
    weights: number[],
    bias: number
}