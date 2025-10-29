import React from 'react';
import { action } from '@storybook/addon-actions';
import { TableContainer } from './table-container.component';
import { Table } from './table.component';
import { Tbody } from './tbody.component';
import { Td } from './td.component';
import { Th } from './th.component';
import { Thead } from './thead.component';
import { Tr } from './tr.component';

export default {
  title: 'Components/Table',
  component: Table,
};

export const Index = () => (
  <>
    <TableContainer>
      <Table>
        <Thead>
          <Th>First Column</Th>
          <Th>Second Column</Th>
          <Th>Third Column</Th>
        </Thead>
        <Tbody>
          <Tr>
            <Td>First value</Td>
            <Td>Second value</Td>
            <Td>Third value</Td>
          </Tr>
          <Tr onClick={() => action('Clicked!')}>
            <Td>Clickable first value</Td>
            <Td>Clickable second value</Td>
            <Td>Clickable third value</Td>
          </Tr>
        </Tbody>
      </Table>
    </TableContainer>
  </>
);
