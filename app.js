const express = require('express');
const mysql = require('mysql2/promise');

// Créez une connexion à la base de données MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dbwebservice'
};

const app = express();
app.use(express.json());

// Définissez la route pour le service principal
app.get('/dayfinder', async (req, res) => {
  const { date } = req.query;

  try {
    // Convertissez la date au format jj-mm-aaaa en objet Date
    const [day, month, year] = date.split('-');
    const searchDate = new Date(`${year}-${month}-${day}`);

    // Obtenez le jour de la semaine correspondant à la date donnée
    const dayOfWeek = searchDate.toLocaleString('fr-FR', { weekday: 'long' });

    // Enregistrez la recherche dans la base de données
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('INSERT INTO search_history (request, response) VALUES (?, ?)', [date, dayOfWeek]);

    res.json({ date: date, dayOfWeek: dayOfWeek });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// Définissez la route pour l'historique des recherches
app.get('/dayfinder/historique', async (req, res) => {
  try {
    // Récupérez l'historique des recherches depuis la base de données
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM search_history');
    const searchHistory = rows.map((row) => ({
      id: row.id,
      searchDate: row.search_date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ''),
      searchItens: {
        request: row.request,
        response: row.response
      }
    }));

    res.json(searchHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// Lancez le serveur
app.listen(8080, () => {
  console.log(' webservice disponible sur http://localhost:8080');
});
