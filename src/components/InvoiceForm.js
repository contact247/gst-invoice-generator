import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../styles/InvoiceStyles.css';

const states = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

const gstSlabs = [5, 12, 18, 28]; // GST slabs

const InvoiceForm = () => {
  const [items, setItems] = useState([{ description: '', quantity: 1, rate: 0, total: 0, gstRate: 18, cgst: 0, sgst: 0, igst: 0 }]);
  const [buyerInfo, setBuyerInfo] = useState({ companyName: '', gstNumber: '', state: '' });
  const [sellerInfo, setSellerInfo] = useState({ companyName: '', gstNumber: '', state: '' });
  const [invoiceDetails, setInvoiceDetails] = useState({ invoiceNumber: '', invoiceDate: '' });
  const [isInterState, setIsInterState] = useState(false);

  useEffect(() => {
    setIsInterState(buyerInfo.state !== sellerInfo.state);
  }, [buyerInfo.state, sellerInfo.state]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    const total = updatedItems[index].quantity * updatedItems[index].rate;
    updatedItems[index].total = total;

    const gstRate = updatedItems[index].gstRate;
    if (isInterState) {
      updatedItems[index].igst = (total * gstRate) / 100;
      updatedItems[index].cgst = 0;
      updatedItems[index].sgst = 0;
    } else {
      const taxSplit = (total * gstRate) / 200;
      updatedItems[index].cgst = taxSplit;
      updatedItems[index].sgst = taxSplit;
      updatedItems[index].igst = 0;
    }

    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0, total: 0, gstRate: 18, cgst: 0, sgst: 0, igst: 0 }]);
  };

  const removeItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const generatePDF = () => {
    const input = document.getElementById('invoice');
    html2canvas(input, {
      scale: 2, 
      width: input.scrollWidth + 40, // Increased width to prevent right-side cut-off
      scrollX: 0,
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('invoice.pdf');
    });
  };

  return (
    <div className="invoice-container">
      <div className="invoice-form" id="invoice">
        <h2>Invoice</h2>

        <div className="invoice-details">
          <label>Invoice Number:</label>
          <input
            type="text"
            value={invoiceDetails.invoiceNumber}
            onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceNumber: e.target.value })}
          />

          <label>Invoice Date:</label>
          <input
            type="date"
            value={invoiceDetails.invoiceDate}
            onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceDate: e.target.value })}
          />
        </div>

        <div className="buyer-seller-info">
          <div>
            <h3>Buyer Information</h3>
            <label>Company Name:</label>
            <input
              type="text"
              value={buyerInfo.companyName}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, companyName: e.target.value })}
            />

            <label>GST Number:</label>
            <input
              type="text"
              value={buyerInfo.gstNumber}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, gstNumber: e.target.value })}
            />

            <label>State:</label>
            <select value={buyerInfo.state} onChange={(e) => setBuyerInfo({ ...buyerInfo, state: e.target.value })}>
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h3>Seller Information</h3>
            <label>Company Name:</label>
            <input
              type="text"
              value={sellerInfo.companyName}
              onChange={(e) => setSellerInfo({ ...sellerInfo, companyName: e.target.value })}
            />

            <label>GST Number:</label>
            <input
              type="text"
              value={sellerInfo.gstNumber}
              onChange={(e) => setSellerInfo({ ...sellerInfo, gstNumber: e.target.value })}
            />

            <label>State:</label>
            <select value={sellerInfo.state} onChange={(e) => setSellerInfo({ ...sellerInfo, state: e.target.value })}>
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th className="quantity">Quantity</th>
              <th className="rate">Rate</th>
              <th>Total</th>
              <th>GST Slab</th>
              {isInterState ? <th>IGST</th> : <>
                <th>CGST</th>
                <th>SGST</th>
              </>}
              <th className="no-pdf">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  />
                </td>
                <td className="quantity">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  />
                </td>
                <td className="rate">
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                  />
                </td>
                <td>{item.total.toFixed(2)}</td>
                <td>
                  <select
                    value={item.gstRate}
                    onChange={(e) => handleItemChange(index, 'gstRate', e.target.value)}
                  >
                    {gstSlabs.map((slab) => (
                      <option key={slab} value={slab}>
                        {slab}%
                      </option>
                    ))}
                  </select>
                </td>
                {isInterState ? (
                  <td>{item.igst.toFixed(2)}</td>
                ) : (
                  <>
                    <td>{item.cgst.toFixed(2)}</td>
                    <td>{item.sgst.toFixed(2)}</td>
                  </>
                )}
                 <td className="no-pdf">
                  <button onClick={() => removeItem(index)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="no-pdf" onClick={addItem}>Add Item</button>
      </div>
      <button className="no-pdf" onClick={generatePDF}>Download PDF</button>
    </div>
  );
};

export default InvoiceForm;
