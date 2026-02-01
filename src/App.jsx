import { useEffect, useState } from 'react'
import './App.css'

function App() { // pieces of state

  const [draftDream, setDraftDream] = useState('') // whats currently inside the input box (doesnt have to be saved yet)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10)) // selected date is today, cuts date format to yyy-mm-dd
  const [status, setStatus] = useState('') // status message to show user
  
  async function handleSave() { // runs when you click save button
    const response = await fetch(`http://localhost:3001/api/dreams/${selectedDate}`, { // fetch to backend
      method: 'PUT', // PUT request to save/replace
      headers: { 'Content-Type': 'application/json' }, // tell server we're sending JSON
      body: JSON.stringify({ text: draftDream }), // send dream text in body
    });

    if (!response.ok) { // if response not ok
      setStatus('Error saving dream'); // show error status
      return;
    }

    const data = await response.json(); // parse JSON response
    setDraftDream(data.text); // keeps input synced with what server saved
  }

useEffect(() => { 
  async function fetchDream() { // fetch dream for selected date
    const response = await fetch(`http://localhost:3001/api/dreams/${selectedDate}`); // fetch from backend
    const data = await response.json(); // parse JSON response
    setDraftDream(data.text); // set draft dream to fetched text
  }

  fetchDream(); // call the async function
}, [selectedDate]); // run whenever selected date changes

  return (
    <> 
      <h1>dream journal</h1>
      <p>write down your dreams</p>
      <label>
        date:
        <input 
          type="date" // date input field
          value={selectedDate} // shows current selected date
          onChange={(e) => setSelectedDate(e.target.value)} // updates state
        />
      </label>

      <input /* input field to type dream */
        type="text" 
        value={draftDream}
        onChange={(e) => setDraftDream(e.target.value)} /* e.target input element, e.target.value current text inside input, setDream update state */
      />

      <button onClick={handleSave}> 
        Save dream
      </button> 

    </>
  )

}


export default App
