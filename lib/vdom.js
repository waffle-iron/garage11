'use strict'

const initHelpers = require('./helpers')

/**
 * This is the mainfile for the virtual dom rendering engine. Garage11
 * uses RActive.js, but this can be done with any virtual
 * DOM engine that supports rendering to a string (e.g. ReactJS).
 *
 * @param {object} settings: the settings object for the browser.
 */
class VDom {

    constructor(peer) {
        this.peer = peer
        this.validation = require('./validation')
    }


    get name() {
        return `${this.peer.name} [lib-vdom]`
    }


    /**
     * Init function takes care of loading components/templates and setting
     * up the renderer.
     */
    init() {
        return this.loadTemplates()
        .then(() => {
            if (this.peer.isHeadless) return this.loadIndex()
        })
        .then(this.loadComponents.bind(this))
        .then(this.initRenderer.bind(this))
    }


    initRenderer() {
        this.peer.logger.info(`${this.name} init virtualdom (ractivejs)`)
        this.helpers = Ractive.defaults.data
        // Global context variables within Ractive templates.
        Ractive.DEBUG = false
        Ractive.partials = this.templates

        initHelpers(Ractive.defaults.data)
        this.renderer = new Ractive({
            components: this.components,
            data: {
                peer: this.peer,
                currentNode: this.peer.network.currentNode.serialized,
            },
            el: 'main',
            enhance: true,  // Do a best effort to reuse the existing DOM.
            template: this.templates['vdom-main'],
        })

        if (this.peer.isBrowser) {
            this.events()
        }
    }


    events() {
        // Event delegation for A and BUTTON clicks.
        document.querySelector('html').addEventListener('click', e => {
            e.preventDefault()
            if (e.target.className === 'js-close') {
                document.querySelector('.vdom-dialog').close()
            }
        })
    }


    /**
     * Set the context of a partial page.
     */
    set(templateName, context, partial = 'vdom-page') {
        context.page = templateName

        this.renderer.resetPartial(partial, this.peer.vdom.templates[templateName])
        this.renderer.set(context)

        // Node.js rendering also includes the html/head/script/body tags.
        if (this.peer.isHeadless) {
            return this.index.replace('{{{html}}}', this.renderer.toHTML())
        }
        return this.renderer.toHTML()
    }


    /**
     * The browser's wrapper around the vdom part.
     */
    loadIndex() {
        if (this.index) {
            return this.index
        }
        return fs.readFileAsync('./apps/vdom/templates/index.tpl', 'utf8')
        .then((file) => {
            this.index = file.replace('{{{settings}}}', JSON.stringify(this.peer.settings))
        })
    }


    /**
     * Evaluate the templates that are used in headless mode.
     */
    loadTemplates() {
        this.peer.logger.debug(`${this.name} loading templates`)
        this.templates = {}
        return new Promise((resolve) => {
            if (this.peer.isHeadless) {
                let projectDir = this.peer.settings.headless.projectDir
                glob(path.join(projectDir, 'apps', '**', '{*.html,!browser_wrapper.html}'), {matchBase: true}, (err, filePaths) => {
                    Promise.all(filePaths.map(r => fs.readFileAsync(r, 'utf8')))
                    .then(htmlData => {
                        htmlData.forEach((html, i) => {
                            let fileInfo = filePaths[i].replace(projectDir + '/', '').split(path.sep)
                            let templateName = fileInfo[1] + '-' + fileInfo[fileInfo.length - 1].replace('.html', '')
                            this.templates[templateName] = Ractive.parse(html, {csp: true})
                        })
                        // Write the templates to file, so the browser can use them
                        // as well. First set them to the global namespace.
                        let templateFile = path.join('public', 'js', 'templates.js')
                        let templateData = 'window.templates=' + JSON.stringify(this.templates)
                        fs.readFileAsync(templateFile, 'utf8')
                        .then((content) => {
                            if (content !== templateData) {
                                fs.writeFileAsync(templateFile, templateData)
                                .then(() => {
                                    resolve(this.templates)
                                })
                            } else {
                                resolve(this.templates)
                            }
                        })
                    })
                })
            } else {
                this.templates = global.templates
                resolve(this.templates)
            }
        })
    }


    /**
     * A higthis.peer application has an apps directory by convention(./apps/<app_name>)
     * Higthis.peer reads the app folder and tries to require a file called `views.js`.
     * It also adds the templates from <app_name>/templates and components from
     * <app_name/components to it's own namespace, e.g. this.peer.apps.<app_name>
     */
    loadComponents() {
        this.peer.logger.debug(`${this.name} loading components`)
        this.components = {}
        return new Promise((resolve) => {
            if (this.peer.isBrowser) {
                window._requires.forEach((_require) => {
                    this.components[_require[0]] = require(_require[1])(this.peer, this.templates)
                })
                resolve(this.components)
            } else {
                const projectDir = this.peer.settings.headless.projectDir
                const b = browserify({basedir: path.join(projectDir, 'lib')})
                let requireNames = []
                glob(path.join(projectDir, 'apps', '**', 'components', '*.js'), {matchBase: false}, (err, targets) => {
                    let componentFiles = targets.map((target) => target.replace(projectDir + '/', '')).map(target => target.split(path.sep))
                    componentFiles.forEach((componentFile) => {
                        // Load for node.js usage.
                        const componentName = componentFile[1] + '-' + componentFile[3].replace('.js', '')
                        const requireName = '../' + path.join('apps', componentFile[1], 'components', componentFile[3].replace('.js', ''))
                        // this.components[componentName] = require(requireName)(this.templates)
                        this.components[componentName] = require(requireName)(this.peer, this.templates)
                        requireNames.push([componentName, requireName])
                        b.require(requireName)
                    })
                    const componentsFile = path.join('public', 'js', 'components.js')
                    const memStream = new MemoryStream()
                    b.bundle().pipe(memStream)
                    let data = ''
                    memStream.on('data', (chunk) => {
                        data += chunk.toString()
                    })
                    memStream.on('end', function() {
                        data = 'window._requires =' + JSON.stringify(requireNames) + ';' + data
                        fs.readFileAsync(componentsFile, 'utf8')
                        .then((content) => {
                            if (content !== data) {
                                fs.writeFileAsync(componentsFile, data)
                                .then(() => {
                                    resolve(this.components)
                                })
                            } else {
                                resolve(this.components)
                            }
                        })
                    })
                })
            }
        })
    }
}

module.exports = VDom
