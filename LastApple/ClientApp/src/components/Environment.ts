const base = document.getElementsByTagName('base')[0] as Element;

class Environment {
    baseUrl = base.getAttribute('href');
}

export default new Environment();