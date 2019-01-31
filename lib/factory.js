/**
 * Expose the factory function.
 */
module.exports = factory;

/**
 * Dependencies.
 */
const debug = require('debug')('mimemessage:factory');
const debugerror = require('debug')('mimemessage:ERROR:factory');
const Entity = require('./Entity');

debugerror.log = console.warn.bind(console);

function buildEntity(data) {
    const entity = new Entity();

    // Add Content-Type.
    if (data.contentType) {
        entity.contentType(data.contentType);
    }

    // Add Content-Disposition.
    if (data.contentDisposition) {
        entity.contentDisposition(data.contentDisposition);
    }

    // Add Content-Transfer-Encoding.
    if (data.contentTransferEncoding) {
        entity.contentTransferEncoding(data.contentTransferEncoding);
    }

    // Add body.
    if (data.body) {
        entity.body = data.body;
    }

    return entity;
}

const formatKey = (key) => {
    if (key === 'contentTransfer') {
        return 'contentTransferEncoding';
    }
    return key;
};

function factory(data = {}) {
    debug('factory() | [data:%o]', data);

    const stringifyKey = ['contentType', 'contentDisposition', 'contentTransferEncoding'];

    /*
        Some keys can be an array, as headers are strings we parse them
        then we keep only the longest string.
        ex:
            "contentType": [
              "image/png; name=\"logo.png\"",
              "image/png"
            ],
        Output:
            "contentType": "image/png; name=\"logo.png\""

        Some key are also non-standard ex: contentTransfer instead of contentTransferEncoding, we format the key too.
     */
    const config = Object.keys(data).reduce((acc, item) => {
        const key = formatKey(item);
        if (stringifyKey.includes(key) && Array.isArray(data[item])) {
            acc[key] = data[item][0]; // BE convention is to do the first one
            return acc;
        }
        acc[key] = data[key];
        return acc;
    }, Object.create(null));

    return buildEntity(config);
}
