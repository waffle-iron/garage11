'use strict'

let graph = require('paths-js/dist/node/graph')
let tensionGraph

/**
 * An animated graph using path.js and requestAnimationFrame to set SVG
 * and to animate it.
 */
class TensionGraph {
    constructor(peer, component) {
        this.peer = peer
        this.moving = true
        this.stopTime = 3
        this.svgX = null
        this.svgY = null
        this.following = null
        // TODO: Find a way to use percentage width.
        this.graph = graph({data: this.data(), width: 300, height: 300, attraction: 15, repulsion: 20})
        peer.network.removeAllListeners('network.nodeAdded')
        peer.network.removeAllListeners('network.nodeDeleted')
        peer.network.on('network.nodeAdded', this.redraw.bind(this))
        peer.network.on('network.nodeDeleted', this.redraw.bind(this))

        /**
         * Dragging while mouse button pushed.
         */
        component.on('constrain', (e) => {
            // Select this node as currentNode.
            peer.network.setCurrentNode(peer.network.node(e.node.id))
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
        this.peer.network.graph.edges().forEach((edge) => {
            links.push({start: edge.v, end: edge.w, weight: 3 + 5 * Math.random()})
        })
        return {
            nodes: this.peer.network.graph.nodes(),
            links: links,
        }
    }


    start() {
        if (this.peer.isBrowser) {
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
        this.peer.vdom.renderer.set('graph', null)
        cancelAnimationFrame(this.frame)
    }


    /**
     * Called on each animation frame.
     */
    step() {
        this.peer.vdom.renderer.set('graph', this.graph.tick())
        if(this.moving) {
            this.frame = requestAnimationFrame(this.step.bind(this))
        } else {
            cancelAnimationFrame(this.frame)
        }
    }


    redraw() {
        this.graph = graph({data: this.data(), width: 800, height: 300, attraction: 15, repulsion: 20})
        if(this.peer.isBrowser) {
            cancelAnimationFrame(this.frame)
        }
        this.start()
    }
}


module.exports = (peer, templates) => {

    return Ractive.extend({
        isolated: false,
        twoway: false,
        template: templates['crowd-explorer'],
        onrender: function() {
            tensionGraph = new TensionGraph(peer, this)
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
                    let transport = peer.network.graph.edge(v, w)
                    if(typeof transport === 'string') {
                        return transport + ' indirect'
                    } else if(typeof transport === 'object') {
                        return transport.constructor.name
                    }
                },
                nodeType: (nodeId) => {
                    let cssClass
                    if(nodeId === peer.id) {
                        cssClass = 'peer'
                    } else {
                        cssClass = 'remote'
                    }
                    if(peer.network.node(nodeId).env.isBrowser) {
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
