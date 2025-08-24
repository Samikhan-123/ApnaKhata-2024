// import React from 'react';
// import { Pagination, InputGroup, Form, Button } from 'react-bootstrap';

// const PaginationComponent = ({
//   pagination,
//   onPageChange,
//   goToPage,
//   setGoToPage,
// }) => {
//   if (!pagination || pagination.totalPages <= 1) return null;

//   const { currentPage, totalPages, totalRecords, itemsPerPage } = pagination;
//   const pages = [];
//   const maxVisiblePages = 5;
//   let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
//   let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

//   if (endPage - startPage + 1 < maxVisiblePages) {
//     startPage = Math.max(1, endPage - maxVisiblePages + 1);
//   }

//   // Add pagination items
//   if (startPage > 1) {
//     pages.push(
//       <Pagination.Item key={1} onClick={() => onPageChange(1)}>
//         1
//       </Pagination.Item>
//     );
//     if (startPage > 2) {
//       pages.push(<Pagination.Ellipsis key="ellipsis-start" />);
//     }
//   }

//   for (let page = startPage; page <= endPage; page++) {
//     pages.push(
//       <Pagination.Item
//         key={page}
//         active={currentPage === page}
//         onClick={() => onPageChange(page)}
//       >
//         {page}
//       </Pagination.Item>
//     );
//   }

//   if (endPage < totalPages) {
//     if (endPage < totalPages - 1) {
//       pages.push(<Pagination.Ellipsis key="ellipsis-end" />);
//     }
//     pages.push(
//       <Pagination.Item
//         key={totalPages}
//         onClick={() => onPageChange(totalPages)}
//       >
//         {totalPages}
//       </Pagination.Item>
//     );
//   }

//   return (
//     <div className="d-flex flex-column align-items-center mt-4">
//       <Pagination>
//         <Pagination.First
//           disabled={currentPage === 1}
//           onClick={() => onPageChange(1)}
//         />
//         <Pagination.Prev
//           disabled={currentPage === 1}
//           onClick={() => onPageChange(currentPage - 1)}
//         />
//         {pages}
//         <Pagination.Next
//           disabled={currentPage === totalPages}
//           onClick={() => onPageChange(currentPage + 1)}
//         />
//         <Pagination.Last
//           disabled={currentPage === totalPages}
//           onClick={() => onPageChange(totalPages)}
//         />
//       </Pagination>
//       <div className="d-flex align-items-center my-3">
//         <small className="text-muted me-3">
//           Showing {currentPage} of {totalPages} pages ({itemsPerPage} items out of {totalRecords})
//         </small>
//         <InputGroup>
//           <Form.Control
//             type="number"
//             min="1"
//             max={totalPages}
//             value={goToPage}
//             onChange={(e) => setGoToPage(e.target.value)}
//             placeholder="Go to page"
//             style={{ width: '100px' }}
//           />
//           <Button
//             variant="outline-secondary"
//             onClick={() => {
//               const page = Number(goToPage);
//               if (page >= 1 && page <= totalPages) {
//                 onPageChange(page);
//                 setGoToPage('');
//               }
//             }}
//             disabled={!goToPage || isNaN(goToPage) || goToPage < 1 || goToPage > totalPages}
//           >
//             Go
//           </Button>
//         </InputGroup>
//       </div>
//     </div>
//   );
// };
// export default PaginationComponent;