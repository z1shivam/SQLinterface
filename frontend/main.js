const backendURL = 'http://localhost:8080';

fetch(backendURL)
  .then((res) => {
    return res.json()
  })
  .then((data) => {
    console.log(data); 
  })
  .catch((error) => {
    console.error('Error:', error);
  });

  document.getElementById('runButton').addEventListener('click', () => {
    const query = document.getElementById('mainQuery').value;
    console.log('SQL query:', query);
  });
  