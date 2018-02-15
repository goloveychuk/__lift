
export class Matrix {
    constructor({width, height}: {width: number, height: number}) {
        this.matrix = new Array(height)
        for (let i=0; i<height; i++) {
            this.matrix[i] = new Array(width)
        }
    }
    private matrix: {weight: number, canPass: boolean}[][]
    
    cellIsFilled(i: number, j: number) {
        const row = this.matrix[i]
        if (row === undefined) {
            return false
        }
        const cell = row[j]
        if (cell === undefined) {
            return false
        }
        return !cell.canPass
    }

    getForView(): ViewCellModel[][] {
        const res = new Array(this.matrix.length)
        for (let i=0; i<res.length; i++) {
            res[i] = new Array(this.matrix[i].length);

            for (let j=0; j<this.matrix[i].length; j++) {
                const filled = this.cellIsFilled(i, j);
                let classes: CellStyles = {}
                if (filled) {
                    classes = {
                        ...classes,
                        bottomBordered: !this.cellIsFilled(i+1, j),
                        leftBordered: !this.cellIsFilled(i, j-1),
                        rightBordered: !this.cellIsFilled(i, j+1),
                        topBordered: !this.cellIsFilled(i-1, j),
                    }
                }
                const cell = this.matrix[i][j]
                const data: ViewCellModel = {
                    color: cell.canPass ? getColorForWeight(cell.weight): undefined,
                    classes,
                    canPass: cell.canPass,
                    weight: cell.weight,
                    left: j,
                    top: i,
                }
                res[i][j] = data
            }
        }
        return res
    }

    fillMatrixRandomly() {
        for (let i=0; i<this.matrix.length; i++) {
            for (let j=0; j<this.matrix[i].length; j++) {
                let weight = 0
                let canPass = Math.random() < 0.66;
                if (canPass) {
                    weight = Math.round(Math.random()*MAX_WEIGHT)
                }
                this.matrix[i][j] = {canPass, weight}
            }
        }
    }
}
