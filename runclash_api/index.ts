import app from "./src/app";
import { connectToMongoDB } from "./src/database/mongodb";
import { PORT } from "./src/configs/constant";

connectToMongoDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server: http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
