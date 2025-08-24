// // PersonalExpenses.jsx
// import React, { useState, useEffect } from "react";
// import {
//   Button,
//   Card,
//   Form,
//   Row,
//   Col,
//   Alert,
//   Pagination,
//   Badge,
// } from "react-bootstrap";
// import { FaEdit, FaTrash, FaPlus, FaFilter } from "react-icons/fa";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import { useAuth } from "../auth/AuthContext";
// import ExpenseTable from "./ExpenseCard";

// const PersonalExpenses = () => {
//   const { user } = useAuth();

//   // State for expenses and UI
//   const [personalExpenses, setPersonalExpenses] = useState([]);
//   const [filteredExpenses, setFilteredExpenses] = useState([]);
//   const [displayedExpenses, setDisplayedExpenses] = useState([]);
//   const [newExpense, setNewExpense] = useState({
//     amount: "",
//     description: "",
//     category: "",
//     paymentMethod: "",
//     tags: "",
//   });
//   const [editingExpense, setEditingExpense] = useState(null);

//   // Filter and pagination state
//   const [filters, setFilters] = useState({
//     search: "",
//     category: "",
//     paymentMethod: "",
//     startDate: "",
//     endDate: "",
//   });
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 15;

//   // Load expenses from localStorage on component mount
//   useEffect(() => {
//     const saved = localStorage.getItem("personalExpenses");
//     if (saved) {
//       const parsedExpenses = JSON.parse(saved);
//       setPersonalExpenses(parsedExpenses);
//       setFilteredExpenses(parsedExpenses);
//     }
//   }, []);

//   // Save expenses to localStorage when they change
//   useEffect(() => {
//     localStorage.setItem("personalExpenses", JSON.stringify(personalExpenses));
//   }, [personalExpenses]);

//   // Apply filters and pagination when expenses or filters change
//   useEffect(() => {
//     // Filter expenses based on search and filter criteria
//     let results = personalExpenses.filter(
//       (expense) => expense.userId === user.id
//     );

//     // Apply search filter (search in description and tags)
//     if (filters.search) {
//       const searchTerm = filters.search.toLowerCase();
//       results = results.filter(
//         (expense) =>
//           (expense.description &&
//             expense.description.toLowerCase().includes(searchTerm)) ||
//           (expense.tags &&
//             expense.tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
//       );
//     }

//     // Apply category filter
//     if (filters.category) {
//       results = results.filter(
//         (expense) => expense.category === filters.category
//       );
//     }

//     // Apply payment method filter
//     if (filters.paymentMethod) {
//       results = results.filter(
//         (expense) => expense.paymentMethod === filters.paymentMethod
//       );
//     }

//     // Apply date range filter
//     if (filters.startDate) {
//       const startDate = new Date(filters.startDate);
//       results = results.filter(
//         (expense) => new Date(expense.date) >= startDate
//       );
//     }

//     if (filters.endDate) {
//       const endDate = new Date(filters.endDate);
//       endDate.setHours(23, 59, 59, 999); // Include the entire end day
//       results = results.filter((expense) => new Date(expense.date) <= endDate);
//     }

//     setFilteredExpenses(results);
//     setCurrentPage(1); // Reset to first page when filters change
//   }, [personalExpenses, filters, user.id]);

//   // Apply pagination to filtered expenses
//   useEffect(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;
//     setDisplayedExpenses(filteredExpenses.slice(startIndex, endIndex));
//   }, [filteredExpenses, currentPage]);

//   // Get unique categories and payment methods for filter dropdowns
//   const categories = [
//     ...new Set(
//       personalExpenses
//         .filter((expense) => expense.category)
//         .map((expense) => expense.category)
//     ),
//   ];

//   const paymentMethods = [
//     ...new Set(
//       personalExpenses
//         .filter((expense) => expense.paymentMethod)
//         .map((expense) => expense.paymentMethod)
//     ),
//   ];

//   // Calculate total pages for pagination
//   const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

//   // Handle adding a new expense
//   const handleAddPersonalExpense = () => {
//     if (newExpense.amount && newExpense.description) {
//       const tags = newExpense.tags
//         ? newExpense.tags
//             .split(",")
//             .map((tag) => tag.trim())
//             .filter((tag) => tag)
//         : [];

//       const expense = {
//         ...newExpense,
//         id: Date.now(),
//         date: new Date().toISOString(),
//         userId: user.id,
//         tags: tags,
//       };

//       setPersonalExpenses((prev) => [...prev, expense]);
//       setNewExpense({
//         amount: "",
//         description: "",
//         category: "",
//         paymentMethod: "",
//         tags: "",
//       });
//     }
//   };

//   // Handle editing an expense
//   const handleEditPersonalExpense = (expense) => {
//     setEditingExpense(expense);
//     setNewExpense({
//       amount: expense.amount,
//       description: expense.description,
//       category: expense.category || "",
//       paymentMethod: expense.paymentMethod || "",
//       tags: expense.tags ? expense.tags.join(", ") : "",
//     });
//   };

//   // Handle updating an expense
//   const handleUpdatePersonalExpense = () => {
//     if (!editingExpense) return;

//     const tags = newExpense.tags
//       ? newExpense.tags
//           .split(",")
//           .map((tag) => tag.trim())
//           .filter((tag) => tag)
//       : [];

//     setPersonalExpenses((prev) =>
//       prev.map((exp) =>
//         exp.id === editingExpense.id
//           ? {
//               ...exp,
//               ...newExpense,
//               date: new Date().toISOString(),
//               tags: tags,
//             }
//           : exp
//       )
//     );

//     setEditingExpense(null);
//     setNewExpense({
//       amount: "",
//       description: "",
//       category: "",
//       paymentMethod: "",
//       tags: "",
//     });
//   };

//   // Handle deleting an expense
//   const handleDeletePersonalExpense = (expense) => {
//     confirmAlert({
//       title: "Confirm Deletion",
//       message: "Are you sure you want to delete this personal expense?",
//       buttons: [
//         {
//           label: "Yes",
//           onClick: () => {
//             setPersonalExpenses((prev) =>
//               prev.filter((exp) => exp.id !== expense.id)
//             );
//             if (editingExpense && editingExpense.id === expense.id) {
//               setEditingExpense(null);
//               setNewExpense({
//                 amount: "",
//                 description: "",
//                 category: "",
//                 paymentMethod: "",
//                 tags: "",
//               });
//             }
//           },
//         },
//         {
//           label: "No",
//           onClick: () => {},
//         },
//       ],
//     });
//   };

//   // Handle filter changes
//   const handleFilterChange = (filterName, value) => {
//     setFilters((prev) => ({
//       ...prev,
//       [filterName]: value,
//     }));
//   };

//   // Clear all filters
//   const clearFilters = () => {
//     setFilters({
//       search: "",
//       category: "",
//       paymentMethod: "",
//       startDate: "",
//       endDate: "",
//     });
//   };

//   // Generate pagination items
//   const paginationItems = [];
//   for (let number = 1; number <= totalPages; number++) {
//     paginationItems.push(
//       <Pagination.Item
//         key={number}
//         active={number === currentPage}
//         onClick={() => setCurrentPage(number)}
//       >
//         {number}
//       </Pagination.Item>
//     );
//   }

//   return (
//     <div className="personal-expenses-container">
//       <Card className="shadow-sm">
//         <Card.Body>
//           <Card.Title as="h3" className="mb-4 d-flex align-items-center">
//             <FaPlus className="me-2" /> Personal Expenses
//             <Badge bg="secondary" className="ms-2">
//               {filteredExpenses.length} expenses
//             </Badge>
//           </Card.Title>

//           {/* Filters Section */}
//           <Card className="mb-4 filter-card">
//             <Card.Header className="d-flex align-items-center">
//               <FaFilter className="me-2" /> Filters
//               <Button
//                 variant="outline-secondary"
//                 size="sm"
//                 className="ms-auto"
//                 onClick={clearFilters}
//               >
//                 Clear Filters
//               </Button>
//             </Card.Header>
//             <Card.Body>
//               <Row className="g-3">
//                 {/* Search Input */}
//                 <Col md={6} lg={3}>
//                   <Form.Label>Search</Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="Search descriptions or tags..."
//                     value={filters.search}
//                     onChange={(e) =>
//                       handleFilterChange("search", e.target.value)
//                     }
//                   />
//                 </Col>

//                 {/* Category Filter */}
//                 <Col md={6} lg={3}>
//                   <Form.Label>Category</Form.Label>
//                   <Form.Select
//                     value={filters.category}
//                     onChange={(e) =>
//                       handleFilterChange("category", e.target.value)
//                     }
//                   >
//                     <option value="">All Categories</option>
//                     {categories.map((category) => (
//                       <option key={category} value={category}>
//                         {category}
//                       </option>
//                     ))}
//                   </Form.Select>
//                 </Col>

//                 {/* Payment Method Filter */}
//                 <Col md={6} lg={3}>
//                   <Form.Label>Payment Method</Form.Label>
//                   <Form.Select
//                     value={filters.paymentMethod}
//                     onChange={(e) =>
//                       handleFilterChange("paymentMethod", e.target.value)
//                     }
//                   >
//                     <option value="">All Methods</option>
//                     {paymentMethods.map((method) => (
//                       <option key={method} value={method}>
//                         {method}
//                       </option>
//                     ))}
//                   </Form.Select>
//                 </Col>

//                 {/* Date Range Filters */}
//                 <Col md={6} lg={3}>
//                   <Form.Label>Start Date</Form.Label>
//                   <Form.Control
//                     type="date"
//                     value={filters.startDate}
//                     onChange={(e) =>
//                       handleFilterChange("startDate", e.target.value)
//                     }
//                   />
//                 </Col>

//                 <Col md={6} lg={3}>
//                   <Form.Label>End Date</Form.Label>
//                   <Form.Control
//                     type="date"
//                     value={filters.endDate}
//                     onChange={(e) =>
//                       handleFilterChange("endDate", e.target.value)
//                     }
//                   />
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>

//           {/* Add/Edit Expense Form */}
//           <Card className="mb-4">
//             <Card.Header>
//               {editingExpense ? "Edit Expense" : "Add New Expense"}
//             </Card.Header>
//             <Card.Body>
//               <Row className="g-3">
//                 <Col md={3}>
//                   <Form.Label>Amount*</Form.Label>
//                   <Form.Control
//                     type="number"
//                     placeholder="Amount"
//                     value={newExpense.amount}
//                     onChange={(e) =>
//                       setNewExpense({ ...newExpense, amount: e.target.value })
//                     }
//                   />
//                 </Col>

//                 <Col md={3}>
//                   <Form.Label>Description*</Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="Description"
//                     value={newExpense.description}
//                     onChange={(e) =>
//                       setNewExpense({
//                         ...newExpense,
//                         description: e.target.value,
//                       })
//                     }
//                   />
//                 </Col>

//                 <Col md={2}>
//                   <Form.Label>Category</Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="Category"
//                     value={newExpense.category}
//                     onChange={(e) =>
//                       setNewExpense({ ...newExpense, category: e.target.value })
//                     }
//                   />
//                 </Col>

//                 <Col md={2}>
//                   <Form.Label>Payment Method</Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="Payment Method"
//                     value={newExpense.paymentMethod}
//                     onChange={(e) =>
//                       setNewExpense({
//                         ...newExpense,
//                         paymentMethod: e.target.value,
//                       })
//                     }
//                   />
//                 </Col>

//                 <Col md={2}>
//                   <Form.Label>Tags (comma separated)</Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="Tags"
//                     value={newExpense.tags}
//                     onChange={(e) =>
//                       setNewExpense({ ...newExpense, tags: e.target.value })
//                     }
//                   />
//                 </Col>

//                 <Col md={12} className="d-flex justify-content-end">
//                   {editingExpense ? (
//                     <>
//                       <Button
//                         variant="primary"
//                         className="me-2"
//                         onClick={handleUpdatePersonalExpense}
//                       >
//                         Update Expense
//                       </Button>
//                       <Button
//                         variant="outline-secondary"
//                         onClick={() => {
//                           setEditingExpense(null);
//                           setNewExpense({
//                             amount: "",
//                             description: "",
//                             category: "",
//                             paymentMethod: "",
//                             tags: "",
//                           });
//                         }}
//                       >
//                         Cancel
//                       </Button>
//                     </>
//                   ) : (
//                     <Button
//                       variant="success"
//                       onClick={handleAddPersonalExpense}
//                       disabled={!newExpense.amount || !newExpense.description}
//                     >
//                       <FaPlus className="me-1" /> Add Expense
//                     </Button>
//                   )}
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>

//           {/* Expenses Table */}
//           {filteredExpenses.length > 0 ? (
//             <>
//               <ExpenseTable
//                 expenses={displayedExpenses}
//                 onEdit={handleEditPersonalExpense}
//                 onDelete={handleDeletePersonalExpense}
//               />

//               {/* Pagination */}
//               {totalPages > 1 && (
//                 <div className="d-flex justify-content-center mt-4">
//                   <Pagination>
//                     <Pagination.Prev
//                       disabled={currentPage === 1}
//                       onClick={() =>
//                         setCurrentPage((prev) => Math.max(1, prev - 1))
//                       }
//                     />
//                     {paginationItems}
//                     <Pagination.Next
//                       disabled={currentPage === totalPages}
//                       onClick={() =>
//                         setCurrentPage((prev) => Math.min(totalPages, prev + 1))
//                       }
//                     />
//                   </Pagination>
//                 </div>
//               )}
//             </>
//           ) : (
//             <Alert variant="info" className="text-center py-4">
//               {personalExpenses.filter((e) => e.userId === user.id).length > 0
//                 ? "No expenses match your filters. Try adjusting your search criteria."
//                 : "No personal expenses added yet. Add your first expense using the form above."}
//             </Alert>
//           )}
//         </Card.Body>
//       </Card>

//       {/* Custom CSS */}
//       <style jsx>{`
//         .personal-expenses-container {
//           padding: 1rem;
//         }

//         .filter-card {
//           border: 1px solid rgba(0, 0, 0, 0.08);
//           border-radius: 12px;
//         }

//         .filter-card .card-header {
//           background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
//           border-bottom: 1px solid rgba(0, 0, 0, 0.05);
//           font-weight: 600;
//         }

//         @media (max-width: 768px) {
//           .personal-expenses-container {
//             padding: 0.5rem;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default PersonalExpenses;
