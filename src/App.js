import React from 'react';
import './App.css'; // Add global styles if necessary
import InvoiceForm from './components/InvoiceForm'; // Assuming the InvoiceForm component is in a components folder

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Invoice Generator</h1>
      </header>
      <main>
        <InvoiceForm /> {/* Rendering the InvoiceForm component */}
      </main>
    </div>
  );
};

export default App;
