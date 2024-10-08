import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const FormComponent = () => {
  const [date, setDate] = useState(new Date());
  const [sellingPrice, setSellingPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);

  const submitData = () => {
    const data = {
      date,
      sellingPrice,
      costPrice,
    };

    fetch(`${backendUrl}/api/sales`, { 
      
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => console.log('Success:', data))
    .catch(error => console.error('Error:', error));
   };

    fetch('/api/sales', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => console.log('Success:', data))
    .catch(error => console.error('Error:', error));
  };

  return (
    <div>
      <DatePicker selected={date} onChange={(date) => setDate(date)} />
      <input
        type="number"
        value={sellingPrice}
        onChange={(e) => setSellingPrice(e.target.value)}
        placeholder="Enter selling price"
      />
      <input
        type="number"
        value={costPrice}
        onChange={(e) => setCostPrice(e.target.value)}
        placeholder="Enter cost price"
      />
      <button onClick={submitData}>Submit</button>
    </div>
  );


export default FormComponent;
