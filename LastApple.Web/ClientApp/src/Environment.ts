class Environment {
    isMobile = !!window.cordova;
    baseUrl =  this.isMobile ? 'https://last-apple.azurewebsites.net/' : '/';
    mobileAppSchema = 'lastapple://';
}

export default new Environment();