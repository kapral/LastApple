import * as React from "react";

export const CustomToggle = React.forwardRef((props: React.PropsWithChildren<{}>, ref: React.MutableRefObject<HTMLDivElement>) => (
    <div ref={ref} onClick={(e) => {
        e.preventDefault();
        // @ts-ignore
        props.onClick(e);
    }} style={{ cursor: 'pointer' }}>
        {props.children}
    </div>
));