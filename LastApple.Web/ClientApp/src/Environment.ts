const isMobile = false;

class Environment {
    isMobile = isMobile;
    baseUrl =  isMobile ? 'https://last-apple-dev.azurewebsites.net/' : '/';
    mobileAppSchema = 'lastapple://';
}

export default new Environment();