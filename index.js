const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const port = 3000;

// Caminho para o arquivo JSON
const dataFilePath = path.join('C:', 'Users', 'Pichau', 'Desktop', 'node-js-api-with-mocked-data', 'data', 'users.json');

// Importa os dados mockados
let usersMock = require(dataFilePath);

// Middleware para permitir o envio de dados JSON
app.use(express.json());

// Classe User
class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
}

// Converte os dados mockados em uma lista de instâncias da classe User
let users = usersMock.map(user => new User(user.username, user.password));

// Função para salvar os dados no arquivo JSON
const saveUsersToFile = (usersList) => {
    fs.writeFile(dataFilePath, JSON.stringify(usersList, null, 2), (err) => {
        if (err) {
            console.error('Error saving users to file:', err);
        } else {
            console.log('Users saved successfully!');
        }
    });
};

// Rota GET para a página inicial
app.get('/', (req, res) => {
    res.send(`Servidor rodando na porta ${port}`);
});

// Rota GET para verificar se o usuário existe na lista
app.get('/login', (req, res) => {
    const {username, password} = req.query;

    // Verifica se os parâmetros foram passados
    if (!username || !password) {
        return res.status(400).json({message: 'Username and password are required'});
    }

    // Verifica se o usuário existe na lista
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        return res.status(200).json({message: 'Login successful'});
    } else {
        return res.status(401).json({message: 'Invalid username or password'});
    }
});

// Rota POST para adicionar um novo usuário
app.post('/register', (req, res) => {
    const {username, password} = req.body;

    // Verifica se os parâmetros foram passados
    if (!username || !password) {
        return res.status(400).json({message: 'Username and password are required'});
    }

    // Verifica se o usuário já existe
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.status(409).json({message: 'User already exists'});
    }

    // Cria um novo usuário e o adiciona à lista
    const newUser = new User(username, password);
    users.push(newUser);

    // Salva a lista de usuários no arquivo JSON
    saveUsersToFile(users);

    return res.status(201).json({message: 'User registered successfully', user: newUser});
});

// Rota GET para exibir todos os usuários cadastrados
app.get('/users', (req, res) => {
    // Cria uma lista de objetos contendo apenas os usernames (ou e-mails) sem as senhas
    const userList = users.map(user => ({username: user.username}));

    // Retorna a lista de usuários
    res.status(200).json({users: userList});
});

// Rota GET para verificar se um usuário existe com base no username e senha (opcional)
app.get('/users/:username', (req, res) => {
    const {username} = req.params;
    const {password} = req.query; // Senha é opcional

    // Verifica se o usuário existe na lista
    const user = users.find(u => u.username === username);

    // Se o usuário não for encontrado
    if (!user) {
        return res.status(404).json({message: 'User not found'});
    }

    // Se a senha foi fornecida, verifica se está correta
    if (password && user.password !== password) {
        return res.status(401).json({message: 'Invalid password'});
    }

    // Se o usuário for encontrado (e a senha for correta, se fornecida)
    return res.status(200).json({message: 'User found', username: user.username});
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
});
