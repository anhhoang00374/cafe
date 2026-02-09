import dotenv from 'dotenv';
import app from './app.js';
import { sequelize } from './models/index.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');

        // Sync models (creates tables or updates schema)
        await sequelize.sync({ alter: false });
        console.log('Database synced.');

        // app.listen(PORT, () => {
        //     console.log(`Server is running on port ${PORT}`);
        // });
        app.listen(5000, '0.0.0.0', () => {
            console.log('API running')
        })
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

startServer();
