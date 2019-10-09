class Environment {
    isMobile = !!window.cordova;
    baseUrl =  this.isMobile ? 'https://last-apple-dev.azurewebsites.net/' : '/';
    mobileAppSchema = 'lastapple://';
}

export default new Environment();