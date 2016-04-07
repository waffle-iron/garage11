'use strict'

let graph = require('paths-js/dist/node/graph')
let tensionGraph

/**
 * An animated graph using path.js and requestAnimationFrame to set SVG
 * and to animate it.
 */
class TensionGraph {
    constructor(component) {
        this.moving = true
        this.stopTime = 3
        this.svgX = null
        this.svgY = null
        this.following = null
        // TODO: Find a way to use percentage width.
        this.graph = graph({data: this.data(), width: 300, height: 300, attraction: 15, repulsion: 20})
        h5.network.removeAllListeners('network.nodeAdded')
        h5.network.removeAllListeners('network.nodeDeleted')
        h5.network.on('network.nodeAdded', this.redraw.bind(this))
        h5.network.on('network.nodeDeleted', this.redraw.bind(this))

        /**
         * Dragging while mouse button pushed.
         */
        component.on('constrain', (e) => {
            // Select this node as currentNode.
            h5.network.setCurrentNode(h5.network.node(e.node.id))
            this.moving = true
            this.target = e.original.target
            this.svgX = e.original.clientX - this.target.cx.baseVal.value
            this.svgY = e.original.clientY - this.target.cy.baseVal.value
            // The element to follow.
            this.following = e.context.item
            this.start()
        })

        /**
         * Mouse event of moving over the component.
         */
        component.on('move', (e) => {
            if (this.following === null) {
                return null
            }
            if (e.original.button !== 0) {
                this.stop()
                return null
            }
            let coordinates = [e.original.clientX - this.svgX, e.original.clientY - this.svgY]
            this.graph.constrain(this.following, coordinates)
        })

        /**
         * Clear dragging when releasing the mouse button.
         */
        component.on('unconstrain', () => {
            this.graph.unconstrain(this.following)
            this.following = null
            this.stop()
        })
    }


    /**
     * Converts between high5's graphlib and path.js internal graph
     * representation.
     */
    data() {
        let links = []
        h5.network.graph.edges().forEach((edge) => {
            links.push({start: edge.v, end: edge.w, weight: 3 + 5 * Math.random()})
        })
        return {
            nodes: h5.network.graph.nodes(),
            links: links,
        }
    }


    start() {
        if(h5.isBrowser) {
            this.frame = requestAnimationFrame(this.step.bind(this))
        }
    }


    stop() {
        cancelAnimationFrame(this.frame)
    }


    teardown(component) {
        component.off('constrain')
        component.off('move')
        component.off('unconstrain')
        // Keep moving state true for stopTime seconds.
        h5.vdom.renderer.set('graph', null)
        cancelAnimationFrame(this.frame)
    }


    /**
     * Called on each animation frame.
     */
    step() {
        h5.vdom.renderer.set('graph', this.graph.tick())
        if(this.moving) {
            this.frame = requestAnimationFrame(this.step.bind(this))
        } else {
            cancelAnimationFrame(this.frame)
        }
    }


    redraw() {
        this.graph = graph({data: this.data(), width: 800, height: 300, attraction: 15, repulsion: 20})
        if(h5.isBrowser) {
            cancelAnimationFrame(this.frame)
        }
        this.start()
    }
}


module.exports = (templates) => {

    return Ractive.extend({
        isolated: false,
        twoway: false,
        template: templates['crowd-explorer'],
        onrender: function() {
            tensionGraph = new TensionGraph(this)
            tensionGraph.start()
        },
        onteardown: function() {
            if(tensionGraph) {
                tensionGraph.teardown(this)
            }
        },
        data: function() {
            return {
                edgeType: (v, w) => {
                    let transport = h5.network.graph.edge(v, w)
                    if(typeof transport === 'string') {
                        return transport + ' indirect'
                    } else if(typeof transport === 'object') {
                        return transport.constructor.name
                    }
                },
                nodeType: (nodeId) => {
                    let cssClass
                    if(nodeId === h5.id) {
                        cssClass = 'peer'
                    } else {
                        cssClass = 'remote'
                    }
                    if(h5.network.node(nodeId).env.isBrowser) {
                        cssClass += ' browser'
                    } else {
                        cssClass += ' headless'
                    }
                    return cssClass
                },
            }
        },
    })
}
