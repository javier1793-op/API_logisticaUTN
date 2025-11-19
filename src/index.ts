import colors from 'colors'
import server, { connectDB } from './server'

const port = process.env.PORT || 4000

async function startApplication() {
    try {
 
        await connectDB(); 

        server.listen(port, () => {
            console.log(colors.cyan.bold(`REST API en el puerto ${port}`));
        });
    } catch (error) {
        console.error(colors.red.bold(`\n❌ ERROR FATAL: No se pudo iniciar la aplicación.\n`));
        process.exit(1); 
    }
}

startApplication();