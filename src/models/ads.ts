import {Atom} from '@grammarly/focal'

const MAX_WEIGHT = 1000;


interface CellColor {
    red: number,
    green: number,
    blue: number,
    alpha: number,
}

interface CellStyles {
    leftBordered?: boolean,
    topBordered?: boolean,
    bottomBordered?: boolean,
    rightBordered?: boolean
}

export interface ViewCellModel {
    classes: CellStyles
    color?: CellColor
    canPass: boolean
    weight: number
    left: number
    top: number
}

const CELL_SIZE = 30;

export interface LiftCellData {
    topPosition: number
    leftPosition: number
}

export class LiftCellModel {
    readonly data: Atom<LiftCellData>

    constructor() {
        this.data = Atom.create<LiftCellData>({
            topPosition: 0,
            leftPosition: 0
        })
    }

    updatePosition({topIndex, leftIndex}: {topIndex: number, leftIndex: number}) {

        this.data.modify(d => {

            return {
                leftPosition: leftIndex*CELL_SIZE,
                topPosition: topIndex*CELL_SIZE
            }
        })
    }
    
}

function getColorForWeight(weight: number): CellColor {
    const d = weight / MAX_WEIGHT
    let red, green
    if (d < 0.5) {
        green = 255
        red = Math.floor(255*d*2)
    } else {
        red = 255
        const d2 = (d-0.5)*2
        green = 255 - Math.floor(255*d2)
    }
    return {
        red,
        green,
        blue: 0,
        alpha: 0.6
    }
}
