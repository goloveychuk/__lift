interface NodeData {
    weight: number
}



export interface ShortestPathAlg<T extends NodeData> {
    // pathExists(): boolean
    findPath(matrix: GraphRepresentable<T>, from: T, to: T): T[] | undefined
}


export interface GraphRepresentable<T> {
    getKey(node: T): string | number
    getNeighbours(node: T): IterableIterator<T>
}


export class Dijkstra<T extends NodeData> implements ShortestPathAlg<T> {
    private tracebackPath(graph: GraphRepresentable<T>, _target: T, parents: Map<number | string, T>) {
        const path: T[] = []
        let target: T | undefined = _target
        while (target) {
            path.push(target)
            target = parents.get(graph.getKey(target))
        }
        return path.reverse()
    }

    findPath(graph: GraphRepresentable<T>, source: T, target: T): T[] | undefined {

        const queue = new PriorityQueue<T>()

        const visited = new Set<number | string>()
        const parents = new Map<number | string, T>()

        const dist = new Map<number | string, number>()

        const targetKey = graph.getKey(target)
        dist.set(targetKey, 0.0)

        queue.push(0, source)

        while (!queue.isEmpty()) {
            const current = queue.pop().data
            const curKey = graph.getKey(current)

            if (curKey === targetKey) {
                return this.tracebackPath(graph, target, parents)
            }

            visited.add(curKey)


            
            for (const v of graph.getNeighbours(current)) {
                
                const vKey = graph.getKey(v)

                if (visited.has(vKey)) {
                    continue
                }
                let newWeight = dist.get(curKey) || 0 + v.weight

                if (newWeight < (dist.get(vKey) || Infinity)) {
                    parents.set(vKey, current)
                    dist.set(vKey, newWeight)
                    queue.push(v.weight, v)
                }

            }
        }
        return undefined
    }

}





type Comparator = (a: number, b: number) => boolean

export class PriorityQueue<T> {
    private comparator: Comparator
    private heap: { val: number, data: T }[]
    constructor(comparator: Comparator = (a, b) => a < b) {
        this.heap = [];
        this.comparator = comparator;
    }

    parent = (i: number) => Math.floor(i / 2)
    left = (i: number) => 2 * i + 1
    right = (i: number) => 2 * i + 2

    size() {
        return this.heap.length;
    }
    isEmpty() {
        return this.size() == 0;
    }
    peek() {
        return this.heap[0];
    }
    push(val: number, data: T) {
        this.heap.push({ val, data });
        this.siftUp();
    }
    pop() {
        const poppedValue = this.peek();
        const bottom = this.size() - 1;
        if (bottom > 0) {
            this.swap(0, bottom);
        }
        this.heap.pop();
        this.siftDown();
        return poppedValue;
    }

    private greater(i: number, j: number) {
        return this.comparator(this.heap[i].val, this.heap[j].val);
    }
    private swap(i: number, j: number) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
    private siftUp() {
        let node = this.size() - 1;
        while (node > 0 && this.greater(node, this.parent(node))) {
            this.swap(node, this.parent(node));
            node = this.parent(node);
        }
    }

    private siftDown() {
        let node = 0;
        while (
            (this.left(node) < this.size() && this.greater(this.left(node), node)) ||
            (this.right(node) < this.size() && this.greater(this.right(node), node))
        ) {
            let maxChild = (this.right(node) < this.size() && this.greater(this.right(node), this.left(node))) ? this.right(node) : this.left(node);
            this.swap(node, maxChild);
            node = maxChild;
        }
    }
}
