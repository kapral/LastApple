class Environment {
    isMobile = !!window.cordova;
    apiUrl =  'https://localhost:5001/';
    websiteUrl = 'https://localhost:5001/';
    mobileAppSchema = 'lastapple://';
}

export default new Environment();