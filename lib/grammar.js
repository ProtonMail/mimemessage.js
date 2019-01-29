/**
 * Exported object.
 */
const grammar = {};
module.exports = grammar;
/**
 * Constants.
 */
// const REGEXP_CONTENT_TYPE = /^([^\t /]+)\/([^\t ;]+)(.*)$/;
const REGEXP_CONTENT_TRANSFER_ENCODING = /^([a-zA-Z0-9\-_]+)$/;
const REGEXP_PARAM_KEY = /[;| ][ \t|]*([^\t =]+)[ \t]*=[ \t]*/g;
const REGEXP_PARAM_VALUES = /[ \t]*([^"\t =]+|"([^"]*)")[ \t]*$/;

grammar.headerRules = {
    'Content-Type': {
        reg(value) {
            return value.split(';').reduce((acc, item) => {
                if (item.includes('/') && !item.includes('=')) {
                    const value = item.trim().toLowerCase();
                    const [ type, subtype ] = value.split('/');
                    acc.fulltype = value;
                    acc.type = type;
                    acc.subtype = subtype;
                    return acc;
                }

                if (item.match(REGEXP_PARAM_KEY)) {
                    acc.params = {
                        ...acc.params,
                        ...parseParams(item)
                    };
                }
                return acc;
            }, {
                params: {}
            });
        }
    },

    'Content-Disposition': {
        reg(value) {
            return {
                fulltype: value,
                params: parseParams(value)
            };
        }
    },

    'Content-Transfer-Encoding': {
        reg(value) {
            const match = value.split(';').find((value) => {
                return REGEXP_CONTENT_TRANSFER_ENCODING.test(value);
            });

            if (!match) {
                return undefined;
            }

            return {
                value: match.toLowerCase()
            };
        }
    }
};

grammar.unknownHeaderRule = {
    reg: /(.*)/,
    names: ['value']
};

grammar.headerize = function(string) {
    const exceptions = {
        'Mime-Version': 'MIME-Version',
        'Content-Id': 'Content-ID'
    };
    const name = string
        .toLowerCase()
        .replace(/_/g, '-')
        .split('-');
    const parts = name.length;

    let hname = '';
    let part;
    for (part = 0; part < parts; part++) {
        if (part !== 0) {
            hname += '-';
        }
        hname += name[part].charAt(0).toUpperCase() + name[part].substring(1);
    }

    if (exceptions[hname]) {
        hname = exceptions[hname];
    }

    return hname;
};

// Set sensible defaults to avoid polluting the grammar with boring details.

Object.keys(grammar.headerRules).forEach((name) => {
    const rule = grammar.headerRules[name];

    if (!rule.reg) {
        rule.reg = /(.*)/;
    }
});

/**
 * Private API.
 */
function parseParams(rawParams) {
    if (rawParams === '' || rawParams === undefined || rawParams === null) {
        return {};
    }
    const splittedParams = rawParams.split(REGEXP_PARAM_KEY);
    return splittedParams.slice(1).reduce((acc, key, i, list) => {
        if (!(i % 2)) {
            const values = (list[i + 1] || '').match(REGEXP_PARAM_VALUES) || [];
            acc[key.toLowerCase()] = values[2] || values[1];
        }
        return acc;
    }, Object.create(null));
}
