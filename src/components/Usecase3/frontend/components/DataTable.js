import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import TablePagination from '@mui/material/TablePagination';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
const DataTable = ({headers, data }) => {
  
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.common.black,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));
  
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  var bodyData = {}; 
  if (data.length > 0) {
    // Remove the header by slicing from the second row (index 1)
     bodyData = data.slice(1);
  }
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
    <TableContainer component={Paper}>
      <Table stickyHeader aria-label="simple table">
        <TableHead>
          <TableRow>
            {headers.map((header, index) => (
            <StyledTableCell key={index}>{header}</StyledTableCell>
          ))}
          </TableRow>
        </TableHead>
        <TableBody>

{data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
          
        
            <StyledTableRow key={index}>
            {row.map((cell, i) => (
               <StyledTableCell key={i}>{cell}</StyledTableCell>
            ))}
          </StyledTableRow>
          
        ))}
        </TableBody>
        
      </Table>
  </TableContainer>
  <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={data.length-1}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
  </Paper>
  );
};


export default DataTable;
