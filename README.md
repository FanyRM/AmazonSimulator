# Clonar repositorio

git clone https://github.com/tu-usuario/AmazonSimulator.git
cd AmazonSimulator

# Instalar dependencias

npm install

# Iniciar servidor

npm start

# Uso básico Subir archivo

POST http://localhost:3000/s3/upload
Body: {
"bucket": "my-bucket",
"fileName": "image.jpg",
"base64Content": "..."
}
