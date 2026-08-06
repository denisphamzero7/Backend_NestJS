# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt tất cả dependencies (bao gồm cả devDependencies để build)
RUN npm ci

# Sao chép toàn bộ mã nguồn
COPY . .

# Build dự án NestJS (sẽ tạo ra thư mục dist)
RUN npm run build

# Stage 2: Chạy ứng dụng trong môi trường Production
FROM node:18-alpine AS runner

WORKDIR /app

# Chỉ cài đặt production dependencies để tối ưu dung lượng image
COPY package*.json ./
RUN npm ci --only=production

# Sao chép thư mục build từ Stage 1
COPY --from=builder /app/dist ./dist

# Expose port (theo PORT trong file .env mặc định là 8080)
EXPOSE 8080

# Chạy ứng dụng
CMD ["node", "dist/main"]
