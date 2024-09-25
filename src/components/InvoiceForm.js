import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// import '../styles/InvoiceStyles.css';
import { 
    Container, 
    Grid, 
    Paper, 
    Typography, 
    TextField, 
    Select, 
    MenuItem, 
    Button, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow 
  } from '@mui/material';

const states = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

const gstSlabs = [5, 12, 18, 28]; // GST slabs

const InvoiceForm = () => {
  const [items, setItems] = useState([{ description: '', quantity: 1, rate: 0, total: 0, gstRate: 18, cgst: 0, sgst: 0, igst: 0 }]);
  const [buyerInfo, setBuyerInfo] = useState({ companyName: '', gstNumber: '', state: '' });
  const [sellerInfo, setSellerInfo] = useState({ companyName: '', gstNumber: '', state: '' });
  const [invoiceDetails, setInvoiceDetails] = useState({ invoiceNumber: '', invoiceDate: '' });
  const [isInterState, setIsInterState] = useState(false);

  const invoiceRef = useRef(null);

  useEffect(() => {
    setIsInterState(buyerInfo.state !== sellerInfo.state);
  }, [buyerInfo.state, sellerInfo.state]);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0, total: 0, gstRate: 18, cgst: 0, sgst: 0, igst: 0 }]);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
  
    // Recalculate total and GST whenever quantity, rate, or gstRate changes
    if (field === 'quantity' || field === 'rate' || field === 'gstRate') {
      const quantity = updatedItems[index].quantity;
      const rate = updatedItems[index].rate;
      const gstRate = updatedItems[index].gstRate;
  
      updatedItems[index].total = quantity * rate;
  
      const gstAmount = (updatedItems[index].total * gstRate) / 100;
      if (isInterState) {
        updatedItems[index].igst = gstAmount;
        updatedItems[index].cgst = 0;
        updatedItems[index].sgst = 0;
      } else {
        updatedItems[index].igst = 0;
        updatedItems[index].cgst = gstAmount / 2;
        updatedItems[index].sgst = gstAmount / 2;
      }
    }
  
    setItems(updatedItems);
  };

  const handleBuyerInfoChange = (field, value) => {
    setBuyerInfo({ ...buyerInfo, [field]: value });
    if (field === 'state') {
      setIsInterState(value !== sellerInfo.state);
    }
  };

  const handleSellerInfoChange = (field, value) => {
    setSellerInfo({ ...sellerInfo, [field]: value });
    if (field === 'state') {
      setIsInterState(buyerInfo.state !== value);
    }
  };
  const calculateTotals = () => {
    let subtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    items.forEach(item => {
      subtotal += item.total;
      totalCGST += item.cgst;
      totalSGST += item.sgst;
      totalIGST += item.igst;
    });

    const grandTotal = subtotal + totalCGST + totalSGST + totalIGST;

    return { subtotal, totalCGST, totalSGST, totalIGST, grandTotal };
  };


  const { subtotal, totalCGST, totalSGST, totalIGST, grandTotal } = calculateTotals();

  const generatePDF = () => {
    const input = invoiceRef.current;
    const buttonsToHide = input.querySelectorAll('.no-pdf');
    
    // Temporarily hide the buttons
    buttonsToHide.forEach(button => {
      button.style.display = 'none';
    });

    html2canvas(input, { 
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('invoice.pdf');

      // Restore the buttons after PDF generation
      buttonsToHide.forEach(button => {
        button.style.display = '';
      });
    });
  };

  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }} ref={invoiceRef}>
        <Typography component="h1" variant="h4" color="primary" gutterBottom>
          Invoice
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="invoiceNumber"
              name="invoiceNumber"
              label="Invoice Number"
              fullWidth
              variant="outlined"
              value={invoiceDetails.invoiceNumber}
              onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceNumber: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="invoiceDate"
              name="invoiceDate"
              label="Invoice Date"
              type="date"
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={invoiceDetails.invoiceDate}
              onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceDate: e.target.value })}
            />
          </Grid>
        </Grid>

        <Typography component="h2" variant="h5" color="primary" gutterBottom sx={{ mt: 4 }}>
          Buyer Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="buyerCompany"
              name="buyerCompany"
              label="Company Name"
              fullWidth
              variant="outlined"
              value={buyerInfo.companyName}
              onChange={(e) => handleBuyerInfoChange('companyName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="buyerGST"
              name="buyerGST"
              label="GST Number"
              fullWidth
              variant="outlined"
              value={buyerInfo.gstNumber}
              onChange={(e) => handleBuyerInfoChange('gstNumber', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Select
              required
              variant="outlined"
              id="buyerState"
              value={buyerInfo.state}
              onChange={(e) => handleBuyerInfoChange('state', e.target.value)}
              fullWidth
              displayEmpty
              renderValue={(selected) => {
                if (!selected) {
                  return <em>Select State</em>;
                }
                return selected;
              }}
            >
              <MenuItem value="" disabled>
                <em>Select State</em>
              </MenuItem>
              {states.map((state) => (
                <MenuItem key={state} value={state}>{state}</MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>

        <Typography component="h2" variant="h5" color="primary" gutterBottom sx={{ mt: 4 }}>
          Seller Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="sellerCompany"
              name="sellerCompany"
              label="Company Name"
              fullWidth
              variant="outlined"
              value={sellerInfo.companyName}
              onChange={(e) => handleSellerInfoChange('companyName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="sellerGST"
              name="sellerGST"
              label="GST Number"
              fullWidth
              variant="outlined"
              value={sellerInfo.gstNumber}
              onChange={(e) => handleSellerInfoChange('gstNumber', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Select
              required
              id="sellerState"
              value={sellerInfo.state}
              onChange={(e) => handleSellerInfoChange('state', e.target.value)}
              fullWidth
              displayEmpty
              renderValue={(selected) => {
                if (!selected) {
                  return <em>Select State</em>;
                }
                return selected;
              }}
            >
              <MenuItem value="" disabled>
                <em>Select State</em>
              </MenuItem>
              {states.map((state) => (
                <MenuItem key={state} value={state}>{state}</MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>

        <Typography component="h2" variant="h5" color="primary" gutterBottom sx={{ mt: 4 }}>
          Invoice Items
        </Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="invoice items table">
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Rate</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">GST Slab</TableCell>
                {isInterState ? (
                  <TableCell align="right">IGST</TableCell>
                ) : (
                  <>
                    <TableCell align="right">CGST</TableCell>
                    <TableCell align="right">SGST</TableCell>
                  </>
                )}
                 <TableCell align="right" className="no-pdf">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    <TextField
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value))}
                    />
                  </TableCell>
                  <TableCell align="right">{item.total.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Select
                      value={item.gstRate}
                      onChange={(e) => handleItemChange(index, 'gstRate', parseInt(e.target.value))}
                    >
                      {gstSlabs.map((slab) => (
                        <MenuItem key={slab} value={slab}>{slab}%</MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  {isInterState ? (
                    <TableCell align="right">{item.igst.toFixed(2)}</TableCell>
                  ) : (
                    <>
                      <TableCell align="right">{item.cgst.toFixed(2)}</TableCell>
                      <TableCell align="right">{item.sgst.toFixed(2)}</TableCell>
                    </>
                  )}
                  <TableCell align="right" className="no-pdf">
                    <Button className='no-pdf' variant="contained" color="secondary" onClick={() => removeItem(index)}>
                       Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button variant="contained" color="primary" onClick={addItem} sx={{ mt: 2 }} className="no-pdf">
          Add Item
        </Button>

        {/* Add totals section */}
        <TableContainer component={Paper} sx={{ mt: 4, width: '50%', marginLeft: 'auto' }}>
  <Table>
    <TableBody>
      <TableRow>
        <TableCell align="right"><strong>Subtotal</strong></TableCell>
        <TableCell align="right">{subtotal.toFixed(2)}</TableCell>
      </TableRow>
      {isInterState ? (
        <TableRow>
          <TableCell align="right"><strong>IGST</strong></TableCell>
          <TableCell align="right">{totalIGST.toFixed(2)}</TableCell>
        </TableRow>
      ) : (
        <>
          <TableRow>
            <TableCell align="right"><strong>CGST</strong></TableCell>
            <TableCell align="right">{totalCGST.toFixed(2)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="right"><strong>SGST</strong></TableCell>
            <TableCell align="right">{totalSGST.toFixed(2)}</TableCell>
          </TableRow>
        </>
      )}
      <TableRow>
        <TableCell align="right"><strong>Grand Total</strong></TableCell>
        <TableCell align="right"><strong>{grandTotal.toFixed(2)}</strong></TableCell>
      </TableRow>
    </TableBody>
  </Table>
</TableContainer>


        <Button variant="contained" color="primary" onClick={generatePDF} sx={{ mt: 4 }} className="no-pdf">
          Generate PDF
        </Button>
      </Paper>
    </Container>
  );
}

export default InvoiceForm;