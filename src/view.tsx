
import * as React from 'react';
import * as ClassNames from 'classnames'
import {ViewCellModel, LiftCellModel, LiftCellData, Matrix} from './models'
import {ReadOnlyAtom, Atom, F} from '@grammarly/focal'



function CellView({cell, onClick}: {cell: ViewCellModel, onClick():void }) {
    const {classes, color } = cell
    const classNames = ClassNames('cell', {
        ...classes
    })
    let style: React.CSSProperties = {};
    if (color !== undefined) {
        const colorStr = color && `rgb(${color.red}, ${color.green}, ${color.blue}, ${color.alpha})`
        style.backgroundColor = colorStr
    }
    
    return <div style={style} onClick={onClick} className={classNames}>

    </div>
}

function LiftCell({cell}: {cell: Atom<LiftCellData>}) {
    const styles: React.CSSProperties = {
        top: cell.lens('topPosition'),
        left: cell.lens('leftPosition'),
    }
    return <F.div className='cell lift' style={styles}>

    </F.div>
}



let leftIndex = 0
let topIndex = 0

setInterval(()=>{
    // liftCell.updatePosition({leftIndex: ++leftIndex, topIndex: ++topIndex})
}, 1000)

const MATRIX_HEIGHT = 20
const MATRIX_WIDTH = 30

const liftCell = new LiftCellModel()


export class RootView extends React.Component {
    
    onClickCell = (cell: ViewCellModel) => {
        if (!cell.canPass) {
            return
        }
        liftCell.updatePosition({topIndex: cell.top, leftIndex: cell.left})
    }
    render() {
        const matrix = new Matrix({
            width: MATRIX_WIDTH,
            height: MATRIX_HEIGHT
        })
        matrix.fillMatrixRandomly()

        const viewMatrix = matrix.getForView()
        return <div className='container'>
            <LiftCell cell={liftCell.data}/>
            <div className='matrix'>
                {viewMatrix.map(row => 
                    <div className='matrix-row'>
                        {row.map(cell => <CellView onClick={()=>this.onClickCell(cell)} cell={cell} />)}
                    </div>
                )}
            </div>
        </div>
    }
}