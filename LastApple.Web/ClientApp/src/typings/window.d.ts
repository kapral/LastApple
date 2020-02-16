interface Window {
    cordova: any;
    handleOpenURL: (href: string) => void;
    SafariViewController: ISafariViewController;
}

interface ISafariViewController {
    show(options?: any): void;
    hide(): void;
}