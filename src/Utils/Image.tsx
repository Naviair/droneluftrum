import React, { FC } from 'react';

export const ImageStatic:FC<{path: string, className?: string}> = (props) => {
    const imgSrc = require(props.path);
    
    return (
        <img src={imgSrc} className={props.className} />
    )
}