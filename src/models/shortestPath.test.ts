import {PriorityQueue} from './shortestPath'



describe("priority queue", ()=>{
    it("min queue works", ()=>{

        const queue = new PriorityQueue()

        const values = [ 2, 3, 5, 6, 1, 1, 2]

        for (const i of values) {
            queue.push(i, {})
        }

        const res = []

        while (!queue.isEmpty()) {
            res.push(queue.pop().val)
        }

        expect(res).toEqual([1,1,2,2,3,5,6])
    })
})