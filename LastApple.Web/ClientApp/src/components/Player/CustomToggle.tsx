import * as React from "react";

export const CustomToggle = React.forwardRef((props: React.PropsWithChildren<{ onClick?: (e: React.MouseEvent) => void }>, ref: React.MutableRefObject<HTMLDivElement>) => (
    <div ref={ref} onClick={(e) => {
        e.preventDefault();
        if (props.onClick) {
            props.onClick(e);
        }
    }} style={{ cursor: 'pointer' }}>
        {props.children}
    </div>
));