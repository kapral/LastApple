class Environment {
    isMobile = !!window.cordova;
    apiUrl =  'https://last-apple.azurewebsites.net/';
    websiteUrl = 'https://lastream.net/';
    mobileAppSchema = 'lastapple://';
}

export default new Environment();