FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем остальные файлы приложения
COPY . .

# Создаем директорию для изображений, если её нет
RUN mkdir -p public/images && \
    chmod -R 755 public/images

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]

