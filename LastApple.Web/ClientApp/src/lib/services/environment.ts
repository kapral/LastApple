import { PUBLIC_API_URL } from '$env/static/public';

class Environment {
    apiUrl = PUBLIC_API_URL;
    websiteUrl = 'https://lastream.net/'
}

const environment = new Environment();

export default environment;
