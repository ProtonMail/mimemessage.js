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

function factory(data = {}) {
    debug('factory() | [data:%o]', data);

    if (Array.isArray(data.contentType)) {
        return data.contentType.map((type, i) => {

            const contentTransferEncoding = data.contentTransferEncoding || data.contentTransfer;
            const encoding = Array.isArray(contentTransferEncoding) ? contentTransferEncoding[i] : contentTransferEncoding;
            return buildEntity({
                ...data,
                contentType: type,
                contentTransferEncoding: encoding
            });
        });
    }

    return buildEntity(data);
}
