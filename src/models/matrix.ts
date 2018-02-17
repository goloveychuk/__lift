
type MapCbData<T> = { h: number, w: number, cell: T }

export class Matrix<T> {
    readonly width: number
    readonly height: number
    constructor({ width, height, data }: { width: number, height: number, data: T[][] }) {
        this.width = width
        this.height = height
        this.matrix = data
    }

    static createEmpty<T>({ width, height }: { width: number, height: number }): Matrix<T> {
        const matrix = new Array(height)
        for (let i = 0; i < height; i++) {
            matrix[i] = new Array(width)
        }
        return new Matrix({ width, height, data: matrix })
    }
    private matrix: T[][]

    get(h: number, w: number): T | undefined {
        if (h < 0 || w < 0 || h >= this.height || w >= this.width) {
            return undefined
        }
        return this.matrix[h][w]
    }



    *[Symbol.iterator](): IterableIterator<MapCbData<T>> {
        for (let h=0; h<this.height; h++){
            const row = this.matrix[h]
            for (let w=0; w<this.width; w++)  {
                const cell = row[w]
                yield ({ cell, h, w })
            }
        }
    }

    *neighbours(findH: number, findW: number): IterableIterator<MapCbData<T>> {
        const indexes = [
            [findH + 1, findW],
            [findH, findW + 1],
            [findH - 1, findW],
            [findH, findW - 1],
        ]
        for (const [h, w] of indexes) {
            const cell = this.get(h, w)
            if (cell === undefined) {
                continue
            }
            yield ({ cell, h, w })
        }
    }

    mapRow<R>(mapper: (value: T[], index: number) => R) {
        return this.matrix.map(mapper)
    }

    set(h: number, w: number, data: T) {
        this.matrix[h][w] = data
    }

    map<R>(mapper: (data: MapCbData<T>) => R): Matrix<R> {
        const data = this.matrix.map((row, h) => row.map((cell, w) => mapper({ h, w, cell })))
        return new Matrix({ data, height: this.height, width: this.width })
    }

}
