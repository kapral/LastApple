import environment from '../Environment';

export class MobileUtil {
    static formatAppUrl = () => `${environment.mobileAppSchema}?sessionId=${localStorage.getItem('SessionId')}`;
}