import React, { memo } from 'react';
import cn from 'classnames';
import { Button } from '@client/common';

export const PayableImport = memo(() => {
    return (
        <div className="absolute w-full flex justify-end pr-16 pt-2" >
            <Button>Import</Button>
        </div>
    );
});
