import { Atom, ReadOnlyAtom } from '@grammarly/focal'
import { Matrix } from './matrix'
import { InputMatrixData, getMatrixForView, CellViewModel, CellStyles } from './viewModels';
import { ShortestPathAlg, Dijkstra, GraphRepresentable } from './shortestPath'
import { BehaviorSubject, Observable, operators, Subscriber } from 'rxjs'

import * as Lodash from 'lodash'

const MAX_WEIGHT = 1000;
const CELL_SIZE = 30;
const MATRIX_HEIGHT = 20
const MATRIX_WIDTH = 30
const MAX_ANIMATION_DURATION = 1500 //ms


namespace MatrixFillers {

    export function fillRandomly(max_weight: number, matrix: Matrix<InputMatrixData>) {
        for (let i = 0; i < matrix.height; i++) {
            for (let j = 0; j < matrix.width; j++) {
                let weight = 0
                let canPass = Math.random() < 0.80;
                if (canPass) {
                    weight = Math.round(Math.random() * max_weight)
                }
                matrix.set(i, j, { canPass, weight })
            }
        }
    }
}

interface PointModel {
    h: number
    w: number
    weight: number
}

class GraphRepresentableMatrix implements GraphRepresentable<PointModel> {
    constructor(private matrix: Matrix<InputMatrixData>) {

    }
    getKey(node: PointModel) {
        return `${node.h}_${node.w}`
    }
    *getNeighbours(node: PointModel): IterableIterator<PointModel> {
        for (const { cell, h, w } of this.matrix.neighbours(node.h, node.w)) {
            if (!cell.canPass) {
                continue
            }
            yield { h, w, weight: cell.weight }
        }
    }
}

interface Animation {
    duration: number
}

function getAnimation(step: PointModel) {
    const duration = (step.weight / MAX_WEIGHT) * MAX_ANIMATION_DURATION + 300
    return {
        duration
    }
}


// function repeatOnUnsubscribeOperator<T>(cb: (v: T) => T) {
//     return function (source: Observable<T>): Observable<T> {

//         return Observable.create((subscriber: Subscriber<T>) => {
//             var queue: T[] = []


//             var subscription = source.subscribe(value => {
//                 queue.push(value)
//                 subscriber.next(value)
//             },
//                 err => subscriber.error(err),
//                 () => subscriber.complete()
//             )
//             subscription.add(() => {
//                 for (const i of queue) {
//                     (subscriber as any)._next(cb(i))
//                 }
//                 queue = []
//             })
//             return subscription
//         })
//     }
// }



export interface LiftCellData {
    topPosition: number
    leftPosition: number
    animation: Animation
}

function withDelayOperator<T extends { delay: number }>(observable: Observable<T>): Observable<T> {
    return observable.concatMap((r: T) => Observable.of(r).concat(Observable.empty().delay(r.delay) as any))
}


function createCurrentPositionObs(
    pathObs: Observable<PointModel[]>
): Observable<PointModel> {

    return pathObs.switchMap(path =>
        Observable.from(path)
            .map(step => {
                const animation = getAnimation(step)
                return {
                    step,
                    delay: animation.duration
                }
            })
            .pipe(withDelayOperator)
            .map(({ step }) => {
                return step
            })
    )
}

function createMatrixForViewObs(inputMatrix: ReadOnlyAtom<Matrix<InputMatrixData>>) {
    return inputMatrix.view(matrix =>
        getMatrixForView(matrix, MAX_WEIGHT)
            .map(({ cell }) => Atom.create(cell)))
}

function createHighlightedCellsObs(pathObs: Observable<PointModel[]>) {
    let previousHighlighted: PointModel[] = []  //todo rewrite
    return pathObs.switchMap(path => {
        const obs = Observable.from(previousHighlighted).map(step => ({ step, highlighted: false })) //todo rewrite
            .concat(Observable.from(path).zip(Observable.interval(50), step => ({ step, highlighted: true }))
                .do(({ step }) => {
                    previousHighlighted.push(step) //todo rewrite
                })
            )
        previousHighlighted = []
        return obs
        // .pipe(repeatOnUnsubscribeOperator(({step})=>({step, highlighted: false})))
    })
}

function getSteps(
    graphMatrix: GraphRepresentableMatrix,
    pathFinder: ShortestPathAlg<PointModel>,
    currentPosition: PointModel | undefined,
    targetPosition: PointModel,
): PointModel[] {
    if (currentPosition === undefined) {
        return [targetPosition]
    }
    if (graphMatrix.getKey(currentPosition) === graphMatrix.getKey(targetPosition)) {
        return []
    }
    const path = pathFinder.findPath(graphMatrix, currentPosition, targetPosition)

    return path || []
}


export class AppState {
    private inputMatrix: Atom<Matrix<InputMatrixData>>
    private targetPosition: Atom<PointModel>

    liftCellState: Observable<LiftCellData>

    matrixForView: ReadOnlyAtom<Matrix<Atom<CellViewModel>>>

    constructor() {


        const matrix = Matrix.createEmpty<InputMatrixData>({
            width: MATRIX_WIDTH,
            height: MATRIX_HEIGHT
        })

        MatrixFillers.fillRandomly(MAX_WEIGHT, matrix)

        this.inputMatrix = Atom.create(matrix)



        let initialPosition: PointModel = {
            h: 0,
            w: 0,
            weight: matrix.get(0, 0)!.weight,
        }

        this.targetPosition = Atom.create<PointModel>(initialPosition)

        const lastPosition = Atom.create<PointModel>(initialPosition)


        const graphMatrix = new GraphRepresentableMatrix(matrix)
        const pathFinder = new Dijkstra<PointModel>()
        const getStepsCurried = Lodash.curry(getSteps)(graphMatrix, pathFinder)


        const pathObs = this.targetPosition
            .switchMap(targetPosition =>
                Observable.of(getStepsCurried(lastPosition.get(), targetPosition))
            )


        //current position
        const currentPositionObs = createCurrentPositionObs(pathObs)
            .startWith(initialPosition)

        currentPositionObs.subscribe(pos => { //todo rewrite
            lastPosition.set(pos)
        })
        //current position        


        //lift cell state
        this.liftCellState = currentPositionObs.map(step => {
            return {
                leftPosition: step.w * CELL_SIZE,
                topPosition: step.h * CELL_SIZE,
                animation: getAnimation(step)
            }
        })
        //lift cell state


        //matrix for view
        this.matrixForView = createMatrixForViewObs(this.inputMatrix)
        //matrix for view


        //highlighted cells
        const highlightedCells = createHighlightedCellsObs(pathObs)

        highlightedCells.subscribe(({ step, highlighted }) => {  //todo rewrite
            this.matrixForView.get().get(step.h, step.w)!.modify(r => {
                const classes: CellStyles = { ...r.classes, highlighted }
                return { ...r, classes }
            })
        })
        //highlighted cells


    }

    setTargetPosition(targetPosition: CellViewModel) {
        this.targetPosition.set(targetPosition)
    }

}