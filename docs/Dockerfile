# Stage 1: Build Jekyll Site
FROM ruby:3.1-alpine AS builder

# 安装必要的编译组件（针对通用镜像）
RUN apk add --no-cache build-base gcc cmake git

# 安装 Jekyll
RUN gem install jekyll

WORKDIR /srv/jekyll
COPY . .

# 设置环境并构建
ENV JEKYLL_ENV=production
RUN jekyll build

# Stage 2: Serve content with Nginx
FROM nginx:alpine
COPY --from=builder /srv/jekyll/_site /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
