import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";



async function main() {
    const PORT = config.port
    try {
        await prisma.$connect()
        app.listen(PORT, () => {
            console.log(`server is running on port ${PORT}`);
        })
        console.log("connected to the database successfully")

    } catch (error) {
        console.error('Error starting server:', error);
        await prisma.$disconnect()
        process.exit(1);
    }
}

main()

export default app;