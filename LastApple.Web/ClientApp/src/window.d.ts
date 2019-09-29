declare global {
    interface Window {
        cordova: any;
        handleOpenURL: (href: string) => void;
    }
}