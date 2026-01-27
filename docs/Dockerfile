# Stage 1: Build Jekyll Site
FROM ruby:3.1-alpine AS builder

# 设置字符编码
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# 安装必要的编译组件
RUN apk add --no-cache build-base gcc cmake git

# 安装 Jekyll 及其插件
RUN gem install jekyll jekyll-relative-links

WORKDIR /srv/jekyll
COPY . .

# 设置环境并构建
ENV JEKYLL_ENV=production
RUN jekyll build --trace

# Stage 2: Serve content with Nginx
FROM nginx:alpine
# 覆盖默认配置
COPY nginx.conf /etc/nginx/nginx.conf
# 复制生成的静态文件
COPY --from=builder /srv/jekyll/_site /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
