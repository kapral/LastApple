interface Window {
    cordova: any;
    handleOpenURL: (href: string) => void;
    SafariViewController: ISafariViewController;
}

interface ISafariViewController {
    show(options?: any, callback?: (result: any) => void): void;
    hide(): void;
}