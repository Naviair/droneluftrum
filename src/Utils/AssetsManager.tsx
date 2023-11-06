import React, { FC } from 'react';
import { ImageStatic } from './Image';
const assets = require.context('../Assets',true);

export enum EAssetsType {
    SVG,
    IMG
}

export const AssetsManager: FC<{ path: string, type: EAssetsType, className?: string }> = (props) => {
    const fullPath = assets(`./${props.path}`);
    let returnObj;
    switch (props.type) {
        case EAssetsType.SVG:
            /**
             * TODO: need to be implemented
             */
            throw 'NOT YET IMPLEMENTED!'
            break;
        case EAssetsType.IMG:
            returnObj = <img src={fullPath.default} className={props.className} />
            break;
        default:
            break;
    }
    return (
        <>
            {returnObj}
        </>
    )
}