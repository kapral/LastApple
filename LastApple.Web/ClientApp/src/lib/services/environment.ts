import { PUBLIC_API_URL } from '$env/static/public';

class Environment {
    apiUrl = PUBLIC_API_URL;
}

const environment = new Environment();

export default environment;
