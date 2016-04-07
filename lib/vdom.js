'use strict'

const initHelpers = require('./helpers')

/**
 * This is the mainfile for the virtual dom rendering engine. In this case
 * Ractivejs is used as an example, but this probably could be React as well.
 * @param {object} settings: the settings object for the browser.
 */
class VDom {

    constructor(options) {
        this.options = options
        Ractive.DEBUG = false
        this.validation = require('./validation')
        // The outer-most template in which all the magic happens.
    }


    /**
     * Init function takes care of loading components/templates and setting
     * up the renderer.
     */
    init() {
        return this.loadTemplates()
        .then(this.loadComponents.bind(this))
        .then(this.initRenderer.bind(this))
    }


    initRenderer() {
        h5.logger.debug(`[vdom] init ractivejs virtualdom`)
        this.helpers = Ractive.defaults.data
        // Global context variables within Ractive templates.
        Ractive.partials = this.templates
        if(!this.renderer) {
            initHelpers(Ractive.defaults.data)
            // Initialize components.
            let ractiveOptions = {
                components: this.components,
                data: {
                    settings: JSON.stringify(this.options),
                    current: 'blog-list',
                    context: {},
                },
            }
            if(h5.isBrowser) {
                ractiveOptions.template = this.templates['vdom-main']
                ractiveOptions.el = document.querySelector('main')
            } else {
                ractiveOptions.template = this.templates['vdom-index']
            }
            this.renderer = new Ractive(ractiveOptions)
        }
    }


    set(templateName, context) {
        return new Promise((resolve) => {
            this.renderer.set(context)
            this.renderer.resetPartial('vdom-page', h5.vdom.templates[templateName])
            resolve(this.renderer.toHTML({}))
        })
    }


    listeners() {
        // Set global currentNode variable.
        h5.network.on('network.currentNode', node => {
            this.renderer.set('currentNode', node)
        })
    }

    /**
     * Evaluate the templates that are used in headless mode.
     */
    loadTemplates() {
        h5.logger.debug(`[vdom] loading templates`)
        this.templates = {}
        return new Promise((resolve) => {

            if(h5.isHeadless) {
                let projectDir = this.options.headless.projectDir
                glob(path.join(projectDir, 'apps', '**', '*.html'), {matchBase: true}, (err, filePaths) => {
                    Promise.all(filePaths.map(r => fs.readFileAsync(r, 'utf8')))
                    .then(htmlData => {
                        htmlData.forEach((html, i) => {
                            let fileInfo = filePaths[i].replace(projectDir + '/', '').split(path.sep)
                            let templateName = fileInfo[1] + '-' + fileInfo[fileInfo.length - 1].replace('.html', '')
                            this.templates[templateName] = Ractive.parse(html)
                        })
                        // Write the templates to file, so the browser can use them
                        // as well. First set them to the GLOBAL namespace.
                        let templateFile = path.join('public', 'js', 'templates.js')
                        let templateData = 'window.templates=' + JSON.stringify(this.templates)
                        fs.readFileAsync(templateFile, 'utf8')
                        .then((content) => {
                            if(content !== templateData) {
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
                this.templates = GLOBAL.templates
                resolve(this.templates)
            }
        })
    }

    /**
     * A high5 application has an apps directory by convention(./apps/<app_name>)
     * High5 reads the app folder and tries to require a file called `views.js`.
     * It also adds the templates from <app_name>/templates and components from
     * <app_name/components to it's own namespace, e.g. h5.apps.<app_name>
     */
    loadComponents() {
        h5.logger.debug(`[vdom] loading components`)
        this.components = {}
        return new Promise((resolve) => {
            if(h5.isHeadless) {
                let projectDir = this.options.headless.projectDir
                let b = browserify({basedir: path.join(projectDir, 'lib')})
                let requireNames = []
                glob(path.join(projectDir, 'apps', '**', 'components', '*.js'), {matchBase: false}, (err, targets) => {
                    let componentFiles = targets.map((target) => target.replace(projectDir + '/', '')).map(target => target.split(path.sep))
                    componentFiles.forEach((componentFile) => {
                        // Load for node.js usage.
                        let componentName = componentFile[1] + '-' + componentFile[3].replace('.js', '')
                        let requireName = '../' + path.join('apps', componentFile[1], 'components', componentFile[3].replace('.js', ''))
                        // this.components[componentName] = require(requireName)(this.templates)
                        this.components[componentName] = require(requireName)(this.templates)
                        requireNames.push([componentName, requireName])
                        b.require(requireName)
                    })
                    let componentsFile = path.join('public', 'js', 'components.js')
                    var memStream = new MemoryStream()
                    b.bundle().pipe(memStream)
                    var data = ''
                    memStream.on('data', (chunk) => {
                        data += chunk.toString()
                    })
                    memStream.on('end', function() {
                        data = 'window._requires =' + JSON.stringify(requireNames) + ';' + data
                        fs.readFileAsync(componentsFile, 'utf8')
                        .then((content) => {
                            if(content !== data) {
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
            } else {
                _requires.forEach((_require) => {
                    this.components[_require[0]] = require(_require[1])(this.templates)
                })
                resolve(this.components)
            }
        })
    }
}

module.exports = VDom
