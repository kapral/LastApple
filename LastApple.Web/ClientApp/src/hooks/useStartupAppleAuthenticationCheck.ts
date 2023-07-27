import React from "react";
import { useAppleContext } from "../apple/AppleContext";
import { checkAppleLogin } from "../apple/appleAuthentication";

export const useStartupAppleAuthenticationCheck = () => {
    const context = useAppleContext();

    React.useEffect(
        () => {
            (async () =>
                await checkAppleLogin(context.authentication)
            )();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );
};