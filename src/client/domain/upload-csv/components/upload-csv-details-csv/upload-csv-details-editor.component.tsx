import React, { memo, useEffect, useState } from 'react';
import Spreadsheet from 'react-spreadsheet';
import { Icon, Text, Button } from '@client/common';
import { CSVColumn } from '@client/upload-csv';

export const CSVEditor = memo(() => {
    const data = [
        [{ value: "000001" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000002" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000003" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000004" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000005" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000006" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000007" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000008" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000001" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000002" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000003" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000004" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000005" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000006" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000007" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000008" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000001" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000002" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000003" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000004" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000005" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000006" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000007" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
        [{ value: "000008" }, { value: "US Foods USD" }, {value: "2020-06-15"}, {value: "2020-08-14"}, {value: "113038.00000"}, {value: "USD"}, {value: "1.26140"}, {value: "113038.00000"}],
    ];

    const columns = ['Invoice ID', 'Contact Name', 'Date', 'Due Date', 'Amount', 'Currency', 'Rate', 'Paid', 'ABCD', 'PQRS', 'LMNO', 'XYZW', 'HIJK', 'EFGH'];

    return (
        <div>
            <div className="flex flex-col overflow-x-hidden w-full mt-6">
                <div className="bg-white border border-gray-200 shadow-sm overflow-auto">
                    <Spreadsheet data={data} columnLabels={columns}/>
                </div>
                <div className="flex flex-col xl:flex-row mt-6 ml-0 md:ml-6">
                    <div className="flex flex-row items-end h-9 w-full">
                        {/* <div className="flex flex-col overflow-x-hidden w-full">
                            <div className="mt-6 md:mt-0 ml-0 md:ml-6">
                                {columns.map((columnName, index) => (
                                        <CSVColumn columnName={columnName} index={index}/>
                                    )
                                )}
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
});