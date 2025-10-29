import React, { memo } from 'react';
import { map } from 'lodash';
import { Icon, Checkbox } from '@client/common';
import { Droppable, Draggable } from 'react-beautiful-dnd';

export const PlanTable = memo(({ cols, rows, onSelect, onBasket, name, type, extraColumns = [], renderExtraColumns, droppableId, sortColumns, columns, draggable = true }: any) => {
    // @TODO: Need designs for Invoice Table error state
    // if (isError) {
    //     return (
    //         <div className="h-32 w-full flex items-center justify-center">
    //             <Text className="text-lg" variant="gray">
    //                 Oh no! Looks like something went wrong when loading that month of invoices...
    //             </Text>
    //         </div>
    //     );
    // }

    const selectRow = (row: any, type: number) => {
        return onSelect(row.invoiceId, type)
    }


    return (
        <div className="w-full flex flex-col" data-testid="flnc-invoice-table">
            <div className="w-full align-middle inline-block min-w-full">
                <div className="w-full shadow border-b border-gray-200 sm:rounded-lg overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200 border-collapse font-medium overflow-hidden">
                        <thead className="bg-gray-50">
                            <tr>
                                {!columns ? <>
                                    <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        #
                                </td>
                                    <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
                                        Invoice number
                                </td>
                                    <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
                                        <button className="text-xs font-medium uppercase" onClick={() => sortColumns("contactName")}>BENE ▲</button>
                                    </td>
                                    <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button className="text-xs font-medium uppercase" onClick={() => sortColumns("total")}>Payable amount ▲</button>
                                    </td>
                                    <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button className="text-xs font-medium uppercase" onClick={() => sortColumns("date")}>Invoice Date ▲</button>
                                    </td>
                                    <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button className="text-xs font-medium uppercase" onClick={() => sortColumns("dateDue")}>Due Date ▲</button>
                                    </td>
                                </> :
                                    columns.map(column => {
                                        return (
                                            <td key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
                                                {column.label}
                                            </td>
                                        )
                                    })
                                }

                                {extraColumns.map(obj => {
                                    return (
                                        <td key={obj.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {obj.label}
                                        </td>
                                    );
                                })}
                            </tr>
                        </thead>

                        {draggable ? <Droppable droppableId={droppableId}>
                            {(provided) => (
                                <tbody {...provided.droppableProps} ref={provided.innerRef}>
                                    {map(rows, (row, index) => {
                                        return <Draggable
                                            draggableId={row.invoiceId}
                                            index={index}
                                            key={`${row.invoiceId}_${row.invoiceNumber}`}
                                        >
                                            {(provided) => (
                                                <tr
                                                    className="bg-white border-t border-gray-400 hover:bg-gray-100 cursor-pointer"
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <td className="whitespace-nowrap text-xs py-4 flex-grow-0 md:flex-grow px-6 text-gray-500 cursor-grab">
                                                        {/* <Icon className="text-gray-900" icon="menu" /> */}
                                                        <Checkbox name={row.id} checked={row.isAddedToBucket} onChange={() => {
                                                            selectRow(row, type)
                                                        }} />
                                                    </td>

                                                    <td className="whitespace-nowrap text-xs py-4 flex-grow-0 md:flex-grow px-6 text-gray-500">{row.InvoiceNumber}</td>

                                                    <td className="whitespace-nowrap text-xs py-4 flex-grow-0 md:flex-grow px-6 text-gray-500">{row.contactName}</td>

                                                    <td className="whitespace-nowrap text-xs py-4 flex-grow-0 md:flex-grow px-6 text-gray-500">{row.currencyCode} ${(Math.round(row.total * 100) / 100).toFixed(2)}&nbsp;&nbsp;</td>

                                                    <td className="whitespace-nowrap text-xs py-4 flex-grow-0 md:flex-grow px-6 text-gray-500"> {row.date}</td>

                                                    <td className="whitespace-nowrap text-xs py-4 flex-grow-0 md:flex-grow px-6 text-gray-500"> {row.dateDue}</td>
                                                    {extraColumns.map(o => {
                                                        return renderExtraColumns(row, o.key);
                                                    })}
                                                    {provided.placeholder}
                                                </tr>
                                            )}
                                        </Draggable>
                                    })}
                                    {provided.placeholder}
                                </tbody>
                            )}
                        </Droppable> :
                            <tbody>
                                {rows.map(record => {
                                    return (
                                        <tr className="bg-white border-t border-gray-400 hover:bg-gray-100">{
                                            columns.map(column => {
                                                return (
                                                    <td key={column.key} className="whitespace-nowrap text-xs py-4 flex-grow-0 md:flex-grow px-6 text-gray-500" >
                                                        {column.onRender ? column.onRender(record[column.key]) : record[column.key]}
                                                    </td>
                                                )
                                            })
                                        }
                                        </tr>
                                    )
                                })}
                            </tbody>
                        }
                    </table>
                </div>
            </div>
        </div>
    );
});
