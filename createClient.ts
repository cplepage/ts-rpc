class Client<ApiDefinition> {
    protected api;

    constructor(api) {
        this.api = api;
    }

    private clone() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }

    get(): ApiDefinition {
        return this as any as ApiDefinition;
    }

    post(): ApiDefinition {
        const clone = this.clone();
        clone.method = 'POST';
        buildClientRecursive(clone, this.api, []);
        return clone;
    }

    put(): ApiDefinition {
        const clone = this.clone();
        clone.method = 'PUT';
        buildClientRecursive(clone, this.api, []);
        return clone;
    }

    delete(): ApiDefinition {
        const clone = this.clone();
        clone.method = 'DELETE';
        buildClientRecursive(clone, this.api, []);
        return clone;
    }
}

async function fetchCall(pathComponents, ...args) {
    const url = new URL(window.location.origin);

    url.pathname = '/' + pathComponents.join('/');

    const requestInit: RequestInit = {
        method: this.method ?? 'GET',
    };

    const argsName = pathComponents.reduce((api, key) => api[key], this.api);

    switch (requestInit.method) {
        case 'POST':
        case 'PUT': {
            const body = {};
            args.forEach((value, index) => body[argsName[index]] = value);
            requestInit.body = JSON.stringify(body);
            break;
        }
        default:
            args.forEach((value, index) => {
                url.searchParams.append(argsName[index], JSON.stringify(value));
            });
    }

    const response = await fetch(url.toString(), requestInit);

    return parseInt(response.headers.get('Content-Length'))
        ? response.json()
        : null;
}

function buildClientRecursive(instance, api, pathComponents, member?) {
    if (!member) member = instance;

    for (const key of Object.keys(api)) {
        if (Array.isArray(api[key])) {
            member[key] = fetchCall.bind(instance, [...pathComponents, key]);
        } else {
            member[key] = {};
            buildClientRecursive(instance, api[key], [...pathComponents, key], member[key]);
        }
    }
}

export default function <ApiDefinition>(api) {
    const client = new Client(api);
    buildClientRecursive(client, api, []);
    return client as ApiDefinition & Client<ApiDefinition>;
}
