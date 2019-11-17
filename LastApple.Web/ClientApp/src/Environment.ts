class Environment {
    isMobile = !!window.cordova;
    baseUrl =  'https://last-apple.azurewebsites.net/';
    mobileAppSchema = 'lastapple://';
}

export default new Environment();