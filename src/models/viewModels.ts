import { Matrix } from './matrix';

interface CellColor {
    hue: number,
    sat: number,
    light: number,
}

export interface CellStyles {
    canPass: boolean
    leftBordered?: boolean,
    topBordered?: boolean,
    bottomBordered?: boolean,
    rightBordered?: boolean
    highlighted?: boolean    
}

export interface CellViewModel {
    canPass: boolean

    classes: CellStyles
    color?: CellColor
    weight: number
    h: number
    w: number
}



export interface InputMatrixData {
    weight: number
    canPass: boolean
}


function getColorForWeight(weight: number, max_weight: number): CellColor {
    const d = weight / max_weight
    const hue = 120 * (1-d) // 0 is red, 120 is green
    return {
        hue,
        sat: 100,
        light: 50
    }
}

function cellCanPass(matrix: Matrix<InputMatrixData>, h: number, w: number) {
    const cell = matrix.get(h, w)
    if (cell === undefined) {
        return true
    }
    return cell.canPass
}


export function getMatrixForView(matrix: Matrix<InputMatrixData>, max_weight: number): Matrix<CellViewModel> {
    return matrix.map(({ cell, h, w }) => {
        const {canPass} = cell;

        let classes: CellStyles = {canPass}

        if (!canPass) {
            classes = {
                ...classes,
                bottomBordered: cellCanPass(matrix, h + 1, w),
                leftBordered: cellCanPass(matrix, h, w - 1),
                rightBordered: cellCanPass(matrix, h, w + 1),
                topBordered: cellCanPass(matrix, h - 1, w),
            }
        }

        const data: CellViewModel = {
            color: cell.canPass ? getColorForWeight(cell.weight, max_weight) : undefined,
            classes,
            canPass,
            weight: cell.weight,
            h,
            w,
        }
        return data
    })
}