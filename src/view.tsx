
import * as React from 'react';
import * as ClassNames from 'classnames'

import { AppState, LiftCellData } from './models/appState'
import { CellViewModel } from './models/viewModels'
import { ReadOnlyAtom, Atom, F } from '@grammarly/focal'
import { Observable, Subscription } from 'rxjs'


interface CellViewProps {
    cell: Atom<CellViewModel>
    onClick(cell: CellViewModel): void
}

function CellView({ cell, onClick }: CellViewProps) {

    const classNames = cell.lens('classes').view(classes =>
        ClassNames('cell', {
            ...classes
        })
    )

    let style = cell.lens('color').view(color => {
        if (color !== undefined) {
            const backgroundColor = `hsl(${color.hue}, ${color.sat}%, ${color.light}%)`
            return { backgroundColor }
        }
        return undefined
    })

    return <F.div style={style}  onClick={() => onClick(cell.get())} className={classNames}>

    </F.div>
}



// function LiftCell({ cell }: { cell: Observable<LiftCellData> }) {
//     const styles: React.CSSProperties = {
//         top: cell.map(c => c.topPosition),
//         left: cell.map(c => c.leftPosition),

//         transition: cell.map(c => Math.floor(c.animation.duration / 100)/10).map(dur => `top ${dur}s linear, left ${dur}s linear`)
//     }

//     // cell.subscribe(r=>console.log(r))
//     return <F.div className='cell lift' style={styles}>

//     </F.div>
// }
interface LiftCellState {
    cell: LiftCellData | null
}

class LiftCell extends React.Component<{ cell: Observable<LiftCellData> }, LiftCellState> {
    state: LiftCellState = {
        cell: null
    }
    _subscription: Subscription | undefined
    componentDidMount() {
        this._subscription = this.props.cell.subscribe(cell => { this.setState({ cell }) })
    }
    componentWillUnmount() {
        this._subscription && this._subscription.unsubscribe()
    }
    render() {
        const { cell } = this.state
        if (cell === null) {
            return null
        }
        const duration = Math.floor(cell.animation.duration / 100) / 10
        console.log(cell)
        const styles: React.CSSProperties = {
            top: cell.topPosition,
            left: cell.leftPosition,
            transition: `top ${duration}s linear, left ${duration}s linear`
        }

        return <div className='cell lift' style={styles}>

        </div>
    }

}



interface State {
    appState: AppState
}


export class RootView extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props)
        this.state = {
            appState: new AppState()
        }
    }
    onClickCell = (cell: CellViewModel) => {
        if (!cell.canPass) {
            return
        }
        this.state.appState.setTargetPosition(cell)
    }
    
    render() {
        const { appState } = this.state;

        return <div className='container'>
            <LiftCell cell={appState.liftCellState} />
            <F.div className='matrix'>
                {
                    appState.matrixForView.map(matrix => matrix.mapRow(row =>
                        <div className='matrix-row'>
                            {row.map(cell => <CellView onClick={this.onClickCell} cell={cell} />)}
                        </div>
                    ))
                }
            </F.div>
        </div>
    }
}