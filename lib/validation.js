'use strict'

module.exports = {
    isValid: (form) => {
        let isValid = true
        let cleanedData = {}
        let fields = form.querySelectorAll('input, textarea')
        Object.keys(fields).forEach((i) => {
            if (!fields[i].checkValidity()) {
                isValid = false
            }
            if (fields[i].name) {
                cleanedData[fields[i].name] = fields[i].value
            }
        })
        return isValid ? cleanedData : false
    },
}
